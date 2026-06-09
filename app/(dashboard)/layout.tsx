import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { WalletConnect } from '@/components/wallet/WalletConnect'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-background text-on-surface font-sans overflow-hidden">
      
      {/* Desktop Sidebar (M3 Styled) */}
      <aside className="w-[260px] border-r-2 border-outline-variant/30 bg-surface-container-lowest p-6 hidden md:flex flex-col z-40 transition-colors duration-300 relative">
        <div className="flex h-12 items-center gap-3 font-headline-lg-mobile text-primary tracking-tighter cursor-pointer">
          <div className="p-2 bg-primary-container/20 rounded-xl text-primary">
            <span className="material-symbols-outlined">bubble_chart</span>
          </div>
          <span className="font-extrabold">ERDROP</span>
        </div>
        
        <nav className="mt-10 flex flex-col gap-2 font-label-bold text-on-surface-variant">
          <div className="text-[10px] font-black text-outline uppercase tracking-widest mb-2 px-3">Menu</div>
          
          <Link href="/" className="px-4 py-3 rounded-full hover:bg-surface-container-highest transition-colors flex items-center gap-3 squishy-interaction">
            <span className="material-symbols-outlined">grid_view</span>
            Dashboard
          </Link>
          <Link href="/projects" className="px-4 py-3 rounded-full hover:bg-surface-container-highest transition-colors flex items-center gap-3 squishy-interaction">
            <span className="material-symbols-outlined">folder</span>
            Projects
          </Link>
          <Link href="/calendar" className="px-4 py-3 rounded-full hover:bg-surface-container-highest transition-colors flex items-center gap-3 squishy-interaction">
            <span className="material-symbols-outlined">calendar_month</span>
            Calendar
          </Link>
          <Link href="/logs" className="px-4 py-3 rounded-full hover:bg-surface-container-highest transition-colors flex items-center gap-3 squishy-interaction">
            <span className="material-symbols-outlined">assignment</span>
            Activity Logs
          </Link>
          
          <div className="text-[10px] font-black text-outline uppercase tracking-widest mb-2 px-3 mt-6">Tools</div>
          <Link href="/plan" className="px-4 py-3 rounded-full hover:bg-surface-container-highest transition-colors flex items-center gap-3 squishy-interaction">
            <span className="material-symbols-outlined">psychology</span>
            AI Masterplan
          </Link>
          <Link href="/import" className="px-4 py-3 rounded-full hover:bg-surface-container-highest transition-colors flex items-center gap-3 squishy-interaction">
            <span className="material-symbols-outlined">upload_file</span>
            Import CSV
          </Link>
          <a href="/api/export" className="px-4 py-3 rounded-full hover:bg-surface-container-highest transition-colors flex items-center gap-3 squishy-interaction">
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full h-screen overflow-y-auto pb-24 md:pb-0">
        
        {/* Top App Bar */}
        <header className="sticky top-0 left-0 w-full z-30 flex justify-between items-center px-4 md:px-6 h-16 bg-surface/80 backdrop-blur-md rounded-b-xl border-b-2 border-primary-container/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-container/20 rounded-xl text-primary md:hidden">
              <span className="material-symbols-outlined">bubble_chart</span>
            </div>
            <h1 className="text-headline-lg-mobile font-extrabold text-primary tracking-tighter md:hidden">ERDROP</h1>
            <h1 className="text-headline-md font-bold text-on-surface hidden md:block">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <WalletConnect />
            <ThemeToggle />
            <span className="text-label-bold text-on-surface-variant hidden lg:inline-block">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 rounded-xl border-2 border-outline-variant/30 bg-surface-container hover:bg-surface-container-highest text-on-surface shadow-sm squishy-interaction transition-all">
                <span className="hidden sm:inline-block text-label-bold">Sign Out</span>
                <span className="material-symbols-outlined sm:hidden text-lg">logout</span>
              </button>
            </form>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 w-full max-w-[1200px] mx-auto">
          {children}
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex items-center gap-2 overflow-x-auto px-4 pb-4 pt-2 bg-surface/90 backdrop-blur-md rounded-t-xl border-t-2 border-primary-container/20 scrollbar-hide">
        <Link href="/" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-6 py-1.5 squishy-interaction min-w-fit">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>grid_view</span>
          <span className="font-label-sm text-[10px]">Home</span>
        </Link>
        <Link href="/projects" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-surface-container-highest rounded-full transition-colors squishy-interaction min-w-fit">
          <span className="material-symbols-outlined">folder</span>
          <span className="font-label-sm text-[10px]">Projects</span>
        </Link>
        <Link href="/calendar" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-surface-container-highest rounded-full transition-colors squishy-interaction min-w-fit">
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="font-label-sm text-[10px]">Calendar</span>
        </Link>
        <Link href="/logs" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-surface-container-highest rounded-full transition-colors squishy-interaction min-w-fit">
          <span className="material-symbols-outlined">assignment</span>
          <span className="font-label-sm text-[10px]">Logs</span>
        </Link>
        <Link href="/plan" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-surface-container-highest rounded-full transition-colors squishy-interaction min-w-fit">
          <span className="material-symbols-outlined">psychology</span>
          <span className="font-label-sm text-[10px]">Plan</span>
        </Link>
        <Link href="/import" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-surface-container-highest rounded-full transition-colors squishy-interaction min-w-fit border-l border-outline-variant/30">
          <span className="material-symbols-outlined">upload_file</span>
          <span className="font-label-sm text-[10px]">Import</span>
        </Link>
        <a href="/api/export" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-surface-container-highest rounded-full transition-colors squishy-interaction min-w-fit">
          <span className="material-symbols-outlined">download</span>
          <span className="font-label-sm text-[10px]">Export</span>
        </a>
      </nav>

    </div>
  )
}
