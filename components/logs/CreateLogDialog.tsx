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
          <Button className="font-label-bold uppercase tracking-widest bg-primary text-on-primary hover:bg-primary/90 rounded-full squishy-interaction gap-2 shadow-md px-6">
            <Plus className="h-4 w-4" />
            Add Log
          </Button>
        } 
      />
      <DialogContent className="sm:max-w-[500px] bg-surface-container-lowest border border-outline-variant text-on-surface max-h-[90vh] overflow-y-auto rounded-3xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-headline-md text-on-surface">Add Activity Log</DialogTitle>
          <DialogDescription className="text-on-surface-variant font-label-sm pt-1">
            Record a new task or transaction for this airdrop project.
          </DialogDescription>
        </DialogHeader>
        <LogForm projectId={projectId} onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  )
}
