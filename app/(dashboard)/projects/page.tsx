import { createClient } from '@/lib/supabase/server'
import { ProjectList } from '@/components/projects/ProjectList'
import { Project } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return (
      <div className="p-6 rounded-xl border border-red-900/50 bg-red-900/10 text-red-400">
        Failed to load projects: {error.message}
      </div>
    )
  }

  return <ProjectList projects={projects as Project[]} />
}
