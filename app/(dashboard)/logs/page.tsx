import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { Log } from '@/types'
import { LogTable } from '@/components/logs/LogTable'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function GlobalLogsPage() {
  const user = await getPrivyUser()
  if (!user) return null

  const supabase = createClient()

  // Fetch all logs for the current user
  const { data: logsData, error: logsError } = await supabase
    .from('logs')
    .select('*, projects(name)')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })

  if (logsError) {
    console.error('Error fetching global logs:', logsError)
  }

  const typedLogs = (logsData as any[])?.map(log => ({
    ...log,
    // we can append the project name to the task for global context, or just show it
    task: `[${log.projects?.name}] ${log.task}`
  })) as Log[] || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant sticky-note-shadow">
        <div className="space-y-3">
          <h1 className="text-headline-md font-bold text-on-surface">All Activity Logs</h1>
          <p className="text-sm font-body-md text-on-surface-variant">
            Berikut adalah riwayat dari semua aktivitas *farming* kamu di seluruh *project*.
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary-container text-on-primary-container hover:bg-primary-container/90 text-sm py-1.5 px-4 font-label-bold rounded-xl squishy-interaction">
          {typedLogs.length} Total Entries
        </Badge>
      </div>

      <div className="pt-4">
        <LogTable logs={typedLogs} />
      </div>
    </div>
  )
}
