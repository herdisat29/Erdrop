import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Fetch all projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return new NextResponse('Error fetching projects', { status: 500 })
  }

  // Create CSV header
  const headers = ['Name', 'Chain', 'Status', 'Difficulty', 'Est. Reward', 'Deadline', 'Notes', 'Created At']
  
  // Create CSV rows
  const rows = (projects || []).map(p => {
    return [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.chain || '').replace(/"/g, '""')}"`,
      `"${(p.status || '').replace(/"/g, '""')}"`,
      `"${(p.difficulty || '').replace(/"/g, '""')}"`,
      `"${(p.estimated_reward || '').replace(/"/g, '""')}"`,
      `"${(p.deadline || '').replace(/"/g, '""')}"`,
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
