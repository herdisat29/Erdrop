'use server'

import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { checkFeatureAccess, incrementAiUsage } from '@/lib/plan-gate'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function generateFarmingPlan() {
  const user = await getPrivyUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()

  // Plan-based rate limiting
  const access = await checkFeatureAccess(user.id, 'ai_plan')
  if (!access.allowed) {
    return { error: access.reason, upgrade: !access.betaLimitReached }
  }

  // Fetch existing farming plan for upsert
  const { data: recentPlans } = await supabase
    .from('farming_plans')
    .select('id, generation_count, last_generated_at')
    .eq('user_id', user.id)
    .single()

  // Fetch active projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select('name, chain, status, difficulty, estimated_reward, deadline, notes')
    .eq('user_id', user.id)
    .in('status', ['Not Started', 'In Progress', 'Eligible'])
    .order('deadline', { ascending: true })

  if (error) return { error: `Failed to fetch projects: ${error.message}` }
  if (!projects || projects.length === 0) return { error: 'No active projects found. Add some projects to generate a plan.' }

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

    const newCount = (recentPlans?.generation_count ?? 0) + 1
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

    // Track usage in profiles table for plan gating
    await incrementAiUsage(user.id, 'plan')

    return { plan, remaining: (access as any).remaining ? (access as any).remaining - 1 : 0 }
  } catch (err: any) {
    console.error('AI Generation failed:', err)
    return { error: `AI generation failed: ${err.message}` }
  }
}

export async function getFarmingPlan() {
  const user = await getPrivyUser()
  if (!user) return { plan: null, remaining: 0 }

  const supabase = createClient()

  const { data } = await supabase
    .from('farming_plans')
    .select('plan_data, generation_count, last_generated_at')
    .eq('user_id', user.id)
    .single()

  if (!data) return { plan: null, remaining: 1 }

  // Get remaining from plan gate
  const access = await checkFeatureAccess(user.id, 'ai_plan')
  const remaining = (access as any).remaining ?? 0

  return { plan: data.plan_data, remaining }
}

export async function deleteFarmingPlan() {
  const user = await getPrivyUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()
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
