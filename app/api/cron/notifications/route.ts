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

  const infoRows = [
    project.chain ? `
      <tr>
        <td style="padding:12px 0;color:#94a3b8;font-size:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Network</td>
        <td style="padding:12px 0;color:#f8fafc;font-size:14px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:right;">${project.chain}</td>
      </tr>` : '',
    project.estimated_reward ? `
      <tr>
        <td style="padding:12px 0;color:#94a3b8;font-size:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Est. Reward</td>
        <td style="padding:12px 0;color:#a855f7;font-size:14px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:right;">${project.estimated_reward}</td>
      </tr>` : '',
    project.status ? `
      <tr>
        <td style="padding:12px 0;color:#94a3b8;font-size:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Status</td>
        <td style="padding:12px 0;color:#f8fafc;font-size:14px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:right;">${project.status}</td>
      </tr>` : '',
  ].filter(Boolean).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${eventName}</title></head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="padding-bottom:32px;text-align:center;">
          <div style="display:inline-block;background:linear-gradient(135deg, #a855f7 0%, #6366f1 100%);border-radius:100px;padding:12px 28px;box-shadow:0 10px 25px -5px rgba(168,85,247,0.4);">
            <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">💧 Erdrop</span>
          </div>
        </td></tr>

        <!-- Alert badge -->
        <tr><td style="text-align:center;padding-bottom:24px;">
          <span style="display:inline-block;background:rgba(249,115,22,0.15);border:1px solid rgba(249,115,22,0.3);color:#fb923c;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:8px 20px;border-radius:999px;">
            ${badgeText}
          </span>
        </td></tr>

        <!-- Main card -->
        <tr><td style="background-color:#18181b;border:1px solid #27272a;border-radius:24px;padding:40px;box-shadow:0 20px 40px -10px rgba(0,0,0,0.5);">

          <p style="margin:0 0 12px;color:#a1a1aa;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">${eventName}</p>
          <h1 style="margin:0 0 32px;color:#ffffff;font-size:32px;font-weight:800;line-height:1.2;letter-spacing:-0.5px;">${project.name}</h1>

          <!-- Info table -->
          ${infoRows ? `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #27272a;margin-bottom:32px;">${infoRows}</table>` : ''}

          <!-- Deadline highlight -->
          <div style="background:linear-gradient(145deg, rgba(249,115,22,0.1), rgba(249,115,22,0.02));border:1px solid rgba(249,115,22,0.2);border-radius:16px;padding:24px;margin-bottom:36px;">
            <p style="margin:0 0 8px;color:#fb923c;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;">Date / Time</p>
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.5px;">${formatUTCDate(project.deadline)}</p>
          </div>

          <!-- CTA button -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <a href="${project.website || 'https://www.erdrop.biz.id/projects'}"
                   style="display:inline-block;background:linear-gradient(135deg, #a855f7 0%, #6366f1 100%);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:100px;letter-spacing:0.5px;box-shadow:0 10px 20px -5px rgba(168,85,247,0.4);">
                  ${project.website ? '🚀 &nbsp;Go to Project' : '📊 &nbsp;Open Dashboard'}
                </a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:32px 0 0;text-align:center;">
          <p style="margin:0 0 12px;color:#71717a;font-size:13px;">You're receiving this because you're tracking this project on Erdrop.</p>
          <a href="https://www.erdrop.biz.id/projects" style="color:#a1a1aa;font-size:13px;text-decoration:underline;font-weight:600;">Open Erdrop Dashboard</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
};

