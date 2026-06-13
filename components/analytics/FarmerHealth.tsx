'use client'

import { Project, Log } from '@/types'
import { CheckCircle2, Layers, Trophy, XCircle, Activity } from 'lucide-react'

interface FarmerHealthProps {
  projects: Project[]
  logs: Log[]
}

export function FarmerHealth({ projects, logs }: FarmerHealthProps) {
  const totalProjects = projects.length
  const claimedProjects = projects.filter(p => p.status === 'Claimed').length
  const missedProjects = projects.filter(p => p.status === 'Missed').length
  const activeProjects = projects.filter(p => ['In Progress', 'Eligible', 'Not Started'].includes(p.status)).length

  const totalLogs = logs.length
  const completedLogs = logs.filter(l => l.status === 'Completed' || l.status === 'Claimed').length

  // Graceful empty state
  if (totalProjects === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 text-center">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Activity className="h-7 w-7 text-primary" />
        </div>
        <h3 className="font-headline-md text-on-surface mb-2">Farmer Health</h3>
        <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
          Track lebih banyak project untuk melihat Health Score kamu.
        </p>
      </div>
    )
  }

  const winRate = (claimedProjects + missedProjects) > 0
    ? Math.round((claimedProjects / (claimedProjects + missedProjects)) * 100)
    : null

  const taskRate = totalLogs > 0
    ? Math.round((completedLogs / totalLogs) * 100)
    : null

  const metrics = [
    {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      label: 'Tasks Completed',
      value: totalLogs > 0 ? `${completedLogs} / ${totalLogs}` : '—',
      sub: taskRate !== null ? `${taskRate}% completion rate` : 'No logs yet',
      color: taskRate !== null
        ? taskRate >= 70 ? 'text-emerald-600 dark:text-emerald-400'
        : taskRate >= 40 ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400'
        : 'text-on-surface-variant',
    },
    {
      icon: <Layers className="h-4 w-4 text-primary" />,
      label: 'Active Projects',
      value: String(activeProjects),
      sub: `of ${totalProjects} total tracked`,
      color: 'text-primary',
    },
    {
      icon: <Trophy className="h-4 w-4 text-amber-500" />,
      label: 'Win Rate',
      value: winRate !== null ? `${winRate}%` : '—',
      sub: winRate !== null
        ? `${claimedProjects} claimed / ${missedProjects} missed`
        : 'No resolved projects yet',
      color: winRate !== null
        ? winRate >= 60 ? 'text-emerald-600 dark:text-emerald-400'
        : winRate >= 30 ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400'
        : 'text-on-surface-variant',
    },
    {
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      label: 'Missed',
      value: String(missedProjects),
      sub: missedProjects === 0 ? 'Clean record 🎉' : `project${missedProjects > 1 ? 's' : ''} missed`,
      color: missedProjects === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
    },
  ]

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="font-headline-md text-on-surface">Farmer Health</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-surface-container rounded-2xl p-4 border border-outline-variant/50">
            <div className="flex items-center gap-1.5 mb-3">
              {m.icon}
              <span className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest">{m.label}</span>
            </div>
            <p className={`text-2xl font-black tracking-tighter ${m.color} mb-1`}>{m.value}</p>
            <p className="text-[11px] text-on-surface-variant leading-snug">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
