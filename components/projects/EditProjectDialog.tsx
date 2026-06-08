'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProjectForm } from './ProjectForm'
import { Project, ProjectUpdate } from '@/types'
import { updateProject } from '@/app/actions/projects'
import { toast } from 'sonner'

interface EditProjectDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: ProjectUpdate) => {
    setIsLoading(true)
    const result = await updateProject(project.id, data)
    
    if (result.error) {
      toast.error('Failed to update project: ' + result.error)
    } else {
      toast.success('Project updated successfully!')
      onOpenChange(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight text-xl border-b-2 border-zinc-900 dark:border-white pb-2 inline-block w-fit">Edit Project</DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs pt-4">
            Make changes to {project.name}.
          </DialogDescription>
        </DialogHeader>
        <ProjectForm 
          initialData={project} 
          onSubmit={handleSubmit as any} 
          isLoading={isLoading} 
        />
      </DialogContent>
    </Dialog>
  )
}
