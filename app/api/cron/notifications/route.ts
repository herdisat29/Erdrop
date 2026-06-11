import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  // Verify cron secret if needed
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient()
  
  // Calculate deadlines
  const now = new Date()
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000)

  // Token projects (H-24 hours)
  const { data: tokenProjects } = await supabase
    .from('projects')
    .select('id, user_id, name, deadline')
    .eq('project_type', 'Token')
    .gte('deadline', now.toISOString())
    .lte('deadline', in24Hours.toISOString())

  // NFT projects (H-3 hours)
  const { data: nftProjects } = await supabase
    .from('projects')
    .select('id, user_id, name, deadline')
    .eq('project_type', 'NFT')
    .gte('deadline', now.toISOString())
    .lte('deadline', in3Hours.toISOString())

  // Process Token Notifications
  if (tokenProjects && tokenProjects.length > 0) {
    for (const project of tokenProjects) {
      // Opsi A: Console log
      // Nanti replace dengan fetch email dari Privy API lalu kirim via Resend
      console.log(`[CRON] Would send email to user ${project.user_id} — Token Project "${project.name}" deadline in < 24 hours (${project.deadline})`)
    }
  }

  // Process NFT Notifications
  if (nftProjects && nftProjects.length > 0) {
    for (const project of nftProjects) {
      console.log(`[CRON] Would send email to user ${project.user_id} — NFT Project "${project.name}" minting in < 3 hours (${project.deadline})`)
    }
  }

  return NextResponse.json({ 
    success: true, 
    tokenAlerts: tokenProjects?.length || 0,
    nftAlerts: nftProjects?.length || 0
  })
}
