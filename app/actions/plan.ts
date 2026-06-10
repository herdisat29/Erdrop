'use server'

import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const RATE_LIMIT_PER_24H = 5

export async function generateFarmingPlan() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // [FIX] Real rate limiting: count plan generations in last 24h via updated_at
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: recentPlans, error: countError } = await supabase
    .from('farming_plans')
    .select('id, generation_count, last_generated_at')
    .eq('user_id', user.id)
    .single()

  // Track generation count in the farming_plans row itself
  const currentCount = recentPlans?.generation_count ?? 0
  const lastGenerated = recentPlans?.last_generated_at
  const isWithin24h = lastGenerated && new Date(lastGenerated) > new Date(since)

  // Count resets if last gen was >24h ago
  const effectiveCount = isWithin24h ? currentCount : 0

  if (effectiveCount >= RATE_LIMIT_PER_24H) {
    const resetAt = new Date(new Date(lastGenerated!).getTime() + 24 * 60 * 60 * 1000)
    const hoursLeft = Math.ceil((resetAt.getTime() - Date.now()) / (1000 * 60 * 60))
    return { error: `Rate limit reached (${RATE_LIMIT_PER_24H}/day). Resets in ~${hoursLeft} hour(s).` }
  }

  // Fetch active projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select('name, chain, status, difficulty, estimated_reward, deadline, notes')
    .in('status', ['Not Started', 'In Progress', 'Eligible'])
    .order('deadline', { ascending: true })

  if (error) {
    return { error: `Failed to fetch projects: ${error.message}` }
  }

  if (!projects || projects.length === 0) {
    return { error: 'No active projects found. Add some projects to generate a plan.' }
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
      You are an expert crypto airdrop farmer.
      Analyze the following list of active projects for a user and generate a 4-week "Farming Masterplan".
      Prioritize projects with approaching deadlines or high estimated rewards.
      Return ONLY a JSON array of weeks. Do not include markdown code blocks like \`\`\`json.
      
      Array Format:
      [
        {
          "weekNumber": 1,
          "title": "Week 1: High Priority Actions",
          "tasks": [
            { "projectName": "Project X", "actionItem": "Bridge funds to network and make first swap" }
          ]
        }
      ]

      User Projects:
      ${JSON.stringify(projects, null, 2)}
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    const plan = JSON.parse(cleanJson)

    const newCount = isWithin24h ? currentCount + 1 : 1
    const now = new Date().toISOString()

    if (recentPlans) {
      await supabase
        .from('farming_plans')
        .update({
          plan_data: plan,
          updated_at: now,
          generation_count: newCount,
          last_generated_at: now,
        })
        .eq('id', recentPlans.id)
    } else {
      await supabase
        .from('farming_plans')
        .insert({
          user_id: user.id,
          plan_data: plan,
          generation_count: 1,
          last_generated_at: now,
        })
    }

    return { plan, remaining: RATE_LIMIT_PER_24H - newCount }
  } catch (err: any) {
    console.error('AI Generation failed:', err)
    return { error: `AI generation failed: ${err.message}` }
  }
}

export async function getFarmingPlan() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { plan: null, remaining: RATE_LIMIT_PER_24H }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('farming_plans')
    .select('plan_data, generation_count, last_generated_at')
    .eq('user_id', user.id)
    .single()

  if (!data) return { plan: null, remaining: RATE_LIMIT_PER_24H }

  const isWithin24h = data.last_generated_at && new Date(data.last_generated_at) > new Date(since)
  const effectiveCount = isWithin24h ? (data.generation_count ?? 0) : 0
  const remaining = Math.max(0, RATE_LIMIT_PER_24H - effectiveCount)

  return { plan: data.plan_data, remaining }
}

/**
 * [NEW] Delete current farming plan so user can regenerate fresh.
 */
export async function deleteFarmingPlan() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('farming_plans')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting farming plan:', error)
    return { error: error.message }
  }

  return { success: true }
}
