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
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription className="text-zinc-400">
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
