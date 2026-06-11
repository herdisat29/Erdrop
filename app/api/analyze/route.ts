import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { incrementAiUsage, checkFeatureAccess } from '@/lib/plan-gate'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const { projectId, force } = await req.json()

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 })
    }

    const user = await getPrivyUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()

    // Check if analysis already exists
    const { data: existingAnalysis } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('project_id', projectId)
      .single()

    // If existing analysis and not forcing re-analysis, return it
    if (existingAnalysis && !force) {
      return NextResponse.json(existingAnalysis)
    }

    // Check access limits (handles both free total limit and pro force re-analyze logic)
    const access = await checkFeatureAccess(user.id, 'ai_analysis')
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || 'Upgrade to Beta Pro to analyze more projects', upgrade: !access.betaLimitReached }, { status: 403 })
    }

    // Fetch project details for context
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
      You are an expert crypto and airdrop analyst. Analyze the following airdrop project and provide an objective assessment.
      
      Project Details:
      Name: ${project.name}
      Chain: ${project.chain || 'Unknown'}
      Difficulty: ${project.difficulty || 'Unknown'}
      Estimated Reward: ${project.estimated_reward || 'Unknown'}
      Deadline: ${project.deadline || 'Unknown'}
      Notes/Context: ${project.notes || 'None'}
      Website: ${project.website || 'None'}
      Twitter/X: ${project.twitter_url || 'None'}

      Based on the provided details, your extensive knowledge of the crypto ecosystem, airdrop meta, and historical project performance, provide an analysis in strictly JSON format matching this schema:
      {
        "potential_score": number (0-100),
        "summary": "string (A 2-3 sentence overview of the project and its airdrop potential)",
        "red_flags": ["string", "string"] (list of potential risks or negatives. empty array if none),
        "green_flags": ["string", "string"] (list of positive indicators. empty array if none),
        "recommendation": "SKIP" | "WATCH" | "FARM" | "PRIORITY FARM" (Choose one exactly),
        "reasoning": "string (A brief paragraph explaining the recommendation)"
      }

      Return ONLY valid JSON. No markdown wrappers, no conversational text.
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()

    let analysisData
    try {
      analysisData = JSON.parse(cleanedText)
    } catch (e) {
      console.error('Failed to parse Gemini response:', responseText)
      return NextResponse.json({ error: 'AI returned invalid format' }, { status: 500 })
    }

    const validRecommendations = ['SKIP', 'WATCH', 'FARM', 'PRIORITY FARM']
    if (!validRecommendations.includes(analysisData.recommendation)) {
      analysisData.recommendation = 'WATCH'
    }

    const insertData = {
      project_id: projectId,
      potential_score: analysisData.potential_score,
      summary: analysisData.summary,
      red_flags: analysisData.red_flags || [],
      green_flags: analysisData.green_flags || [],
      recommendation: analysisData.recommendation,
      reasoning: analysisData.reasoning
    }

    let savedAnalysis
    let saveError

    if (existingAnalysis && force) {
      // Upsert/Update the existing one so we don't lose history or duplicate if we somehow get here
      const res = await supabase
        .from('ai_analyses')
        .update({
          potential_score: analysisData.potential_score,
          summary: analysisData.summary,
          red_flags: analysisData.red_flags || [],
          green_flags: analysisData.green_flags || [],
          recommendation: analysisData.recommendation,
          reasoning: analysisData.reasoning
        })
        .eq('id', existingAnalysis.id)
        .select()
        .single()
      savedAnalysis = res.data
      saveError = res.error
    } else {
      const res = await supabase
        .from('ai_analyses')
        .insert(insertData)
        .select()
        .single()
      savedAnalysis = res.data
      saveError = res.error
    }

    if (saveError) {
      console.error('Error saving analysis:', saveError)
      return NextResponse.json(insertData)
    }

    // Track AI usage for Free vs Pro gating logic
    await incrementAiUsage(user.id, 'analysis')

    return NextResponse.json(savedAnalysis)

  } catch (error: any) {
    console.error('AI Analysis API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
