import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

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
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white relative transition-colors duration-300">
      {/* Ambient glowing background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-200/50 via-zinc-50 to-zinc-50 dark:from-violet-900/10 dark:via-zinc-950 dark:to-zinc-950 pointer-events-none transition-colors duration-300" />
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl p-6 hidden md:block z-10 transition-colors duration-300">
        <div className="flex h-12 items-center gap-3 font-bold text-xl text-zinc-900 dark:text-white group cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-[0_0_15px_rgba(124,58,237,0.3)] group-hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">Erdrop</span>
        </div>
        
        <nav className="mt-10 flex flex-col gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider mb-2 px-3">Menu</div>
          <Link href="/" className="rounded-lg px-3 py-2.5 transition-all duration-300 hover:bg-zinc-200/50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white flex items-center gap-3 group">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            Dashboard
          </Link>
          <Link href="/projects" className="rounded-lg px-3 py-2.5 transition-all duration-300 hover:bg-zinc-200/50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white flex items-center gap-3 group">
            <div className="h-1.5 w-1.5 rounded-full bg-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            Projects
          </Link>
          <Link href="/logs" className="rounded-lg px-3 py-2.5 transition-all duration-300 hover:bg-zinc-200/50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white flex items-center gap-3 group">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            Activity Logs
          </Link>
          
          <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider mb-2 px-3 mt-6">Tools</div>
          <Link href="/import" className="rounded-lg px-3 py-2.5 transition-all duration-300 hover:bg-zinc-200/50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white flex items-center gap-3 group">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            Import CSV
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden z-10">
        {/* Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/30 dark:bg-zinc-950/30 px-6 backdrop-blur-xl transition-colors duration-300">
          <h1 className="font-semibold text-lg text-zinc-800 dark:text-white/90">Dashboard Overview</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="text-sm px-4 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-700 dark:text-white transition-all duration-300">
                Sign Out
              </button>
            </form>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
