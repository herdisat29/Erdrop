import { createClient } from '@/lib/supabase/server'
import { Project, Log } from '@/types'
import { PortfolioCharts } from '@/components/analytics/PortfolioCharts'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch projects
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select('id, status')

  if (projectsError) {
    throw new Error(`Failed to load projects: ${projectsError.message}`)
  }

  const projects = (projectsData as { id: string; status: Project['status'] }[]) || []
  const totalProjects = projects.length
  const activeFarming = projects.filter(
    (p) => p.status === 'In Progress' || p.status === 'Eligible'
  ).length

  // Fetch logs
  const { data: logsData, error: logsError } = await supabase
    .from('logs')
    .select('status, estimated_value')

  if (logsError) {
    throw new Error(`Failed to load logs: ${logsError.message}`)
  }

  const logs = (logsData as { status: Log['status']; estimated_value: number | null }[]) || []
  const pendingTasks = logs.filter((l) => l.status === 'Pending').length
  const estimatedValue = logs.reduce(
    (acc, log) => acc + (log.estimated_value || 0),
    0
  )

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 mb-2">Welcome Back</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Track your farming progress and maximize your potential airdrops.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="border-2 border-zinc-900 dark:border-white bg-white dark:bg-zinc-950 p-6 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Total Projects</h3>
          <p className="mt-4 text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">{totalProjects}</p>
        </div>
        
        <div className="border-2 border-zinc-900 dark:border-white bg-white dark:bg-zinc-950 p-6 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Active Farming</h3>
          <p className="mt-4 text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">{activeFarming}</p>
        </div>
        
        <div className="border-2 border-zinc-900 dark:border-white bg-white dark:bg-zinc-950 p-6 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Pending Tasks</h3>
          <p className="mt-4 text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">{pendingTasks}</p>
        </div>
        
        <div className="border-2 border-zinc-900 dark:border-white bg-white dark:bg-zinc-950 p-6 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Estimated Value</h3>
          <p className="mt-4 text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">
            ${estimatedValue.toLocaleString()}
          </p>
        </div>
      </div>

      <PortfolioCharts projects={projects} />
    </div>
  )
}
