'use server'

import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { revalidatePath } from 'next/cache'
import { ClaimScheduleInsert, ClaimScheduleUpdate } from '@/types'

export async function createClaimSchedule(data: ClaimScheduleInsert) {
  const user = await getPrivyUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()
  
  const { error } = await supabase
    .from('claim_schedules')
    .insert([{ ...data, user_id: user.id }])

  if (error) {
    console.error('Failed to create claim schedule:', error)
    return { error: error.message }
  }

  revalidatePath(`/projects/${data.project_id}`)
  return { success: true }
}

export async function updateClaimSchedule(id: string, projectId: string, data: ClaimScheduleUpdate) {
  const user = await getPrivyUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()
  
  const { error } = await supabase
    .from('claim_schedules')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to update claim schedule:', error)
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function deleteClaimSchedule(id: string, projectId: string) {
  const user = await getPrivyUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()
  
  const { error } = await supabase
    .from('claim_schedules')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to delete claim schedule:', error)
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
