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
      deadline: values.deadline || null,
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
        <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 rounded-md border border-outline-variant dark:border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            className={`rounded-sm ${!isNFT ? 'bg-surface-container-highest dark:bg-zinc-800 text-on-surface dark:text-white shadow-sm' : 'text-zinc-400 hover:text-on-surface dark:text-white'}`}
            onClick={() => form.setValue('project_type', 'Token')}
          >
            Token
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={`rounded-sm ${isNFT ? 'bg-surface-container-highest dark:bg-zinc-800 text-on-surface dark:text-white shadow-sm' : 'text-zinc-400 hover:text-on-surface dark:text-white'}`}
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
              <FormLabel className="text-on-surface-variant dark:text-zinc-300">Project Name</FormLabel>
              <FormControl>
                <Input placeholder={isNFT ? "e.g. Pudgy Penguins" : "e.g. Arbitrum, LayerZero"} className="bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white" {...field} />
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
                  <FormLabel className="text-on-surface-variant dark:text-zinc-300">Chain</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ethereum" className="bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white" {...field} />
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
                  <FormLabel className="text-on-surface-variant dark:text-zinc-300">Status</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val || '')} value={field.value ?? null}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-surface-container dark:bg-zinc-900 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white">
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
                  <FormLabel className="text-on-surface-variant dark:text-zinc-300">Status</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val || '')} value={field.value ?? null}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-surface-container dark:bg-zinc-900 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white">
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
                  <FormLabel className="text-on-surface-variant dark:text-zinc-300">Chain</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ethereum" className="bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white" {...field} />
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
                <FormLabel className="text-on-surface-variant dark:text-zinc-300">{isNFT ? "Mint Website" : "Website"}</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." className="bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white" {...field} />
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
                <FormLabel className="text-on-surface-variant dark:text-zinc-300">Twitter (X) URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://x.com/..." className="bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white" {...field} />
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
                  <FormLabel className="text-on-surface-variant dark:text-zinc-300">Difficulty</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val || '')} value={field.value ?? null}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-surface-container dark:bg-zinc-900 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white">
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
                  <FormLabel className="text-on-surface-variant dark:text-zinc-300">Est. Reward</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. $1000 or 500 Pts" className="bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white" {...field} />
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
                  <FormLabel className="text-on-surface-variant dark:text-zinc-300">Mint Price</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Free, 0.01 ETH" className="bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white" {...field} />
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
                  <FormLabel className="text-on-surface-variant dark:text-zinc-300">Collection Size</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 10000, TBA" className="bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-on-surface-variant dark:text-zinc-300">{isNFT ? "Mint Date" : "Deadline"}</FormLabel>
              <FormControl>
                <Input type="datetime-local" className="bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white w-full dark:[color-scheme:dark]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-on-surface-variant dark:text-zinc-300">Notes / Tasks</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={isNFT ? "Waitlist details, discord requirements..." : "Bridge 0.1 ETH, swap 3 times..."}
                  className="resize-none bg-surface-container dark:bg-surface-container dark:bg-zinc-900/50 border-outline-variant dark:border-zinc-800 text-on-surface dark:text-white h-24" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-on-surface dark:text-white">
            {isLoading ? 'Saving...' : (initialData ? 'Update Project' : 'Add Project')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
