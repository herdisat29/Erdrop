'use client'

import { useState, useTransition } from 'react'
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
import { formatDistanceToNow } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProjectCardProps {
  project: Project
  onOptimisticDelete?: () => void
}

export function ProjectCard({ project, onOptimisticDelete }: ProjectCardProps) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      setIsDeleting(true)
      if (onOptimisticDelete) {
        onOptimisticDelete()
      }
      const result = await deleteProject(project.id)
      if (result?.error) {
        toast.error('Failed to delete: ' + result.error)
        setIsDeleting(false)
      } else {
        toast.success('Project deleted')
        setIsDeleteDialogOpen(false)
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Claimed': return 'bg-violet-200 text-violet-900 border-2 border-violet-900 dark:bg-violet-900 dark:text-violet-100 dark:border-violet-400 font-bold uppercase tracking-wider'
      case 'Eligible': return 'bg-emerald-200 text-emerald-900 border-2 border-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 dark:border-emerald-400 font-bold uppercase tracking-wider'
      case 'In Progress': return 'bg-blue-200 text-blue-900 border-2 border-blue-900 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-400 font-bold uppercase tracking-wider'
      case 'Missed': return 'bg-red-200 text-red-900 border-2 border-red-900 dark:bg-red-900 dark:text-red-100 dark:border-red-400 font-bold uppercase tracking-wider'
      default: return 'bg-zinc-200 text-zinc-900 border-2 border-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-400 font-bold uppercase tracking-wider'
    }
  }

  return (
    <>
      <Card 
        className="group relative bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-zinc-800 hover:dark:border-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(39,39,42,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 cursor-pointer h-full rounded-none"
        onClick={() => router.push(`/projects/${project.id}`)}
      >
          <CardHeader className="pb-3 flex flex-row items-start justify-between relative z-10">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
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
              <Badge variant="outline" className={`rounded-none px-2 py-0.5 ${getStatusColor(project.status)}`}>
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
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsDeleteDialogOpen(true); }} disabled={isDeleting} className="text-red-500 dark:text-red-400 focus:text-red-600 dark:focus:text-red-300 hover:bg-red-50 dark:hover:bg-zinc-800 focus:bg-red-50 dark:focus:bg-zinc-800 cursor-pointer">
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
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">Est. Reward</p>
                <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter mt-1">
                  {project.estimated_reward || 'TBA'}
                </p>
              </div>
              {project.deadline && (
                <div className="text-right">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">Deadline</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-300 mt-1">{project.deadline}</p>
                </div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t-2 border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</p>
            </div>
        </CardContent>
      </Card>

      <EditProjectDialog
        project={project}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400">
              This will permanently delete "{project.name}" and all associated logs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="bg-transparent border-black/10 dark:border-zinc-800 text-zinc-700 dark:text-white hover:bg-black/5 dark:hover:bg-zinc-800">Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={(e) => { e.preventDefault(); handleDelete(); }} className="bg-red-500 text-white hover:bg-red-600">
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
