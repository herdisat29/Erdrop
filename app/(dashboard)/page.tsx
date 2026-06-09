import { createClient } from '@/lib/supabase/server'
import { Project, Log } from '@/types'
import { PortfolioCharts } from '@/components/analytics/PortfolioCharts'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch projects
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select('*')

  if (projectsError) {
    throw new Error(`Failed to load projects: ${projectsError.message}`)
  }

  const projects = (projectsData as Project[]) || []
  const totalProjects = projects.length
  const activeFarming = projects.filter(
    (p) => p.status === 'In Progress' || p.status === 'Eligible'
  ).length

  // Fetch logs
  const { data: logsData, error: logsError } = await supabase
    .from('logs')
    .select('status, estimated_value')

  if (logsError) {
    throw new Error(`Failed to load logs: ${logsError.message}`)
  }

  const logs = (logsData as { status: Log['status']; estimated_value: number | null }[]) || []
  const pendingTasks = logs.filter((l) => l.status === 'Pending').length
  const estimatedValue = logs.reduce(
    (acc, log) => acc + (log.estimated_value || 0),
    0
  )

  const activePercent = totalProjects > 0 ? (activeFarming / totalProjects) * 100 : 0;
  const pendingPercent = logs.length > 0 ? (pendingTasks / logs.length) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Welcome Section */}
      <section className="pt-4 space-y-2">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Welcome Back</h2>
        <p className="font-body-md text-on-surface-variant text-sm">Track your farming progress and maximize your potential airdrops.</p>
      </section>

      {/* Stats Grid (Mobile Stack) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant sticky-note-shadow relative overflow-hidden group squishy-interaction">
          <div className="absolute top-0 right-0 w-12 h-12 bg-primary-container/10 -mr-4 -mt-4 rounded-full"></div>
          <p className="font-label-bold text-label-bold text-primary mb-1 uppercase tracking-wider">Total Projects</p>
          <div className="flex items-end justify-between">
            <span className="font-display-lg text-display-lg text-on-surface">{totalProjects}</span>
            <span className="material-symbols-outlined text-primary/40 text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>folder</span>
          </div>
          <div className="h-1.5 w-full bg-primary-container/20 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Active Farming */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant sticky-note-shadow relative overflow-hidden squishy-interaction">
          <div className="absolute top-0 right-0 w-12 h-12 bg-secondary-container/10 -mr-4 -mt-4 rounded-full"></div>
          <p className="font-label-bold text-label-bold text-secondary mb-1 uppercase tracking-wider">Active Farming</p>
          <div className="flex items-end justify-between">
            <span className="font-display-lg text-display-lg text-on-surface">{activeFarming}</span>
            <span className="material-symbols-outlined text-secondary/40 text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
          </div>
          <div className="h-1.5 w-full bg-secondary-container/20 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full transition-all duration-1000" style={{ width: `${activePercent}%` }}></div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant sticky-note-shadow relative overflow-hidden squishy-interaction">
          <div className="absolute top-0 right-0 w-12 h-12 bg-tertiary-container/10 -mr-4 -mt-4 rounded-full"></div>
          <p className="font-label-bold text-label-bold text-tertiary mb-1 uppercase tracking-wider">Pending Tasks</p>
          <div className="flex items-end justify-between">
            <span className="font-display-lg text-display-lg text-on-surface">{pendingTasks}</span>
            <span className="material-symbols-outlined text-tertiary/40 text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>assignment_late</span>
          </div>
          <div className="h-1.5 w-full bg-tertiary-container/20 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-tertiary rounded-full transition-all duration-1000" style={{ width: `${pendingPercent}%` }}></div>
          </div>
        </div>

        {/* Estimated Value */}
        <div className="bg-primary p-5 rounded-2xl sticky-note-shadow relative overflow-hidden squishy-interaction">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 -mr-6 -mt-6 rounded-full"></div>
          <p className="font-label-bold text-label-bold text-white/80 mb-1 uppercase tracking-wider">Est. Value</p>
          <div className="flex items-end justify-between">
            <span className="font-display-lg text-display-lg text-white">${estimatedValue.toLocaleString()}</span>
            <span className="material-symbols-outlined text-white/40 text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>monetization_on</span>
          </div>
        </div>
      </section>

      {/* Analytics Charts */}
      <section className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant sticky-note-shadow">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">pie_chart</span>
          Analytics
        </h3>
        <PortfolioCharts projects={projects} />
      </section>

      {/* Cute Mascot Interaction */}
      <div className="flex flex-col items-center py-8 text-center space-y-4">
        <div className="w-24 h-24 bg-primary-container/20 rounded-full flex items-center justify-center squishy-interaction transition-transform cursor-pointer hover:scale-110 hover:rotate-6">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRIdqq6MYzdrelsyLn8EAe-L5vuzya9j8CwA3M6mUQM7s2lsPRv8w5lSCCqPAcRhTP6xUDVs7WG6krQc4e_4CVAcprHz31mxASWs_YKSEyeD7NuAI_3Reczyrnj27BUEgFSS-UrYOyHWdlJ_42_DsnrqPMXRa9vmTiFMRTj7nS8Z5IPW_dAMY3Y3ikHORX0_jpEMWMcmPhXFDgLUfgkfDtNf8F5NWEp8c_cTxaNdRNWfDEqONzD6OiNcw2xAzJj38SHmpRdjP3JQ" 
            alt="Mascot" 
            className="w-16 h-16" 
          />
        </div>
        <div>
          <p className="font-label-bold text-primary">You're doing great!</p>
          <p className="text-label-sm text-on-surface-variant">{activeFarming} projects currently active.</p>
        </div>
      </div>
    </div>
  )
}
