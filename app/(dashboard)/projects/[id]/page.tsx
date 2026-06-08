import { createClient } from '@/lib/supabase/server'
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
    case 'Claimed': return 'bg-violet-200 text-violet-900 border-2 border-violet-900 dark:bg-violet-900 dark:text-violet-100 dark:border-violet-400 font-bold uppercase tracking-wider rounded-none'
    case 'Eligible': return 'bg-emerald-200 text-emerald-900 border-2 border-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 dark:border-emerald-400 font-bold uppercase tracking-wider rounded-none'
    case 'In Progress': return 'bg-blue-200 text-blue-900 border-2 border-blue-900 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-400 font-bold uppercase tracking-wider rounded-none'
    case 'Missed': return 'bg-red-200 text-red-900 border-2 border-red-900 dark:bg-red-900 dark:text-red-100 dark:border-red-400 font-bold uppercase tracking-wider rounded-none'
    default: return 'bg-zinc-200 text-zinc-900 border-2 border-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-400 font-bold uppercase tracking-wider rounded-none'
  }
}

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

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
    .single()

  const typedLogs = (logs as Log[]) || []
  
  // Calculate total estimated value safely
  const totalValue = typedLogs.reduce((acc, log) => {
    return acc + (log.estimated_value || 0)
  }, 0)

  return (
    <div className="space-y-6">
      <Link href="/projects" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest w-fit transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">{project.name}</h1>
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400 font-bold">
            {project.chain && (
              <span className="flex items-center gap-1">
                <span className="font-black text-zinc-900 dark:text-zinc-500 uppercase tracking-widest">Chain:</span> {project.chain}
              </span>
            )}
            {project.website && (
              <a href={project.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <span className="font-black text-zinc-900 dark:text-zinc-500 uppercase tracking-widest">Link:</span> Website <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {project.deadline && (
              <span className="flex items-center gap-1">
                <span className="font-black text-zinc-900 dark:text-zinc-500 uppercase tracking-widest">Deadline:</span> {project.deadline}
              </span>
            )}
            {project.difficulty && (
              <span className="flex items-center gap-1">
                <span className="font-black text-zinc-900 dark:text-zinc-500 uppercase tracking-widest">Difficulty:</span> {project.difficulty}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 text-left md:text-right w-full md:w-auto">
          <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-3 border-2 border-zinc-900 dark:border-zinc-800">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-black mb-1">Total Logs Value</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">${totalValue.toLocaleString()}</p>
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
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Activity Logs</h2>
          <Badge variant="outline" className="rounded-none border-2 border-zinc-900 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-widest">{typedLogs.length} Entries</Badge>
        </div>
        <LogTable logs={typedLogs} projectId={project.id} />
      </div>
    </div>
  )
}
