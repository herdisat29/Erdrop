'use server'

import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { revalidatePath } from 'next/cache'
import { ProjectInsert, ProjectUpdate } from '@/types'

export async function createProject(data: ProjectInsert) {
  const user = await getPrivyUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()
  const { error } = await supabase
    .from('projects')
    .insert({
      ...data,
      user_id: user.id
    })

  if (error) {
    console.error('Error creating project:', error)
    return { error: error.message }
  }

  revalidatePath('/projects')
  return { success: true }
}

export async function updateProject(id: string, data: ProjectUpdate) {
  const user = await getPrivyUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()
  const { error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating project:', error)
    return { error: error.message }
  }

  revalidatePath('/projects')
  return { success: true }
}

export async function deleteProject(id: string) {
  const user = await getPrivyUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting project:', error)
    return { error: error.message }
  }

  revalidatePath('/projects')
  return { success: true }
}
