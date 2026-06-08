'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react'
import { Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteProject } from '@/app/actions/projects'
import { toast } from 'sonner'
import { EditProjectDialog } from './EditProjectDialog'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${project.name}?`)) {
      setIsDeleting(true)
      const result = await deleteProject(project.id)
      if (result.error) {
        toast.error('Failed to delete: ' + result.error)
      } else {
        toast.success('Project deleted')
      }
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Claimed': return 'bg-violet-500/10 text-violet-500 border-violet-500/20'
      case 'Eligible': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'In Progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'Missed': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    }
  }

  return (
    <>
      <Card 
        className="group relative bg-white/50 dark:bg-zinc-900/30 border-black/5 dark:border-white/5 hover:border-violet-500/30 backdrop-blur-xl transition-all duration-500 cursor-pointer h-full overflow-hidden"
        onClick={() => router.push(`/projects/${project.id}`)}
      >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-transparent group-hover:from-violet-500/5 transition-all duration-500" />
          <CardHeader className="pb-3 flex flex-row items-start justify-between relative z-10">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                {project.name}
                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white transition-colors relative z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </CardTitle>
              <div className="flex gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                {project.chain && <span>{project.chain}</span>}
                {project.chain && project.difficulty && <span>•</span>}
                {project.difficulty && <span>{project.difficulty}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
              <Badge variant="outline" className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white focus:outline-none">
                  <MoreVertical className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-black/10 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-500 dark:text-red-400 focus:text-red-600 dark:focus:text-red-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-end justify-between mt-2">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Est. Reward</p>
                <p className="text-xl font-bold text-violet-400 mt-1">
                  {project.estimated_reward || 'TBA'}
                </p>
              </div>
              {project.deadline && (
                <div className="text-right">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Deadline</p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">{project.deadline}</p>
                </div>
              )}
            </div>
        </CardContent>
      </Card>

      <EditProjectDialog
        project={project}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  )
}
