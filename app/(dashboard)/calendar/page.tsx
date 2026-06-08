import { createClient } from '@/lib/supabase/server'
import { Project } from '@/types'
import { format, parseISO, isBefore, startOfToday, isValid } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const supabase = await createClient()

  // Fetch projects with deadlines
  const { data: projectsData, error } = await supabase
    .from('projects')
    .select('*')
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

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Deadlines</h1>
        <p className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-sm">Track upcoming expirations</p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-900 dark:border-white bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-2">No Deadlines</h3>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium">None of your projects have a deadline set.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([monthYear, monthProjects]) => (
            <div key={monthYear} className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-900 dark:text-white border-b-4 border-zinc-900 dark:border-white inline-block pb-1">
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
                      className={`relative p-6 border-2 border-zinc-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all bg-white dark:bg-zinc-950`}
                    >
                      {isExpired && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white font-black uppercase text-[10px] tracking-widest px-2 py-1 border-b-2 border-l-2 border-zinc-900 dark:border-white">
                          Expired
                        </div>
                      )}
                      <p className="text-sm font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">
                        {formattedDate}
                      </p>
                      <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">
                        {project.name}
                      </h3>
                      <div className="flex gap-2">
                        <span className="bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-bold text-xs py-0.5 px-2 uppercase tracking-wider">
                          {project.status}
                        </span>
                        {project.estimated_reward && (
                          <span className="bg-violet-200 border-2 border-violet-900 text-violet-900 dark:bg-violet-900 dark:border-violet-100 dark:text-violet-100 font-bold text-xs py-0.5 px-2 uppercase tracking-wider">
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
