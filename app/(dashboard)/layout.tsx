import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { WalletConnect } from '@/components/wallet/WalletConnect'
import { Home, FolderOpen, ScrollText, Upload } from 'lucide-react'

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
    <div className="flex min-h-screen bg-[#f4f4f0] dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 border-r-2 border-zinc-900 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 hidden md:flex flex-col z-10 transition-colors duration-300 relative">
        <div className="flex h-12 items-center gap-3 font-black text-2xl text-zinc-900 dark:text-white uppercase tracking-tighter cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center bg-violet-500 text-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          ERDROP
        </div>
        
        <nav className="mt-10 flex flex-col gap-3 font-bold text-sm text-zinc-900 dark:text-zinc-100">
          <div className="text-xs font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2 px-3">Menu</div>
          <Link href="/" className="px-3 py-2.5 border-2 border-transparent hover:border-zinc-900 dark:hover:border-zinc-700 hover:bg-violet-100 dark:hover:bg-zinc-900 hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(82,82,91,1)] transition-all flex items-center gap-3">
            Dashboard
          </Link>
          <Link href="/projects" className="px-3 py-2.5 border-2 border-transparent hover:border-zinc-900 dark:hover:border-zinc-700 hover:bg-emerald-100 dark:hover:bg-zinc-900 hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(82,82,91,1)] transition-all flex items-center gap-3">
            Projects
          </Link>
          <Link href="/calendar" className="px-3 py-2.5 border-2 border-transparent hover:border-zinc-900 dark:hover:border-zinc-700 hover:bg-blue-100 dark:hover:bg-zinc-900 hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(82,82,91,1)] transition-all flex items-center gap-3">
            Calendar
          </Link>
          <Link href="/logs" className="px-3 py-2.5 border-2 border-transparent hover:border-zinc-900 dark:hover:border-zinc-700 hover:bg-fuchsia-100 dark:hover:bg-zinc-900 hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(82,82,91,1)] transition-all flex items-center gap-3">
            Activity Logs
          </Link>
          
          <div className="text-xs font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2 px-3 mt-6">Tools</div>
          <Link href="/plan" className="px-3 py-2.5 border-2 border-transparent hover:border-zinc-900 dark:hover:border-zinc-700 hover:bg-violet-100 dark:hover:bg-zinc-900 hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(82,82,91,1)] transition-all flex items-center gap-3">
            AI Masterplan
          </Link>
          <Link href="/import" className="px-3 py-2.5 border-2 border-transparent hover:border-zinc-900 dark:hover:border-zinc-700 hover:bg-amber-100 dark:hover:bg-zinc-900 hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(82,82,91,1)] transition-all flex items-center gap-3">
            Import CSV
          </Link>
          <a href="/api/export" className="px-3 py-2.5 border-2 border-transparent hover:border-zinc-900 dark:hover:border-zinc-700 hover:bg-blue-100 dark:hover:bg-zinc-900 hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(82,82,91,1)] transition-all flex items-center gap-3">
            Export CSV
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden z-10 pb-16 md:pb-0">
        {/* Navbar */}
        <header className="flex h-16 items-center justify-between border-b-2 border-zinc-900 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 md:px-6 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-violet-500 text-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] md:hidden shrink-0">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="font-black text-lg md:text-xl text-zinc-900 dark:text-white uppercase tracking-tight hidden sm:block">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <WalletConnect />
            <ThemeToggle />
            <span className="text-sm text-zinc-900 dark:text-zinc-300 font-bold hidden lg:inline-block">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="flex items-center justify-center h-9 md:h-auto px-3 md:px-4 py-1.5 border-2 border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
                <span className="hidden sm:inline-block text-xs md:text-sm font-bold uppercase">Sign Out</span>
                <svg className="h-4 w-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </form>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-zinc-950 border-t-2 border-zinc-900 dark:border-zinc-800 flex items-center gap-6 overflow-x-auto px-6 z-50 scrollbar-hide">
          <Link href="/" className="flex flex-col items-center gap-1 font-bold text-zinc-900 dark:text-zinc-400 min-w-fit">
            <Home className="h-5 w-5" />
            <span className="text-[10px] uppercase tracking-wider">Home</span>
          </Link>
          <Link href="/projects" className="flex flex-col items-center gap-1 font-bold text-zinc-900 dark:text-zinc-400 min-w-fit">
            <FolderOpen className="h-5 w-5" />
            <span className="text-[10px] uppercase tracking-wider">Projects</span>
          </Link>
          <Link href="/calendar" className="flex flex-col items-center gap-1 font-bold text-zinc-900 dark:text-zinc-400 min-w-fit">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-[10px] uppercase tracking-wider">Calendar</span>
          </Link>
          <Link href="/logs" className="flex flex-col items-center gap-1 font-bold text-zinc-900 dark:text-zinc-400 min-w-fit">
            <ScrollText className="h-5 w-5" />
            <span className="text-[10px] uppercase tracking-wider">Logs</span>
          </Link>
          <Link href="/plan" className="flex flex-col items-center gap-1 font-bold text-zinc-900 dark:text-zinc-400 min-w-fit">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span className="text-[10px] uppercase tracking-wider">Plan</span>
          </Link>
          <Link href="/import" className="flex flex-col items-center gap-1 font-bold text-zinc-900 dark:text-zinc-400 min-w-fit">
            <Upload className="h-5 w-5" />
            <span className="text-[10px] uppercase tracking-wider">Import</span>
          </Link>
          <a href="/api/export" className="flex flex-col items-center gap-1 font-bold text-zinc-900 dark:text-zinc-400 min-w-fit">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span className="text-[10px] uppercase tracking-wider">Export</span>
          </a>
        </nav>
      </main>
    </div>
  )
}
