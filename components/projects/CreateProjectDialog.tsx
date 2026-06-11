'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ProjectForm } from './ProjectForm'
import { ProjectInsert } from '@/types'
import { createProject } from '@/app/actions/projects'
import { toast } from 'sonner'

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: ProjectInsert) => {
    setIsLoading(true)
    const result = await createProject(data)
    
    if (result.error) {
      toast.error('Failed to create project: ' + result.error)
    } else {
      toast.success('Project created successfully!')
      setOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="font-label-bold uppercase tracking-widest bg-primary-container text-on-primary-container hover:bg-primary-container/80 rounded-full squishy-interaction gap-2 shadow-sm px-6">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        } 
      />
      <DialogContent className="sm:max-w-[500px] bg-surface-container-lowest border border-outline-variant text-on-surface max-h-[90vh] overflow-y-auto rounded-3xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-headline-md text-on-surface">Add New Project</DialogTitle>
          <DialogDescription className="text-on-surface-variant font-label-sm pt-1">
            Track a new airdrop project. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <ProjectForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  )
}
