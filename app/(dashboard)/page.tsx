import { createClient } from '@/lib/supabase/server'
import { Project, Log } from '@/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch projects
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select('id, status')

  const projects = (projectsData as Partial<Project>[]) || []
  const totalProjects = projects.length
  const activeFarming = projects.filter(
    (p) => p.status === 'In Progress' || p.status === 'Eligible'
  ).length

  // Fetch logs
  const { data: logsData, error: logsError } = await supabase
    .from('logs')
    .select('status, estimated_value')

  const logs = (logsData as Partial<Log>[]) || []
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
        <div className="group relative rounded-2xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/30 p-6 backdrop-blur-xl overflow-hidden hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-500">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl group-hover:bg-violet-500/20 transition-all duration-500" />
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Projects</h3>
          <p className="mt-4 text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">{totalProjects}</p>
        </div>
        
        <div className="group relative rounded-2xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/30 p-6 backdrop-blur-xl overflow-hidden hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-500">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Farming</h3>
          <p className="mt-4 text-4xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{activeFarming}</p>
        </div>
        
        <div className="group relative rounded-2xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/30 p-6 backdrop-blur-xl overflow-hidden hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-500">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all duration-500" />
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pending Tasks</h3>
          <p className="mt-4 text-4xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">{pendingTasks}</p>
        </div>
        
        <div className="group relative rounded-2xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/30 p-6 backdrop-blur-xl overflow-hidden hover:border-fuchsia-500/30 hover:bg-fuchsia-500/5 transition-all duration-500">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-fuchsia-500/10 blur-2xl group-hover:bg-fuchsia-500/20 transition-all duration-500" />
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Estimated Value</h3>
          <p className="mt-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-500 to-violet-600 dark:from-fuchsia-400 dark:to-violet-500 tracking-tight">
            ${estimatedValue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-white/60 to-zinc-50/60 dark:from-zinc-900/40 dark:to-zinc-950/40 p-8 h-64 flex flex-col items-center justify-center backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:30px_30px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-full max-w-[500px] bg-gradient-to-r from-transparent via-violet-500/10 to-transparent blur-2xl" />
        </div>
        <div className="h-12 w-12 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-500">
          <svg className="h-6 w-6 text-zinc-400 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </div>
        <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 relative z-10 mb-2">Analytics Coming Soon</h3>
        <p className="text-zinc-500 relative z-10 text-sm max-w-sm text-center">Interactive charts to track your portfolio growth over time will be available in the next major update.</p>
      </div>
    </div>
  )
}
