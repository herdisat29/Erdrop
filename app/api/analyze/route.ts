import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Google Generative AI SDK
// It requires GEMINI_API_KEY in process.env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json()

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 })
    }

    const supabase = await createClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if analysis already exists
    const { data: existingAnalysis } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (existingAnalysis) {
      return NextResponse.json(existingAnalysis)
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

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

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
    
    // Clean up potential markdown JSON wrappers
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()
    
    let analysisData
    try {
      analysisData = JSON.parse(cleanedText)
    } catch (e) {
      console.error('Failed to parse Gemini response:', responseText)
      return NextResponse.json({ error: 'AI returned invalid format' }, { status: 500 })
    }

    // Validate recommendation enum
    const validRecommendations = ['SKIP', 'WATCH', 'FARM', 'PRIORITY FARM']
    if (!validRecommendations.includes(analysisData.recommendation)) {
      analysisData.recommendation = 'WATCH'
    }

    // Insert to database
    const insertData = {
      project_id: projectId,
      potential_score: analysisData.potential_score,
      summary: analysisData.summary,
      red_flags: analysisData.red_flags || [],
      green_flags: analysisData.green_flags || [],
      recommendation: analysisData.recommendation,
      reasoning: analysisData.reasoning
    }

    const { data: savedAnalysis, error: saveError } = await supabase
      .from('ai_analyses')
      .insert(insertData)
      .select()
      .single()

    if (saveError) {
      console.error('Error saving analysis:', saveError)
      // Even if saving fails, return the analysis to the user so it's not a total failure
      return NextResponse.json(insertData)
    }

    return NextResponse.json(savedAnalysis)

  } catch (error: any) {
    console.error('AI Analysis API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
