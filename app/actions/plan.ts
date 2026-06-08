'use server'

import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function generateFarmingPlan() {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Rate Limiting Mock (In a real app, use Redis or Supabase table)
  // We'll skip strict rate limiting here to ensure it works for demo

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
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
    
    // Clean up potential markdown formatting from Gemini
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    const plan = JSON.parse(cleanJson)

    // Save to database
    // Check if plan exists
    const { data: existingPlan } = await supabase
      .from('farming_plans')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingPlan) {
      await supabase
        .from('farming_plans')
        .update({ plan_data: plan, updated_at: new Date().toISOString() })
        .eq('id', existingPlan.id)
    } else {
      await supabase
        .from('farming_plans')
        .insert({ user_id: user.id, plan_data: plan })
    }

    return { plan }
  } catch (err: any) {
    console.error("AI Generation failed:", err)
    return { error: `AI generation failed: ${err.message}` }
  }
}

export async function getFarmingPlan() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { plan: null }

  const { data, error } = await supabase
    .from('farming_plans')
    .select('plan_data')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return { plan: null }
  }

  return { plan: data.plan_data }
}
