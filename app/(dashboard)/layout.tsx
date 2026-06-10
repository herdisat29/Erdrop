import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { WalletConnect } from '@/components/wallet/WalletConnect'
import { MobileNav } from '@/components/layout/MobileNav'
import { LogoutButton } from '@/components/auth/LogoutButton'

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
            <div className="flex flex-col md:hidden">
              <h1 className="text-headline-lg-mobile font-extrabold text-primary tracking-tighter leading-none">ERDROP</h1>
              <span className="text-[9px] font-label-bold uppercase tracking-widest text-on-surface-variant">Track Every Drop</span>
            </div>
            <h1 className="text-headline-md font-bold text-on-surface hidden md:block">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <WalletConnect />
            <ThemeToggle />
            <span className="text-label-bold text-on-surface-variant hidden lg:inline-block">{user.email}</span>
            <LogoutButton />
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 w-full max-w-[1200px] mx-auto">
          {children}
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

    </div>
  )
}
