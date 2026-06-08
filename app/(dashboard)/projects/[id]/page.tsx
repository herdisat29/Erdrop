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
    case 'Claimed': return 'bg-violet-500/10 text-violet-500 border-violet-500/20'
    case 'Eligible': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    case 'In Progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'Missed': return 'bg-red-500/10 text-red-500 border-red-500/20'
    default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
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
      <Link href="/projects" className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm w-fit transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
            {project.chain && (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-zinc-500">Chain:</span> {project.chain}
              </span>
            )}
            {project.website && (
              <a href={project.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                <span className="font-semibold text-zinc-500">Link:</span> Website <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {project.deadline && (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-zinc-500">Deadline:</span> {project.deadline}
              </span>
            )}
            {project.difficulty && (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-zinc-500">Difficulty:</span> {project.difficulty}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 text-left md:text-right w-full md:w-auto">
          <div className="bg-zinc-950 px-4 py-3 rounded-lg border border-zinc-800/50">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Total Logs Value</p>
            <p className="text-2xl font-bold text-emerald-400">${totalValue.toLocaleString()}</p>
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
          <h2 className="text-xl font-bold text-white">Activity Logs</h2>
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-800">{typedLogs.length} Entries</Badge>
        </div>
        <LogTable logs={typedLogs} projectId={project.id} />
      </div>
    </div>
  )
}
