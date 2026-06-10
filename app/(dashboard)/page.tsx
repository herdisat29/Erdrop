import { createClient } from '@/lib/supabase/server'
import { Project, Log } from '@/types'
import { PortfolioCharts } from '@/components/analytics/PortfolioCharts'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch projects
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (projectsError) {
    throw new Error(`Failed to load projects: ${projectsError.message}`)
  }

  const projects = (projectsData as Project[]) || []
  const totalProjects = projects.length
  const activeFarming = projects.filter(
    (p) => p.status === 'In Progress' || p.status === 'Eligible'
  ).length

  // Fetch logs with project_id for table statistics
  const { data: logsData, error: logsError } = await supabase
    .from('logs')
    .select('id, project_id, status, estimated_value')

  if (logsError) {
    throw new Error(`Failed to load logs: ${logsError.message}`)
  }

  const logs = (logsData as { id: string, project_id: string, status: Log['status']; estimated_value: number | null }[]) || []
  const pendingTasks = logs.filter((l) => l.status === 'Pending').length
  // Helper to parse string reward like "$1,000" or "500 tokens" to a number
  const parseReward = (reward: string | null): number => {
    if (!reward) return 0;
    const cleanStr = reward.replace(/,/g, '');
    const match = cleanStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  // Calculate claimed value from projects that are marked as 'Claimed'
  const estimatedValue = projects
    .filter((p) => p.status === 'Claimed')
    .reduce((acc, p) => acc + parseReward(p.estimated_reward), 0)

  const activePercent = totalProjects > 0 ? (activeFarming / totalProjects) * 100 : 0;
  const pendingPercent = logs.length > 0 ? (pendingTasks / logs.length) * 100 : 0;

  // Recent projects for the table (top 5)
  const recentProjects = projects.slice(0, 5)

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      {/* Welcome Section */}
      <header className="mb-8 pt-4">
        <h3 className="font-headline-lg text-headline-lg text-on-surface">Welcome Back</h3>
        <p className="text-body-lg text-on-surface-variant mt-1">Track your farming progress and maximize your potential airdrops.</p>
      </header>

      {/* Stats Grid (New Bento Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Card 1: Total Projects */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(32,93,174,0.1)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <span className="text-primary font-bold text-[11px] tracking-widest uppercase">TOTAL PROJECTS</span>
              <div className="text-[48px] font-extrabold text-on-surface mt-2 leading-none">{totalProjects}</div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
              <span>All recorded projects</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
        </div>

        {/* Card 2: Active Farming */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(32,93,174,0.1)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <span className="text-secondary font-bold text-[11px] tracking-widest uppercase">ACTIVE FARMING</span>
              <div className="text-[48px] font-extrabold text-on-surface mt-2 leading-none">{activeFarming}</div>
            </div>
            <div className="mt-4 w-full bg-secondary-fixed h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full transition-all duration-1000" style={{ width: `${activePercent}%` }}></div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary"></div>
        </div>

        {/* Card 3: Pending Tasks */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(32,93,174,0.1)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_late</span>
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <span className="text-tertiary font-bold text-[11px] tracking-widest uppercase">PENDING TASKS</span>
              <div className="text-[48px] font-extrabold text-on-surface mt-2 leading-none">{pendingTasks}</div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-tertiary text-sm">
                {pendingTasks === 0 ? 'check_circle' : 'schedule'}
              </span>
              <span>{pendingTasks === 0 ? 'All caught up!' : `${pendingTasks} tasks to do`}</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
        </div>

        {/* Card 4: Claimed Value */}
        <div className="bg-primary text-on-primary rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(32,93,174,0.1)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <span className="text-primary-fixed font-bold text-[11px] tracking-widest uppercase">CLAIMED VALUE</span>
              <div className="text-[48px] font-extrabold text-white mt-2 leading-none">${estimatedValue.toLocaleString()}</div>
            </div>
            <Link href="/logs" className="mt-4 text-label-bold bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm transition-colors self-start inline-block">
              View History
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-fixed"></div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-primary text-3xl">insights</span>
          <h4 className="font-headline-md text-headline-md text-on-surface">Analytics</h4>
        </div>
        <div className="-mt-4">
          <PortfolioCharts projects={projects} />
        </div>
      </div>

      {/* Recent Projects Table Area */}
      <section className="mt-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h4 className="font-headline-md text-[20px] sm:text-headline-md text-on-surface whitespace-nowrap">Recent Projects</h4>
          <Link href="/projects" className="px-4 py-2 border border-outline-variant rounded-full font-label-bold hover:bg-surface-container-low transition-colors text-sm w-full sm:w-auto text-center whitespace-nowrap shrink-0">
            View All Projects
          </Link>
        </div>
        
        {/* Desktop Table (Hidden on small screens) */}
        <div className="hidden md:block bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 font-label-bold text-[12px] text-outline tracking-wider">PROJECT NAME</th>
                <th className="px-6 py-4 font-label-bold text-[12px] text-outline tracking-wider">NETWORK</th>
                <th className="px-6 py-4 font-label-bold text-[12px] text-outline tracking-wider">STATUS</th>
                <th className="px-6 py-4 font-label-bold text-[12px] text-outline tracking-wider">TASKS</th>
                <th className="px-6 py-4 font-label-bold text-[12px] text-outline tracking-wider text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {recentProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    No projects yet. Start by adding one!
                  </td>
                </tr>
              ) : (
                recentProjects.map((project) => {
                  const projectLogs = logs.filter(l => l.project_id === project.id)
                  const completedTasks = projectLogs.filter(l => l.status === 'Completed').length
                  const totalTasks = projectLogs.length

                  return (
                    <tr key={project.id} className="hover:bg-surface-container-highest transition-colors group relative">
                      <td className="px-6 py-4">
                        <Link href={`/projects/${project.id}`} className="absolute inset-0 z-10" aria-label={`View ${project.name}`} />
                        <div className="flex items-center gap-3 relative z-0 pointer-events-none">
                          <div className="w-8 h-8 rounded-lg bg-primary-container/30 flex items-center justify-center text-primary font-bold uppercase shrink-0">
                            {project.name.charAt(0)}
                          </div>
                          <span className="font-label-bold whitespace-nowrap">{project.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant whitespace-nowrap relative z-0 pointer-events-none">
                        {project.chain || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 relative z-0 pointer-events-none">
                        <span className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          project.status === 'In Progress' || project.status === 'Eligible' 
                            ? 'bg-secondary-fixed text-on-secondary-container'
                            : project.status === 'Claimed'
                            ? 'bg-primary-container text-on-primary-container'
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 relative z-0 pointer-events-none">
                        <div className="text-[12px] font-bold text-on-surface-variant whitespace-nowrap">
                          {completedTasks} / {totalTasks}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right relative z-20">
                        <Link href={`/projects/${project.id}`} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-surface-container-lowest rounded-full inline-block">
                          <span className="material-symbols-outlined align-middle">chevron_right</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List (Hidden on medium/large screens) */}
        <div className="md:hidden flex flex-col gap-3">
          {recentProjects.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 text-center text-on-surface-variant">
              No projects yet. Start by adding one!
            </div>
          ) : (
            recentProjects.map((project) => {
              const projectLogs = logs.filter(l => l.project_id === project.id)
              const completedTasks = projectLogs.filter(l => l.status === 'Completed').length
              const totalTasks = projectLogs.length

              return (
                <Link key={project.id} href={`/projects/${project.id}`} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col gap-3 hover:bg-surface-container-low transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary font-bold uppercase shrink-0 text-lg">
                        {project.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-bold text-on-surface line-clamp-1">{project.name}</span>
                        <span className="text-[12px] text-on-surface-variant">{project.chain || 'Unknown'}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${
                      project.status === 'In Progress' || project.status === 'Eligible' 
                        ? 'bg-secondary-fixed text-on-secondary-container'
                        : project.status === 'Claimed'
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3 mt-1">
                    <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined text-[16px]">task_alt</span>
                      <span>Tasks: {completedTasks} / {totalTasks}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[12px] text-primary font-bold">
                      Open Project
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
