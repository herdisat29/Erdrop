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
          <Button className="font-bold uppercase tracking-widest bg-violet-200 dark:bg-violet-900 border-2 border-violet-900 dark:border-violet-500 text-violet-900 dark:text-violet-100 hover:bg-violet-300 dark:hover:bg-violet-800 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all rounded-xl squishy-interaction gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        } 
      />
      <DialogContent className="sm:max-w-[500px] bg-background dark:bg-zinc-950 border-2 border-border dark:border-white text-foreground dark:text-white max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight text-xl border-b-2 border-zinc-900 dark:border-white pb-2 inline-block w-fit">Add New Project</DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs pt-4">
            Track a new airdrop project. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <ProjectForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  )
}
