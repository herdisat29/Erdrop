'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { Project } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { toast } from 'sonner'
import { deleteProject } from '@/app/actions/projects'
import { EditProjectDialog } from './EditProjectDialog'

export function ProjectDetailActions({ project }: { project: Project }) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      setIsDeleting(true)
      const result = await deleteProject(project.id)
      if (result?.error) {
        toast.error('Failed to delete: ' + result.error)
        setIsDeleting(false)
      } else {
        toast.success('Project deleted')
        setIsDeleteDialogOpen(false)
        router.push('/projects')
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="text-on-surface-variant hover:text-on-surface focus:outline-none squishy-interaction p-2 rounded-full hover:bg-surface-container-high transition-colors">
          <MoreVertical className="h-6 w-6" />
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="bg-surface-container-lowest border-outline-variant text-on-surface-variant rounded-xl shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIsEditOpen(true) }} className="hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer rounded-lg m-1 font-label-bold">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIsDeleteDialogOpen(true) }} disabled={isDeleting} className="text-error focus:text-error hover:bg-error-container focus:bg-error-container cursor-pointer rounded-lg m-1 font-label-bold">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProjectDialog
        project={project}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-surface-container-lowest border-outline-variant text-on-surface rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline-md">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-on-surface-variant font-label-sm">
              This will permanently delete "{project.name}" and all associated logs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="border-none hover:bg-surface-container-high text-on-surface rounded-full squishy-interaction">Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={(e) => { e.preventDefault(); handleDelete(); }} className="bg-error text-on-error hover:bg-error/90 rounded-full squishy-interaction">
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
