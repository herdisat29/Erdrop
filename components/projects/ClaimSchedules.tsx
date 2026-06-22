'use client'

import { useState } from 'react'
import { Plus, Check, Clock, X, Calendar as CalendarIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ClaimSchedule, ClaimScheduleInsert } from '@/types'
import { createClaimSchedule, updateClaimSchedule, deleteClaimSchedule } from '@/app/actions/claims'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ClaimSchedulesProps {
  projectId: string
  schedules: ClaimSchedule[]
}

export function ClaimSchedules({ projectId, schedules }: ClaimSchedulesProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time) {
      toast.error('Date and time are required')
      return
    }

    setIsLoading(true)
    
    // Combine date and time
    const datetimeStr = `${date}T${time}:00`
    const claimDate = new Date(datetimeStr).toISOString()

    const data: ClaimScheduleInsert = {
      project_id: projectId,
      claim_date: claimDate,
      amount: amount ? Number(amount) : null,
      notes: notes || null,
      status: 'Pending'
    }

    const result = await createClaimSchedule(data)
    
    if (result.error) {
      toast.error('Failed to add schedule: ' + result.error)
    } else {
      toast.success('Schedule added!')
      setOpen(false)
      setDate('')
      setTime('')
      setAmount('')
      setNotes('')
    }
    setIsLoading(false)
  }

  const handleUpdateStatus = async (id: string, status: 'Claimed' | 'Missed') => {
    const result = await updateClaimSchedule(id, projectId, { status })
    if (result.error) toast.error('Failed to update status: ' + result.error)
    else toast.success(`Marked as ${status}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return
    const result = await deleteClaimSchedule(id, projectId)
    if (result.error) toast.error('Failed to delete schedule: ' + result.error)
    else toast.success('Schedule deleted')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-on-surface flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Vesting & Claims
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="font-label-bold uppercase tracking-widest gap-2 rounded-full border-outline-variant hover:bg-surface-container-high squishy-interaction">
              <Plus className="h-3.5 w-3.5" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] bg-surface-container-lowest border border-outline-variant text-on-surface rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-headline-md">Add Claim Schedule</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input 
                    type="date" 
                    required 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="bg-surface-container rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input 
                    type="time" 
                    required 
                    value={time} 
                    onChange={e => setTime(e.target.value)}
                    className="bg-surface-container rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Amount (Tokens)</Label>
                <Input 
                  type="number" 
                  step="any"
                  placeholder="e.g. 1500" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  className="bg-surface-container rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input 
                  placeholder="e.g. 10% TGE unlock" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  className="bg-surface-container rounded-xl"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full font-label-bold uppercase tracking-widest rounded-2xl bg-primary text-on-primary"
              >
                {isLoading ? 'Saving...' : 'Save Schedule'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/50 text-center">
          <p className="text-sm text-on-surface-variant">No claim schedules set.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {schedules.map(schedule => {
            const isPending = schedule.status === 'Pending'
            const isPast = new Date(schedule.claim_date) < new Date() && isPending

            return (
              <div 
                key={schedule.id} 
                className={`p-4 rounded-2xl border ${
                  schedule.status === 'Claimed' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' :
                  isPast ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                  'bg-surface-container border-outline-variant/60'
                } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full shrink-0 ${
                    schedule.status === 'Claimed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-300' :
                    isPast ? 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300' :
                    'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {schedule.status === 'Claimed' ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-label-bold ${isPast ? 'text-red-600 dark:text-red-400' : 'text-on-surface'}`}>
                        {format(new Date(schedule.claim_date), 'MMM d, yyyy - HH:mm')}
                      </p>
                      <Badge variant="outline" className={`text-[9px] uppercase tracking-widest px-1.5 py-0 border-0 ${
                        schedule.status === 'Claimed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300' :
                        schedule.status === 'Missed' ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300' :
                        isPast ? 'bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
                      }`}>
                        {isPast ? 'Overdue' : schedule.status}
                      </Badge>
                    </div>
                    {schedule.amount && (
                      <p className="text-sm font-label-bold text-on-surface mt-0.5">
                        {schedule.amount.toLocaleString()} Tokens
                      </p>
                    )}
                    {schedule.notes && (
                      <p className="text-xs text-on-surface-variant mt-0.5">{schedule.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isPending && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUpdateStatus(schedule.id, 'Claimed')}
                        className="flex-1 sm:flex-none border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30 rounded-xl"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Claimed
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUpdateStatus(schedule.id, 'Missed')}
                        className="flex-1 sm:flex-none border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 rounded-xl"
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Missed
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(schedule.id)}
                    className="text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
