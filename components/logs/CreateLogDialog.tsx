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
import { LogForm } from './LogForm'
import { LogInsert } from '@/types'
import { createLog } from '@/app/actions/logs'
import { toast } from 'sonner'

interface CreateLogDialogProps {
  projectId: string
}

export function CreateLogDialog({ projectId }: CreateLogDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: LogInsert) => {
    setIsLoading(true)
    const result = await createLog(data)
    
    if (result.error) {
      toast.error('Failed to add log: ' + result.error)
    } else {
      toast.success('Log added successfully!')
      setOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="font-bold uppercase tracking-widest bg-violet-200 dark:bg-violet-900 border-2 border-violet-900 dark:border-violet-500 text-violet-900 dark:text-violet-100 hover:bg-violet-300 dark:hover:bg-violet-800 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all rounded-none gap-2">
            <Plus className="h-4 w-4" />
            Add Log
          </Button>
        } 
      />
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight text-xl border-b-2 border-zinc-900 dark:border-white pb-2 inline-block w-fit">Add Activity Log</DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs pt-4">
            Record a new task or transaction for this airdrop project.
          </DialogDescription>
        </DialogHeader>
        <LogForm projectId={projectId} onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  )
}
