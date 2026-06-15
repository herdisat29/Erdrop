import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { Project, Log } from '@/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { LogTable } from '@/components/logs/LogTable'
import { CreateLogDialog } from '@/components/logs/CreateLogDialog'
import { ProjectDetailActions } from '@/components/projects/ProjectDetailActions'
import { AIAnalysis } from '@/components/projects/AIAnalysis'
import { AiAnalysis } from '@/types'

export const dynamic = 'force-dynamic'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Claimed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
    case 'Eligible': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
    case 'In Progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
    case 'Vesting': return 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
    case 'Missed': return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30 font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
    default: return 'bg-surface-container-high text-on-surface-variant border border-outline-variant font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
  }
}

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getPrivyUser()
  if (!user) return null

  const supabase = createClient()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  const { data: logs, error: logsError } = await supabase
    .from('logs')
    .select('*')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })

  if (logsError) {
    console.error('Error fetching logs:', logsError)
  }

  // [NEW] Fetch up to 10 analyses for timeline history
  const { data: analyses } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const typedLogs = (logs as Log[]) || []
  
  // Calculate total estimated value safely
  const totalValue = typedLogs.reduce((acc, log) => {
    return acc + (log.estimated_value || 0)
  }, 0)

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <Link href="/projects" className="text-on-surface-variant hover:text-on-surface flex items-center gap-2 text-sm font-label-bold uppercase tracking-widest w-fit transition-colors squishy-interaction">
        <ChevronLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant sticky-note-shadow">
        {/* Top row: Title + Actions */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{project.name}</h1>
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          <div className="shrink-0">
            <ProjectDetailActions project={project} />
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-on-surface-variant font-label-bold mb-6">
          {project.chain && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">language</span>
              {project.chain}
            </span>
          )}
          {project.website && (
            <a href={project.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-primary text-base">link</span>
              Website <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {project.deadline && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">event</span>
              {project.deadline.length >= 16 ? project.deadline.substring(0, 16).replace('T', ' ') + ' UTC' : project.deadline}
            </span>
          )}
          {project.difficulty && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">signal_cellular_alt</span>
              {project.difficulty}
            </span>
          )}
        </div>

        {/* Stats + Action row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="bg-surface-container px-5 py-3 rounded-2xl border border-outline-variant">
            <p className="font-label-bold text-primary uppercase tracking-wider mb-1 text-[10px]">Total Logs Value</p>
            <p className="font-display-lg text-display-lg text-on-surface tracking-tighter">${totalValue.toLocaleString()}</p>
          </div>
          <CreateLogDialog projectId={project.id} />
        </div>
      </div>

      <div className="pt-2 pb-4">
        <AIAnalysis projectId={project.id} analyses={(analyses as any[]) || []} />
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">assignment</span>
            Activity Logs
          </h2>
          <Badge variant="outline" className="rounded-full border border-outline-variant text-on-surface-variant font-label-bold uppercase tracking-widest px-3 py-1">{typedLogs.length} Entries</Badge>
        </div>
        <LogTable logs={typedLogs} projectId={project.id} />
      </div>
    </div>
  )
}
