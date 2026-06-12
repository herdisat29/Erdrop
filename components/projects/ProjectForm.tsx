'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

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
import { ProjectDifficulty, ProjectInsert, ProjectStatus, ProjectType } from '@/types'
import { useEffect } from 'react'

const formSchema = z.object({
  project_type: z.enum(['Token', 'NFT']),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  chain: z.string().optional(),
  website: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  twitter_url: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  mint_price: z.string().optional(),
  collection_size: z.string().optional(),
  status: z.enum(['Not Started', 'In Progress', 'Eligible', 'Claimed', 'Missed', 'Vesting']),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().or(z.literal('')),
  estimated_reward: z.string().optional(),
  deadline: z.string().optional(),
  event_type: z.string().optional(),
  notes: z.string().optional(),
})

interface ProjectFormProps {
  initialData?: Partial<ProjectInsert>
  onSubmit: (data: ProjectInsert) => Promise<void>
  isLoading: boolean
}

export function ProjectForm({ initialData, onSubmit, isLoading }: ProjectFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_type: initialData?.project_type || 'Token',
      name: initialData?.name || '',
      chain: initialData?.chain || '',
      website: initialData?.website || '',
      twitter_url: initialData?.twitter_url || '',
      mint_price: initialData?.mint_price || '',
      collection_size: initialData?.collection_size || '',
      status: initialData?.status || 'Not Started',
      difficulty: initialData?.difficulty || undefined,
      estimated_reward: initialData?.estimated_reward || '',
      deadline: initialData?.deadline ? (initialData.deadline.length === 10 ? initialData.deadline + 'T00:00' : initialData.deadline.substring(0, 16)) : '',
      event_type: initialData?.event_type || '',
      notes: initialData?.notes || '',
    },
  })

  // Reset form when initialData changes (useful for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset({
        project_type: initialData.project_type || 'Token',
        name: initialData.name || '',
        chain: initialData.chain || '',
        website: initialData.website || '',
        twitter_url: initialData.twitter_url || '',
        mint_price: initialData.mint_price || '',
        collection_size: initialData.collection_size || '',
        status: initialData.status || 'Not Started',
        difficulty: initialData.difficulty || undefined,
        estimated_reward: initialData.estimated_reward || '',
        deadline: initialData.deadline ? (initialData.deadline.length === 10 ? initialData.deadline + 'T00:00' : initialData.deadline.substring(0, 16)) : '',
        event_type: initialData.event_type || '',
        notes: initialData.notes || '',
      })
    }
  }, [initialData, form])

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const dataToSubmit: ProjectInsert = {
      project_type: values.project_type as ProjectType,
      name: values.name,
      chain: values.chain || null,
      website: values.website || null,
      twitter_url: values.twitter_url || null,
      mint_price: values.mint_price || null,
      collection_size: values.collection_size || null,
      status: values.status as ProjectStatus,
      difficulty: values.difficulty ? (values.difficulty as ProjectDifficulty) : null,
      estimated_reward: values.estimated_reward || null,
      deadline: values.deadline ? (values.deadline.length === 10 ? values.deadline + 'T00:00:00Z' : values.deadline.length === 16 ? values.deadline + ':00Z' : values.deadline) : null,
      event_type: values.event_type || null,
      notes: values.notes || null,
      logo_url: initialData?.logo_url || null, // Preserve if editing
    }
    await onSubmit(dataToSubmit)
  }

  const projectType = form.watch('project_type')
  const isNFT = projectType === 'NFT'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-md border border-outline-variant">
          <Button
            type="button"
            variant="ghost"
            className={`rounded-sm ${!isNFT ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => form.setValue('project_type', 'Token')}
          >
            Token
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={`rounded-sm ${isNFT ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => form.setValue('project_type', 'NFT')}
          >
            NFT
          </Button>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-on-surface-variant">Project Name</FormLabel>
              <FormControl>
                <Input placeholder={isNFT ? "Pudgy Penguins, Azuki, Bored Ape..." : "Arbitrum, zkSync, LayerZero..."} className="bg-surface-container border-outline-variant text-on-surface" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {!isNFT && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="chain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-on-surface-variant">Chain</FormLabel>
                  <FormControl>
                    <Input placeholder="Ethereum, Solana, Base..." className="bg-surface-container border-outline-variant text-on-surface" {...field} />
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
                  <FormLabel className="text-on-surface-variant">Status</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val || '')} value={field.value ?? null}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-container border-outline-variant text-on-surface">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-surface-container border-outline-variant text-on-surface">
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Eligible">Eligible</SelectItem>
                      <SelectItem value="Vesting">Vesting</SelectItem>
                      <SelectItem value="Claimed">Claimed</SelectItem>
                      <SelectItem value="Missed">Missed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {isNFT && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-on-surface-variant">Status</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val || '')} value={field.value ?? null}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-container border-outline-variant text-on-surface">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-surface-container border-outline-variant text-on-surface">
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Eligible">Eligible</SelectItem>
                      <SelectItem value="Vesting">Vesting</SelectItem>
                      <SelectItem value="Claimed">Claimed</SelectItem>
                      <SelectItem value="Missed">Missed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-on-surface-variant">Chain</FormLabel>
                  <FormControl>
                    <Input placeholder="Ethereum, Solana, Base..." className="bg-surface-container border-outline-variant text-on-surface" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface-variant">{isNFT ? "Mint Website" : "Website"}</FormLabel>
                <FormControl>
                  <Input placeholder="https://your-project-link.com" className="bg-surface-container border-outline-variant text-on-surface" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="twitter_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface-variant">Twitter (X) URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://x.com/project_name" className="bg-surface-container border-outline-variant text-on-surface" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!isNFT && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-on-surface-variant">Difficulty</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val || '')} value={field.value ?? null}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-container border-outline-variant text-on-surface">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-surface-container border-outline-variant text-on-surface">
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimated_reward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-on-surface-variant">Est. Reward</FormLabel>
                  <FormControl>
                    <Input placeholder="$1,000, 50,000 Pts, etc." className="bg-surface-container border-outline-variant text-on-surface" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {isNFT && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mint_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-on-surface-variant">Mint Price</FormLabel>
                  <FormControl>
                    <Input placeholder="Free Mint, 0.05 ETH, TBA..." className="bg-surface-container border-outline-variant text-on-surface" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collection_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-on-surface-variant">Collection Size</FormLabel>
                  <FormControl>
                    <Input placeholder="10,000, 5,555, TBA..." className="bg-surface-container border-outline-variant text-on-surface" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface-variant">Date/Time (UTC)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" className="bg-surface-container border-outline-variant text-on-surface w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface-variant">Event Type</FormLabel>
                <Select onValueChange={(val) => field.onChange(val || '')} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger className="bg-surface-container border-outline-variant text-on-surface">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-surface-container border-outline-variant text-on-surface">
                    {isNFT ? (
                      <>
                        <SelectItem value="Mint Date">Mint Date</SelectItem>
                        <SelectItem value="Whitelist Deadline">Whitelist Deadline</SelectItem>
                        <SelectItem value="Reveal Date">Reveal Date</SelectItem>
                        <SelectItem value="Task Deadline">Task Deadline</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Task Deadline">Task Deadline</SelectItem>
                        <SelectItem value="TGE Date">TGE Date</SelectItem>
                        <SelectItem value="Claim Deadline">Claim Deadline</SelectItem>
                        <SelectItem value="Snapshot Date">Snapshot Date</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
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
              <FormLabel className="text-on-surface-variant">Notes / Tasks</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={isNFT ? "WL requirements, discord tasks, roles needed..." : "Bridge 0.1 ETH, provide liquidity, daily swap..."}
                  className="resize-none bg-surface-container border-outline-variant text-on-surface h-24" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-on-primary">
            {isLoading ? 'Saving...' : (initialData ? 'Update Project' : 'Add Project')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
