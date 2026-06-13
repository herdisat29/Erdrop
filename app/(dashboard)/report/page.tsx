import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { Project, Log } from '@/types'
import { FarmerHealth } from '@/components/analytics/FarmerHealth'
import { Trophy, Clock, XCircle, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ReportPage() {
  const user = await getPrivyUser()
  if (!user) return null

  const supabase = createClient()

  const [{ data: projects }, { data: logs }] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false }),
  ])

  const allProjects = (projects as Project[]) || []
  const allLogs = (logs as Log[]) || []

  const won = allProjects.filter(p => p.status === 'Claimed')
  const pending = allProjects.filter(p => ['In Progress', 'Eligible', 'Not Started', 'Vesting'].includes(p.status))
  const missed = allProjects.filter(p => p.status === 'Missed')

  const totalClaimedValue = allLogs
    .filter(l => l.status === 'Claimed')
    .reduce((acc, l) => acc + (l.estimated_value || 0), 0)

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Claimed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
      'In Progress': 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
      'Eligible': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
      'Vesting': 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 border-violet-200 dark:border-violet-500/30',
      'Not Started': 'bg-surface-container-high text-on-surface-variant border-outline-variant',
      'Missed': 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border-red-200 dark:border-red-500/30',
    }
    return `font-label-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest border ${map[status] || map['Not Started']}`
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-2">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">analytics</span>
          Airdrop Portfolio
        </h1>
        <p className="font-body-md text-on-surface-variant text-sm mt-1">
          Your complete farming history and performance metrics.
        </p>
      </div>

      {/* Farmer Health */}
      <FarmerHealth projects={allProjects} logs={allLogs} />

      {/* Total claimed value banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-label-bold text-primary uppercase tracking-widest">Total Claimed Value</p>
            <p className="text-2xl font-black text-on-surface tracking-tighter">${totalClaimedValue.toLocaleString()}</p>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant">Based on claimed logs across all projects</p>
      </div>

      {/* Ledger sections */}
      <div className="space-y-6">
        {/* Won */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-emerald-500" />
            <h2 className="font-headline-md text-on-surface">Won</h2>
            <span className="text-xs font-label-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant">{won.length}</span>
          </div>
          {won.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 text-center text-sm text-on-surface-variant">
              No claimed airdrops yet. Keep farming!
            </div>
          ) : (
            <div className="space-y-2">
              {won.map(p => (
                <ProjectRow key={p.id} project={p} getStatusBadge={getStatusBadge} />
              ))}
            </div>
          )}
        </section>

        {/* Pending */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-amber-500" />
            <h2 className="font-headline-md text-on-surface">Pending</h2>
            <span className="text-xs font-label-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant">{pending.length}</span>
          </div>
          {pending.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 text-center text-sm text-on-surface-variant">
              No active projects. Add projects to start tracking!
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map(p => (
                <ProjectRow key={p.id} project={p} getStatusBadge={getStatusBadge} />
              ))}
            </div>
          )}
        </section>

        {/* Missed */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="h-5 w-5 text-red-500" />
            <h2 className="font-headline-md text-on-surface">Missed</h2>
            <span className="text-xs font-label-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant">{missed.length}</span>
          </div>
          {missed.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 text-center text-sm text-on-surface-variant">
              Clean record — no missed airdrops.
            </div>
          ) : (
            <div className="space-y-2">
              {missed.map(p => (
                <ProjectRow key={p.id} project={p} getStatusBadge={getStatusBadge} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ProjectRow({
  project,
  getStatusBadge,
}: {
  project: Project
  getStatusBadge: (s: string) => string
}) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="flex items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-4 hover:bg-surface-container transition-colors squishy-interaction"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <p className="font-label-bold text-on-surface truncate">{project.name}</p>
          <p className="text-xs text-on-surface-variant">
            {project.chain || '—'}{project.estimated_reward ? ` · ${project.estimated_reward}` : ''}
          </p>
        </div>
      </div>
      <span className={getStatusBadge(project.status)}>{project.status}</span>
    </Link>
  )
}
