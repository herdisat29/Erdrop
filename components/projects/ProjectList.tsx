'use client'

import { useState } from 'react'
import { Project } from '@/types'
import { ProjectCard } from './ProjectCard'
import { CreateProjectDialog } from './CreateProjectDialog'
import { Ghost, LayoutGrid, List as ListIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProjectListProps {
  projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [chainFilter, setChainFilter] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board')

  // Derive unique chains from projects for the filter dropdown
  const uniqueChains = Array.from(new Set(projects.map(p => p.chain).filter(Boolean)))

  const filteredProjects = projects.filter((project) => {
    const matchStatus = statusFilter === 'All' || project.status === statusFilter
    const matchChain = chainFilter === 'All' || project.chain === chainFilter
    return matchStatus && matchChain
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Your Projects</h1>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'All')}>
            <SelectTrigger className="w-[140px] bg-white dark:bg-zinc-900 border-black/10 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-black/10 dark:border-zinc-800 text-zinc-700 dark:text-white">
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Eligible">Eligible</SelectItem>
              <SelectItem value="Claimed">Claimed</SelectItem>
              <SelectItem value="Missed">Missed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chainFilter} onValueChange={(val) => setChainFilter(val || 'All')}>
            <SelectTrigger className="w-[140px] bg-white dark:bg-zinc-900 border-black/10 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
              <SelectValue placeholder="Chain" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-black/10 dark:border-zinc-800 text-zinc-700 dark:text-white">
              <SelectItem value="All">All Chains</SelectItem>
              {uniqueChains.map(chain => (
                <SelectItem key={chain} value={chain as string}>{chain}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex bg-white/50 dark:bg-zinc-900/50 rounded-lg p-1 border border-black/5 dark:border-white/5 backdrop-blur-md">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <CreateProjectDialog />
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50 mb-4">
            <Ghost className="h-8 w-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-zinc-500 max-w-sm mb-6">
            You haven't added any airdrop projects. Start tracking your first airdrop to stay organized.
          </p>
          <CreateProjectDialog />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
          <p className="text-zinc-500">No projects match the selected filters.</p>
          <button 
            onClick={() => { setStatusFilter('All'); setChainFilter('All'); }}
            className="mt-4 text-violet-400 hover:text-violet-300 transition-colors text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x animate-in fade-in zoom-in-95 duration-500 min-h-[60vh]">
          {['Not Started', 'In Progress', 'Eligible', 'Claimed'].map((status) => {
            const columnProjects = filteredProjects.filter(p => p.status === status)
            return (
              <div key={status} className="flex-shrink-0 w-80 snap-start flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider text-xs">{status}</h3>
                  <span className="bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 text-xs py-0.5 px-2 rounded-full">
                    {columnProjects.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {columnProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  {columnProjects.length === 0 && (
                    <div className="border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl h-24 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-600 italic">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
