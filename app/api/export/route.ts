import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { checkFeatureAccess } from '@/lib/plan-gate'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const user = await getPrivyUser()
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Pro gate: export is Pro-only
  const access = await checkFeatureAccess(user.id, 'export')
  if (!access.allowed) {
    const url = new URL('/?upgrade=true', req.url)
    return NextResponse.redirect(url)
  }

  const supabase = createClient()
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return new NextResponse('Error fetching projects', { status: 500 })
  }

  const headers = ['Name', 'Type', 'Chain', 'Status', 'Difficulty', 'Est. Reward', 'Mint Price', 'Collection Size', 'Deadline', 'Twitter', 'Website', 'Notes', 'Created At']
  
  const rows = (projects || []).map(p => {
    return [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.project_type || 'Token')}"`,
      `"${(p.chain || '').replace(/"/g, '""')}"`,
      `"${(p.status || '').replace(/"/g, '""')}"`,
      `"${(p.difficulty || '').replace(/"/g, '""')}"`,
      `"${(p.estimated_reward || '').replace(/"/g, '""')}"`,
      `"${(p.mint_price || '').replace(/"/g, '""')}"`,
      `"${(p.collection_size || '').replace(/"/g, '""')}"`,
      `"${(p.deadline || '').replace(/"/g, '""')}"`,
      `"${(p.twitter_url || '').replace(/"/g, '""')}"`,
      `"${(p.website || '').replace(/"/g, '""')}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
      `"${p.created_at}"`
    ].join(',')
  })

  const csvContent = [headers.join(','), ...rows].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="erdrop_export_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
