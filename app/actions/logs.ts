'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { LogInsert, LogUpdate, ProjectInsert } from '@/types'

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

  // [FIX] Auth check added — was missing before
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

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

  // [FIX] Auth check added — was missing before
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

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
 * [NEW] Bulk import projects from CSV via server action.
 * Replaces direct client-side Supabase insert in ImportWizard.
 */
export async function bulkCreateProjects(projects: ProjectInsert[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  if (!projects || projects.length === 0) {
    return { error: 'No projects to import' }
  }

  const projectsWithUser = projects.map(p => ({ ...p, user_id: user.id }))

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
