'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Project } from '@/types'
import { ProjectCard } from './ProjectCard'
import { CreateProjectDialog } from './CreateProjectDialog'
import { LayoutGrid, List as ListIcon, ChevronDown, ChevronRight } from 'lucide-react'
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
  const [expandedStatuses, setExpandedStatuses] = useState<Record<string, boolean>>({
    'Not Started': true,
    'In Progress': true,
    'Eligible': true,
    'Vesting': true,
    'Claimed': true,
  })

  const toggleStatus = (status: string) => {
    setExpandedStatuses(prev => ({ ...prev, [status]: !prev[status] }))
  }

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
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">YOUR PROJECTS</h1>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'All')}>
            <SelectTrigger className="w-[140px] bg-surface-container border-outline-variant text-on-surface rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-surface-container-lowest border-outline-variant text-on-surface rounded-xl">
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
            <SelectTrigger className="w-[140px] bg-surface-container border-outline-variant text-on-surface rounded-xl">
              <SelectValue placeholder="Chain" />
            </SelectTrigger>
            <SelectContent className="bg-surface-container-lowest border-outline-variant text-on-surface rounded-xl">
              <SelectItem value="All">All Chains</SelectItem>
              {uniqueChains.map(chain => (
                <SelectItem key={chain as string} value={chain as string}>{chain}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || 'All')}>
            <SelectTrigger className="w-[140px] bg-surface-container border-outline-variant text-on-surface rounded-xl">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-surface-container-lowest border-outline-variant text-on-surface rounded-xl">
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Token">Token</SelectItem>
              <SelectItem value="NFT">NFT</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-surface-container border border-outline-variant p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-all rounded-lg ${viewMode === 'list' ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 transition-all rounded-lg ${viewMode === 'board' ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <CreateProjectDialog />
        </div>
      </div>

      {optimisticProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-outline-variant bg-surface-container-lowest">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container mb-4">
            <span className="material-symbols-outlined text-on-surface-variant text-3xl">folder_off</span>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface mb-2">No projects yet</h3>
          <p className="font-label-sm text-on-surface-variant max-w-sm mb-6">
            You haven't added any airdrop projects. Start tracking your first airdrop to stay organized.
          </p>
          <CreateProjectDialog />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-outline-variant bg-surface-container-lowest">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container mb-4">
            <span className="material-symbols-outlined text-on-surface-variant text-3xl">filter_list_off</span>
          </div>
          <p className="font-headline-md text-on-surface mb-2">No projects match the selected filters.</p>
          <button 
            onClick={() => { setStatusFilter('All'); setChainFilter('All'); setTypeFilter('All'); }}
            className="font-label-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider text-sm mt-2"
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
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
          {['Not Started', 'In Progress', 'Eligible', 'Vesting', 'Claimed'].map((status) => {
            const columnProjects = filteredProjects.filter(p => p.status === status)
            const isExpanded = expandedStatuses[status]
            return (
              <div key={status} className="flex flex-col gap-4">
                <button 
                  onClick={() => toggleStatus(status)}
                  className="flex items-center justify-between bg-surface-container-lowest p-3 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-on-surface-variant" /> : <ChevronRight className="h-5 w-5 text-on-surface-variant" />}
                    <h3 className="font-label-bold text-on-surface uppercase tracking-widest text-sm">{status}</h3>
                  </div>
                  <span className="bg-surface-container border border-outline-variant text-on-surface-variant font-label-bold text-xs py-0.5 px-2 rounded-full">
                    {columnProjects.length}
                  </span>
                </button>
                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pl-2 border-l-2 border-outline-variant/30">
                    {columnProjects.map(project => (
                      <ProjectCard key={project.id} project={project} onOptimisticDelete={() => addOptimisticDelete(project.id)} />
                    ))}
                    {columnProjects.length === 0 && (
                      <div className="border border-dashed border-outline-variant rounded-2xl h-24 flex items-center justify-center text-xs font-label-bold uppercase tracking-widest text-on-surface-variant col-span-full">
                        Empty
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
