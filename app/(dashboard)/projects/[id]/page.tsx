import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { Project, Log } from '@/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { LogTable } from '@/components/logs/LogTable'
import { CreateLogDialog } from '@/components/logs/CreateLogDialog'
import { AIAnalysis } from '@/components/projects/AIAnalysis'
import { AiAnalysis } from '@/types'

export const dynamic = 'force-dynamic'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Claimed': return 'bg-secondary-container text-on-secondary-container font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
    case 'Eligible': return 'bg-primary-container text-on-primary-container font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
    case 'In Progress': return 'bg-tertiary-container text-on-tertiary-container font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
    case 'Vesting': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
    case 'Missed': return 'bg-error-container text-on-error-container font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
    default: return 'bg-surface-container-high text-on-surface-variant font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
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
    .single()

  if (projectError || !project) {
    notFound()
  }

  const { data: logs, error: logsError } = await supabase
    .from('logs')
    .select('*')
    .eq('project_id', id)
    .order('logged_at', { ascending: false })

  if (logsError) {
    console.error('Error fetching logs:', logsError)
  }

  const { data: initialAnalysis } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant sticky-note-shadow">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{project.name}</h1>
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-on-surface-variant font-label-bold">
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
                {project.deadline}
              </span>
            )}
            {project.difficulty && (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">signal_cellular_alt</span>
                {project.difficulty}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 text-left md:text-right w-full md:w-auto">
          <div className="bg-surface-container px-5 py-3 rounded-2xl border border-outline-variant">
            <p className="font-label-bold text-primary uppercase tracking-wider mb-1 text-[10px]">Total Logs Value</p>
            <p className="font-display-lg text-display-lg text-on-surface tracking-tighter">${totalValue.toLocaleString()}</p>
          </div>
          <div className="self-start md:self-end">
            <CreateLogDialog projectId={project.id} />
          </div>
        </div>
      </div>

      <div className="pt-2 pb-4">
        <AIAnalysis projectId={project.id} initialAnalysis={initialAnalysis as AiAnalysis | null} />
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
