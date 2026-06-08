'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LogForm } from './LogForm'
import { Log, LogUpdate } from '@/types'
import { updateLog } from '@/app/actions/logs'
import { toast } from 'sonner'

interface EditLogDialogProps {
  log: Log
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditLogDialog({ log, open, onOpenChange }: EditLogDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: LogUpdate) => {
    setIsLoading(true)
    const result = await updateLog(log.id, log.project_id, data)
    
    if (result.error) {
      toast.error('Failed to update log: ' + result.error)
    } else {
      toast.success('Log updated successfully!')
      onOpenChange(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight text-xl border-b-2 border-zinc-900 dark:border-white pb-2 inline-block w-fit">Edit Activity Log</DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs pt-4">
            Make changes to your logged task.
          </DialogDescription>
        </DialogHeader>
        <LogForm 
          projectId={log.project_id}
          initialData={log} 
          onSubmit={handleSubmit as any} 
          isLoading={isLoading} 
        />
      </DialogContent>
    </Dialog>
  )
}
