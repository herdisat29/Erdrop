'use server'

import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { revalidatePath } from 'next/cache'
import { LogInsert, LogUpdate, ProjectInsert } from '@/types'

export async function createLog(data: LogInsert) {
  const user = await getPrivyUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()
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
  const user = await getPrivyUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()
  
  // Verify project ownership to prevent IDOR
  const { data: project } = await supabase.from('projects').select('id').eq('id', projectId).eq('user_id', user.id).single()
  if (!project) return { error: 'Unauthorized' }

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
  const user = await getPrivyUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = createClient()
  
  // Verify project ownership to prevent IDOR
  const { data: project } = await supabase.from('projects').select('id').eq('id', projectId).eq('user_id', user.id).single()
  if (!project) return { error: 'Unauthorized' }

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

/**
 * Bulk import projects from CSV via server action.
 */
export async function bulkCreateProjects(projects: ProjectInsert[]) {
  const user = await getPrivyUser()
  if (!user) return { error: 'Unauthorized' }

  if (!projects || projects.length === 0) {
    return { error: 'No projects to import' }
  }

  const projectsWithUser = projects.map(p => ({ ...p, user_id: user.id }))

  const supabase = createClient()
  const { error } = await supabase
    .from('projects')
    .insert(projectsWithUser)

  if (error) {
    console.error('Error bulk inserting projects:', error)
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/')
  return { success: true, count: projects.length }
}
