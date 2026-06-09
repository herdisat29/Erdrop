'use client'

import { useState, useOptimistic, useTransition } from 'react'
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
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board')

  const [optimisticProjects, addOptimisticDelete] = useOptimistic(
    projects,
    (state, idToRemove: string) => state.filter((p) => p.id !== idToRemove)
  )

  // Derive unique chains from projects for the filter dropdown
  const uniqueChains = Array.from(new Set(optimisticProjects.map(p => p.chain).filter(Boolean)))

  const filteredProjects = optimisticProjects.filter((project) => {
    const matchStatus = statusFilter === 'All' || project.status === statusFilter
    const matchChain = chainFilter === 'All' || project.chain === chainFilter
    const matchType = typeFilter === 'All' || project.project_type === typeFilter
    return matchStatus && matchChain && matchType
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Your Projects</h1>
        
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
              <SelectItem value="Vesting">Vesting</SelectItem>
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
                <SelectItem key={chain as string} value={chain as string}>{chain}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || 'All')}>
            <SelectTrigger className="w-[140px] bg-white dark:bg-zinc-900 border-black/10 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-black/10 dark:border-zinc-800 text-zinc-700 dark:text-white">
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Token">Token</SelectItem>
              <SelectItem value="NFT">NFT</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-all ${viewMode === 'list' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 transition-all ${viewMode === 'board' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <CreateProjectDialog />
        </div>
      </div>

      {optimisticProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-900 dark:border-white bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex h-16 w-16 items-center justify-center border-2 border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-900 mb-4 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <Ghost className="h-8 w-8 text-zinc-900 dark:text-white" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium max-w-sm mb-6">
            You haven't added any airdrop projects. Start tracking your first airdrop to stay organized.
          </p>
          <CreateProjectDialog />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-900 dark:border-white bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <p className="text-zinc-900 dark:text-white font-bold uppercase tracking-wider">No projects match the selected filters.</p>
          <button 
            onClick={() => { setStatusFilter('All'); setChainFilter('All'); setTypeFilter('All'); }}
            className="mt-4 font-bold border-b-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-600 dark:hover:border-violet-400 transition-colors uppercase tracking-wider text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onOptimisticDelete={() => addOptimisticDelete(project.id)} />
          ))}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x animate-in fade-in zoom-in-95 duration-500 min-h-[60vh]">
          {['Not Started', 'In Progress', 'Eligible', 'Vesting', 'Claimed'].map((status) => {
            const columnProjects = filteredProjects.filter(p => p.status === status)
            return (
              <div key={status} className="flex-shrink-0 w-80 snap-start flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-zinc-900 dark:text-white uppercase tracking-widest text-sm">{status}</h3>
                  <span className="bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-bold text-xs py-0.5 px-2">
                    {columnProjects.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {columnProjects.map(project => (
                    <ProjectCard key={project.id} project={project} onOptimisticDelete={() => addOptimisticDelete(project.id)} />
                  ))}
                  {columnProjects.length === 0 && (
                    <div className="border-2 border-dashed border-zinc-400 dark:border-zinc-700 h-24 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
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
