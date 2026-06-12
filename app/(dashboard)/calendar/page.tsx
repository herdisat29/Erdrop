import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { Project } from '@/types'
import { format, parseISO, isBefore, startOfToday, isValid } from 'date-fns'
import { ProjectCard } from '@/components/projects/ProjectCard'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const user = await getPrivyUser()
  if (!user) return null

  const supabase = createClient()

  // Fetch projects with deadlines
  const { data: projectsData, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .not('deadline', 'is', null)
    .order('deadline', { ascending: true })

  if (error) {
    throw new Error(`Failed to load projects: ${error.message}`)
  }

  const projects = (projectsData as Project[]) || []
  const today = startOfToday()

  // Group projects by month-year
  const grouped = projects.reduce((acc, project) => {
    if (!project.deadline) return acc
    const date = parseISO(project.deadline)
    const monthYear = isValid(date) ? format(date, 'MMMM yyyy') : 'TBA / Unspecified'
    
    if (!acc[monthYear]) {
      acc[monthYear] = []
    }
    acc[monthYear].push(project)
    return acc
  }, {} as Record<string, Project[]>)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Claimed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
      case 'Eligible': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
      case 'In Progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
      case 'Vesting': return 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30'
      case 'Missed': return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30'
      default: return 'bg-surface-container-high text-on-surface-variant border border-outline-variant'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">calendar_month</span>
          Deadlines
        </h1>
        <p className="font-body-md text-on-surface-variant text-sm">Track upcoming expirations and mint dates.</p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-outline-variant bg-surface-container-lowest">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container mb-4">
            <span className="material-symbols-outlined text-on-surface-variant text-3xl">event_busy</span>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface mb-2">No Deadlines</h3>
          <p className="font-label-sm text-on-surface-variant max-w-sm">None of your projects have a deadline set.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([monthYear, monthProjects]) => (
            <div key={monthYear} className="space-y-4">
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">date_range</span>
                {monthYear}
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {monthProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
