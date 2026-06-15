import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { incrementAiUsage, checkFeatureAccess } from '@/lib/plan-gate'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

    const user = await getPrivyUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limit / beta limit before doing any heavy work
    const access = await checkFeatureAccess(user.id, 'ai_analysis')
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.reason || 'AI analysis limit reached', upgrade: !access.betaLimitReached },
        { status: 403 }
      )
    }

    const supabase = createClient()

    // Fetch project + verify ownership (IDOR protection)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // [NEW] Fetch last 3 analyses for memory context (limit 3, newest first)
    const { data: previousAnalyses } = await supabase
      .from('ai_analyses')
      .select('potential_score, bull_case, bear_case, summary, recommendation, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(3)

    // Build memory context string if past analyses exist
    const memoryContext = previousAnalyses && previousAnalyses.length > 0
      ? `
HISTORICAL ANALYSIS SNAPSHOTS (most recent first):
${previousAnalyses.map((a, i) => `
Snapshot ${i + 1} — ${new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}:
  Score: ${a.potential_score}/100
  Recommendation: ${a.recommendation}
  Bull Case: ${a.bull_case || a.summary || 'N/A'}
  Bear Case: ${a.bear_case || 'N/A'}
`).join('')}

Based on the above history, note any significant changes in score or sentiment and explain why.
`
      : ''

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
You are an expert crypto and airdrop analyst. Analyze the following airdrop project and provide an objective, structured assessment.

PROJECT DETAILS:
Name: ${project.name}
Chain: ${project.chain || 'Unknown'}
Type: ${project.project_type}
Difficulty: ${project.difficulty || 'Unknown'}
Estimated Reward: ${project.estimated_reward || 'Unknown'}
Mint Price: ${project.mint_price || 'N/A'}
Deadline: ${project.deadline || 'Unknown'}
Website: ${project.website || 'None'}
Twitter/X: ${project.twitter_url || 'None'}
Notes/Context: ${project.notes || 'None'}

${memoryContext}

Using your knowledge of the crypto ecosystem, airdrop meta, on-chain activity patterns, and tokenomics, provide a comprehensive analysis in STRICTLY VALID JSON matching this schema:

{
  "potential_score": number (0-100, be precise and critical — not everyone is a 70+),
  "recommendation": "SKIP" | "WATCH" | "FARM" | "PRIORITY FARM",
  "bull_case": "string (2-3 sentences: why this project could be a big win. Focus on unique strengths, backers, TVL signals, or community traction.)",
  "bear_case": "string (2-3 sentences: honest risks and red flags. Be critical.)",
  "key_risks": ["string", "string"] (specific actionable risks, max 4. Empty array if none.),
  "funding_status": "string (1 sentence: known funding, investors, or 'No public funding data available')",
  "summary": "string (Legacy field. Write a 1-2 sentence neutral overview.)",
  "red_flags": ["string"] (legacy, mirror key_risks here too),
  "green_flags": ["string"] (2-4 specific green flags),
  "reasoning": "string (1 paragraph explaining the recommendation. If historical data exists, comment on score trend.)"
}

Return ONLY valid JSON. No markdown, no backticks, no extra text.
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()

    let analysisData
    try {
      analysisData = JSON.parse(cleanedText)
    } catch (e) {
      console.error('Failed to parse Gemini response:', responseText)
      return NextResponse.json({ error: 'AI returned invalid format. Please try again.' }, { status: 500 })
    }

    const validRecommendations = ['SKIP', 'WATCH', 'FARM', 'PRIORITY FARM']
    if (!validRecommendations.includes(analysisData.recommendation)) {
      analysisData.recommendation = 'WATCH'
    }

    // [FIX] Always INSERT — every analysis is a historical snapshot
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('ai_analyses')
      .insert({
        project_id: projectId,
        user_id: user.id,
        potential_score: Number(analysisData.potential_score) || 50,
        recommendation: analysisData.recommendation,
        // New fields
        bull_case: String(analysisData.bull_case || ''),
        bear_case: String(analysisData.bear_case || ''),
        key_risks: Array.isArray(analysisData.key_risks) ? analysisData.key_risks : [],
        funding_status: String(analysisData.funding_status || 'No public funding data available'),
        // Legacy fields — kept for backward compat
        summary: String(analysisData.summary || analysisData.bull_case || ''),
        red_flags: Array.isArray(analysisData.red_flags) ? analysisData.red_flags : [],
        green_flags: Array.isArray(analysisData.green_flags) ? analysisData.green_flags : [],
        reasoning: String(analysisData.reasoning || ''),
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving analysis:', saveError)
      return NextResponse.json(
        { error: `Failed to save analysis: ${saveError.message}` },
        { status: 500 }
      )
    }

    // Increment usage counter only after successful save
    await incrementAiUsage(user.id, 'analysis')

    return NextResponse.json(savedAnalysis)

  } catch (error: any) {
    console.error('AI Analysis API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