const getNftHtml = (project: any) => {
  const eventName = project.event_type || 'NFT Mint';
  const badgeText = project.event_type ? `⏰ ${project.event_type.toUpperCase()} ALERT` : '⏰ 3-HOUR MINT ALERT';

  const infoRows = [
    project.chain ? `
      <tr>
        <td style="padding:12px 0;color:#94a3b8;font-size:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Network</td>
        <td style="padding:12px 0;color:#f8fafc;font-size:14px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:right;">${project.chain}</td>
      </tr>` : '',
    project.mint_price ? `
      <tr>
        <td style="padding:12px 0;color:#94a3b8;font-size:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Mint Price</td>
        <td style="padding:12px 0;color:#10b981;font-size:14px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:right;">${project.mint_price}</td>
      </tr>` : '',
    project.collection_size ? `
      <tr>
        <td style="padding:12px 0;color:#94a3b8;font-size:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Supply</td>
        <td style="padding:12px 0;color:#f8fafc;font-size:14px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:right;">${project.collection_size}</td>
      </tr>` : '',
  ].filter(Boolean).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${eventName}</title></head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="padding-bottom:32px;text-align:center;">
          <div style="display:inline-block;background:linear-gradient(135deg, #a855f7 0%, #6366f1 100%);border-radius:100px;padding:12px 28px;box-shadow:0 10px 25px -5px rgba(168,85,247,0.4);">
            <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">💧 Erdrop</span>
          </div>
        </td></tr>

        <!-- Alert badge -->
        <tr><td style="text-align:center;padding-bottom:24px;">
          <span style="display:inline-block;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);color:#34d399;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:8px 20px;border-radius:999px;">
            ${badgeText}
          </span>
        </td></tr>

        <!-- Main card -->
        <tr><td style="background-color:#18181b;border:1px solid #27272a;border-radius:24px;padding:40px;box-shadow:0 20px 40px -10px rgba(0,0,0,0.5);">

          <p style="margin:0 0 12px;color:#a1a1aa;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">${eventName}</p>
          <h1 style="margin:0 0 32px;color:#ffffff;font-size:32px;font-weight:800;line-height:1.2;letter-spacing:-0.5px;">${project.name}</h1>

          <!-- Info table -->
          ${infoRows ? `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #27272a;margin-bottom:32px;">${infoRows}</table>` : ''}

          <!-- Deadline highlight -->
          <div style="background:linear-gradient(145deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02));border:1px solid rgba(16,185,129,0.2);border-radius:16px;padding:24px;margin-bottom:36px;">
            <p style="margin:0 0 8px;color:#34d399;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;">Date / Time</p>
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.5px;">${formatUTCDate(project.deadline)}</p>
          </div>

          <!-- CTA button -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <a href="${project.website || 'https://www.erdrop.biz.id/projects'}"
                   style="display:inline-block;background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:100px;letter-spacing:0.5px;box-shadow:0 10px 20px -5px rgba(16,185,129,0.4);">
                  ${project.website ? '🎨 &nbsp;Go to Mint Page' : '📊 &nbsp;Open Dashboard'}
                </a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:32px 0 0;text-align:center;">
          <p style="margin:0 0 12px;color:#71717a;font-size:13px;">You're receiving this because you're tracking this project on Erdrop.</p>
          <a href="https://www.erdrop.biz.id/projects" style="color:#a1a1aa;font-size:13px;text-decoration:underline;font-weight:600;">Open Erdrop Dashboard</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
};

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
    .select('id, user_id, name, deadline, chain, estimated_reward, status, event_type, website')
    .eq('project_type', 'Token')
    .eq('email_notified', false)
    .gte('deadline', now.toISOString())
    .lte('deadline', in24Hours.toISOString())

  // NFT projects (H-3 hours) - added more fields for email
  const { data: nftProjects } = await supabase
    .from('projects')
    .select('id, user_id, name, deadline, chain, mint_price, collection_size, status, event_type, website')
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
              const { error: updateError } = await supabase.from('projects').update({ email_notified: true }).eq('id', project.id)
              if (updateError) {
                console.error(`[CRON] Failed to update email_notified for ${project.id}:`, updateError)
                errors.push(`Token ${project.name} DB Update: ${updateError.message}`)
              }
            }
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
