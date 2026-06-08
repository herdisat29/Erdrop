import { createClient } from '@/lib/supabase/server'
import { Log } from '@/types'
import { LogTable } from '@/components/logs/LogTable'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function GlobalLogsPage() {
  const supabase = await createClient()

  // Fetch all logs for the current user
  const { data: logsData, error: logsError } = await supabase
    .from('logs')
    .select('*, projects(name)')
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">All Activity Logs</h1>
          <p className="text-sm text-zinc-400">
            Berikut adalah riwayat dari semua aktivitas *farming* kamu di seluruh *project*.
          </p>
        </div>
        <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-800 text-sm py-1.5">
          {typedLogs.length} Total Entries
        </Badge>
      </div>

      <div className="pt-4">
        <LogTable logs={typedLogs} />
      </div>
    </div>
  )
}
