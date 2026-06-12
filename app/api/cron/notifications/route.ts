import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { privy } from '@/lib/privy/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export const dynamic = 'force-dynamic'

function formatUTCDate(dateStr: string) {
  if (!dateStr) return 'TBA';
  try {
    const d = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = days[d.getUTCDay()];
    const monthName = months[d.getUTCMonth()];
    const date = d.getUTCDate();
    const year = d.getUTCFullYear();
    let hours = d.getUTCHours();
    const minutes = d.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${dayName}, ${monthName} ${date}, ${year} at ${hours}:${minutes} ${ampm} UTC`;
  } catch (e) {
    return dateStr;
  }
}

const getTokenHtml = (project: any) => {
  const eventName = project.event_type || 'Token Airdrop';
  const badgeText = project.event_type ? `⏰ ${project.event_type.toUpperCase()} ALERT` : '⏰ 24-HOUR DEADLINE ALERT';

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #4b4b4d; padding: 40px 20px; color: #ffffff;">
  <div style="max-width: 500px; margin: 0 auto; text-align: center;">
    
    <div style="background-color: #a855f7; display: inline-block; padding: 10px 24px; border-radius: 999px; font-weight: bold; font-size: 20px; margin-bottom: 24px; color: white;">
      💧 Erdrop
    </div>

    <div style="display: inline-block; border: 1px solid #c2855f; color: #e2a884; padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: bold; letter-spacing: 1px; margin-bottom: 24px;">
      ${badgeText}
    </div>

    <div style="background-color: #545461; border-radius: 20px; padding: 32px; text-align: left; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
      <div style="font-size: 12px; font-weight: bold; color: #a1a1aa; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">${eventName}</div>
      <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 24px 0; color: #ffffff;">${project.name}</h1>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="border-bottom: 1px solid #71717a;">
          <td style="padding: 12px 0; color: #a1a1aa; font-size: 14px;">Network</td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #ffffff; font-size: 14px;">${project.chain || '-'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #71717a;">
          <td style="padding: 12px 0; color: #a1a1aa; font-size: 14px;">Est. Reward</td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #c084fc; font-size: 14px;">${project.estimated_reward || '-'}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #a1a1aa; font-size: 14px;">Status</td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #ffffff; font-size: 14px;">${project.status || '-'}</td>
        </tr>
      </table>

      <div style="border: 1px solid #71717a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: bold; color: #e2a884; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Date / Time</div>
        <div style="font-size: 16px; font-weight: bold; color: #ffffff;">${formatUTCDate(project.deadline)}</div>
      </div>

      <a href="https://www.erdrop.biz.id/projects" style="display: block; background-color: #a855f7; color: #ffffff; text-align: center; padding: 16px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
        🚀 Go to Project
      </a>
    </div>

    <div style="margin-top: 32px; font-size: 12px; color: #a1a1aa;">
      <p>You're receiving this because you're tracking this project on Erdrop.</p>
      <a href="https://www.erdrop.biz.id/projects" style="color: #a1a1aa; text-decoration: underline;">Open Erdrop Dashboard</a>
    </div>
  </div>
</div>
`};

const getNftHtml = (project: any) => {
  const eventName = project.event_type || 'NFT Mint';
  const badgeText = project.event_type ? `⏰ ${project.event_type.toUpperCase()} ALERT` : '⏰ 3-HOUR MINT ALERT';

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #4b4b4d; padding: 40px 20px; color: #ffffff;">
  <div style="max-width: 500px; margin: 0 auto; text-align: center;">
    
    <div style="background-color: #a855f7; display: inline-block; padding: 10px 24px; border-radius: 999px; font-weight: bold; font-size: 20px; margin-bottom: 24px; color: white;">
      💧 Erdrop
    </div>

    <div style="display: inline-block; border: 1px solid #60a5fa; color: #93c5fd; padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: bold; letter-spacing: 1px; margin-bottom: 24px;">
      ${badgeText}
    </div>

    <div style="background-color: #545461; border-radius: 20px; padding: 32px; text-align: left; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
      <div style="font-size: 12px; font-weight: bold; color: #a1a1aa; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">${eventName}</div>
      <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 24px 0; color: #ffffff;">${project.name}</h1>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="border-bottom: 1px solid #71717a;">
          <td style="padding: 12px 0; color: #a1a1aa; font-size: 14px;">Network</td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #ffffff; font-size: 14px;">${project.chain || '-'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #71717a;">
          <td style="padding: 12px 0; color: #a1a1aa; font-size: 14px;">Mint Price</td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #c084fc; font-size: 14px;">${project.mint_price || '-'}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #a1a1aa; font-size: 14px;">Supply</td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #c084fc; font-size: 14px;">${project.collection_size || '-'}</td>
        </tr>
      </table>

      <div style="border: 1px solid #71717a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: bold; color: #93c5fd; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Date / Time</div>
        <div style="font-size: 16px; font-weight: bold; color: #ffffff;">${formatUTCDate(project.deadline)}</div>
      </div>

      <a href="https://www.erdrop.biz.id/projects" style="display: block; background-color: #a855f7; color: #ffffff; text-align: center; padding: 16px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
        🖼️ Go to Project
      </a>
    </div>

    <div style="margin-top: 32px; font-size: 12px; color: #a1a1aa;">
      <p>You're receiving this because you're tracking this project on Erdrop.</p>
      <a href="https://www.erdrop.biz.id/projects" style="color: #a1a1aa; text-decoration: underline;">Open Erdrop Dashboard</a>
    </div>
  </div>
</div>
`};

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

  // Token projects (H-24 hours) - added more fields for email
  const { data: tokenProjects } = await supabase
    .from('projects')
    .select('id, user_id, name, deadline, chain, estimated_reward, status, event_type')
    .eq('project_type', 'Token')
    .eq('email_notified', false)
    .gte('deadline', now.toISOString())
    .lte('deadline', in24Hours.toISOString())

  // NFT projects (H-3 hours) - added more fields for email
  const { data: nftProjects } = await supabase
    .from('projects')
    .select('id, user_id, name, deadline, chain, mint_price, collection_size, status, event_type')
    .eq('project_type', 'NFT')
    .eq('email_notified', false)
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
          if (!resend) {
            console.warn('[CRON] RESEND_API_KEY missing, skipping email.')
            errors.push(`Token ${project.name}: RESEND_API_KEY missing`)
          } else {
            const subjectLabel = project.event_type ? project.event_type : '24h Deadline';
            const res = await resend.emails.send({
              from: 'Erdrop <noreply@erdrop.biz.id>',
              to: email,
              subject: `⏰ ${subjectLabel}: ${project.name}`,
              html: getTokenHtml(project)
            })
            if (res.error) {
              console.error(`[CRON] Resend error for user ${project.user_id}:`, res.error)
              errors.push(`Token ${project.name}: ${res.error.message}`)
            } else {
              console.log(`[CRON] Successfully sent token deadline email for project ${project.id}`)
            }
          }
          const { error: updateError } = await supabase.from('projects').update({ email_notified: true }).eq('id', project.id)
          if (updateError) {
            console.error(`[CRON] Failed to update email_notified for ${project.id}:`, updateError)
            errors.push(`Token ${project.name} DB Update: ${updateError.message}`)
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
          if (!resend) {
            console.warn('[CRON] RESEND_API_KEY missing, skipping email.')
            errors.push(`NFT ${project.name}: RESEND_API_KEY missing`)
          } else {
            const subjectLabel = project.event_type ? project.event_type : 'Minting Soon';
            const res = await resend.emails.send({
              from: 'Erdrop <noreply@erdrop.biz.id>',
              to: email,
              subject: `⏰ ${subjectLabel}: ${project.name}`,
              html: getNftHtml(project)
            })
            if (res.error) {
              console.error(`[CRON] Resend error for user ${project.user_id}:`, res.error)
              errors.push(`NFT ${project.name}: ${res.error.message}`)
            } else {
              // Mark as notified so it doesn't send again next hour
              const { error: updateError } = await supabase.from('projects').update({ email_notified: true }).eq('id', project.id)
              if (updateError) {
                console.error(`[CRON] Failed to update email_notified for ${project.id}:`, updateError)
                errors.push(`NFT ${project.name} DB Update: ${updateError.message}`)
              }
            }
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
