import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { privy } from '@/lib/privy/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  let errors: string[] = []

  // Process Token Notifications
  if (tokenProjects && tokenProjects.length > 0) {
    for (const project of tokenProjects) {
      try {
        const user = await privy.getUser(project.user_id)
        const email = user.email ? user.email.address : user.google?.email || user.discord?.email
        
        if (email) {
          console.log(`[CRON] Sending email to ${email} — Token Project "${project.name}" deadline in < 24 hours (${project.deadline})`)
          
          const res = await resend.emails.send({
            from: 'Erdrop <notifications@erdrop.app>',
            to: email,
            subject: `Upcoming Deadline: ${project.name}`,
            html: `
              <h2>Airdrop Deadline Approaching!</h2>
              <p>Your tracked token project <strong>${project.name}</strong> is reaching its deadline within 24 hours (${project.deadline}).</p>
              <p>Make sure you have completed all necessary tasks.</p>
              <br/>
              <p><a href="https://erdrop.app/projects">Open Erdrop Dashboard</a></p>
            `
          })
          if (res.error) {
            console.error(`[CRON] Resend error for user ${project.user_id}:`, res.error)
            errors.push(`Token ${project.name}: ${res.error.message}`)
          }
        } else {
          console.log(`[CRON] User ${project.user_id} has no email linked. Skipping.`)
        }
      } catch (error: any) {
        console.error(`[CRON] Failed to send email to user ${project.user_id}:`, error)
        errors.push(`Token ${project.name}: ${error.message}`)
      }
    }
  }

  // Process NFT Notifications
  if (nftProjects && nftProjects.length > 0) {
    for (const project of nftProjects) {
      try {
        const user = await privy.getUser(project.user_id)
        const email = user.email ? user.email.address : user.google?.email || user.discord?.email
        
        if (email) {
          console.log(`[CRON] Sending email to ${email} — NFT Project "${project.name}" minting in < 3 hours (${project.deadline})`)
          
          const res = await resend.emails.send({
            from: 'Erdrop <notifications@erdrop.app>',
            to: email,
            subject: `NFT Minting Soon: ${project.name}`,
            html: `
              <h2>NFT Minting Reminder!</h2>
              <p>Your tracked NFT project <strong>${project.name}</strong> is minting in less than 3 hours (${project.deadline}).</p>
              <p>Prepare your wallet and make sure you're ready to mint.</p>
              <br/>
              <p><a href="https://erdrop.app/projects">Open Erdrop Dashboard</a></p>
            `
          })
          if (res.error) {
            console.error(`[CRON] Resend error for user ${project.user_id}:`, res.error)
            errors.push(`NFT ${project.name}: ${res.error.message}`)
          }
        } else {
          console.log(`[CRON] User ${project.user_id} has no email linked. Skipping.`)
        }
      } catch (error: any) {
        console.error(`[CRON] Failed to send email to user ${project.user_id}:`, error)
        errors.push(`NFT ${project.name}: ${error.message}`)
      }
    }
  }

  return NextResponse.json({ 
    success: true, 
    tokenAlerts: tokenProjects?.length || 0,
    nftAlerts: nftProjects?.length || 0,
    errors: errors.length > 0 ? errors : undefined
  })
}
