import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { Project } from '@/types'
import { format, parseISO, isBefore, startOfToday, isValid } from 'date-fns'

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
      case 'Claimed': return 'bg-secondary-container text-on-secondary-container'
      case 'Eligible': return 'bg-primary-container text-on-primary-container'
      case 'In Progress': return 'bg-tertiary-container text-on-tertiary-container'
      case 'Vesting': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300'
      case 'Missed': return 'bg-error-container text-on-error-container'
      default: return 'bg-surface-container-high text-on-surface-variant'
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
                {monthProjects.map((project) => {
                  const parsedDate = project.deadline ? parseISO(project.deadline) : null
                  const isExpired = parsedDate && isValid(parsedDate) ? isBefore(parsedDate, today) : false
                  const formattedDate = parsedDate && isValid(parsedDate) ? format(parsedDate, 'MMM dd, yyyy') : project.deadline
                  
                  return (
                    <div 
                      key={project.id}
                      className={`relative p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant sticky-note-shadow hover:scale-[1.02] transition-all duration-200 squishy-interaction overflow-hidden group`}
                    >
                      {isExpired && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-error text-on-error font-label-bold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                            Expired
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary text-lg">event</span>
                        <p className="text-sm font-label-bold text-primary uppercase tracking-widest">
                          {formattedDate}
                        </p>
                      </div>
                      <h3 className="font-headline-md text-on-surface mb-3">
                        {project.name}
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`font-label-bold text-[10px] py-1 px-3 uppercase tracking-wider rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        {project.estimated_reward && (
                          <span className="font-label-bold text-[10px] py-1 px-3 uppercase tracking-wider rounded-full bg-primary-container/50 text-primary">
                            {project.estimated_reward}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
