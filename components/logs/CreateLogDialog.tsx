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
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            Add Log
          </Button>
        } 
      />
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Activity Log</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Record a new task or transaction for this airdrop project.
          </DialogDescription>
        </DialogHeader>
        <LogForm projectId={projectId} onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  )
}
