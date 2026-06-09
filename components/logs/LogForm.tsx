'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LogInsert, LogStatus } from '@/types'

const formSchema = z.object({
  task: z.string().min(2, {
    message: 'Task description must be at least 2 characters.',
  }),
  wallet: z.string().optional(),
  estimated_value: z.string().optional(),
  status: z.enum(['Pending', 'Completed', 'Claimed', 'Failed']),
  tx_hash: z.string().optional(),
  notes: z.string().optional(),
})

interface LogFormProps {
  projectId: string
  initialData?: Partial<LogInsert>
  onSubmit: (data: LogInsert) => Promise<void>
  isLoading: boolean
}

export function LogForm({ projectId, initialData, onSubmit, isLoading }: LogFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: initialData?.task || '',
      wallet: initialData?.wallet || '',
      estimated_value: initialData?.estimated_value?.toString() ?? '',
      status: initialData?.status || 'Pending',
      tx_hash: initialData?.tx_hash || '',
      notes: initialData?.notes || '',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        task: initialData.task || '',
        wallet: initialData.wallet || '',
        estimated_value: initialData.estimated_value?.toString() ?? '',
        status: initialData.status || 'Pending',
        tx_hash: initialData.tx_hash || '',
        notes: initialData.notes || '',
      })
    }
  }, [initialData, form])

  const handleSubmit = async (values: any) => {
    const dataToSubmit: LogInsert = {
      project_id: projectId,
      task: values.task,
      wallet: values.wallet || null,
      estimated_value: values.estimated_value ? Number(values.estimated_value) : null,
      status: values.status as LogStatus,
      tx_hash: values.tx_hash || null,
      notes: values.notes || null,
    }
    await onSubmit(dataToSubmit)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="task"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-on-surface font-label-bold">Task / Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Daily Check-in, Swap USDC to ETH" className="bg-surface-container border-outline-variant text-on-surface rounded-xl" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="wallet"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface font-label-bold">Wallet Used</FormLabel>
                <FormControl>
                  <Input placeholder="0x..." className="bg-surface-container border-outline-variant text-on-surface rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface font-label-bold">Status</FormLabel>
                <Select onValueChange={(val) => field.onChange(val || '')} value={field.value ?? null}>
                  <FormControl>
                    <SelectTrigger className="bg-surface-container border-outline-variant text-on-surface rounded-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-surface-container-lowest border-outline-variant text-on-surface rounded-xl">
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Claimed">Claimed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimated_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface font-label-bold">Estimated Value</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="150" className="bg-surface-container border-outline-variant text-on-surface rounded-xl" {...field} />
                </FormControl>
                <FormDescription className="text-xs text-on-surface-variant">Estimasi nilai dalam USD atau Points</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tx_hash"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface font-label-bold">Tx Hash (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="0x..." className="bg-surface-container border-outline-variant text-on-surface rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-on-surface font-label-bold">Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional info (e.g. 500 pts, used bridge X)" 
                  className="resize-none bg-surface-container border-outline-variant text-on-surface h-20 rounded-xl" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-on-primary rounded-full squishy-interaction font-label-bold px-6">
            {isLoading ? 'Saving...' : (initialData ? 'Update Log' : 'Add Log')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
