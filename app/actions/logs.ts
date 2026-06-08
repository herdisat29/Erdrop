'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { LogInsert, LogUpdate } from '@/types'

export async function createLog(data: LogInsert) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('logs')
    .insert({
      ...data,
      user_id: user.id
    })

  if (error) {
    console.error('Error creating log:', error)
    return { error: error.message }
  }

  revalidatePath(`/projects/${data.project_id}`)
  revalidatePath('/logs')
  revalidatePath('/')
  return { success: true }
}

export async function updateLog(id: string, projectId: string, data: LogUpdate) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('logs')
    .update(data)
    .eq('id', id)

  if (error) {
    console.error('Error updating log:', error)
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/logs')
  revalidatePath('/')
  return { success: true }
}

export async function deleteLog(id: string, projectId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('logs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting log:', error)
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/logs')
  revalidatePath('/')
  return { success: true }
}
