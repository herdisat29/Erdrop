import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { WalletConnect } from '@/components/wallet/WalletConnect'
import { MobileNav } from '@/components/layout/MobileNav'
import { DesktopSidebar } from '@/components/layout/DesktopSidebar'
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
      
      {/* Desktop Sidebar (Collapsible, Client Component) */}
      <DesktopSidebar />

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
