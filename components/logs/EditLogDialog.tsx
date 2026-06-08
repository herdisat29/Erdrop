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
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Activity Log</DialogTitle>
          <DialogDescription className="text-zinc-400">
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
