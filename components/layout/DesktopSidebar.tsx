'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DesktopSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  const navItems = [
    { href: '/', icon: 'grid_view', label: 'Dashboard' },
    { href: '/projects', icon: 'folder', label: 'Projects' },
    { href: '/calendar', icon: 'calendar_month', label: 'Calendar' },
    { href: '/logs', icon: 'assignment', label: 'Activity Logs' },
  ]

  const toolItems = [
    { href: '/plan', icon: 'psychology', label: 'AI Masterplan' },
    { href: '/import', icon: 'upload_file', label: 'Import CSV' },
  ]

  if (!isOpen) {
    return (
      <aside className="w-[80px] border-r-2 border-outline-variant/30 bg-surface-container-lowest hidden md:flex flex-col items-center py-6 z-40 transition-all duration-300 relative h-screen sticky top-0 shrink-0">
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-xl transition-colors mb-8"
          title="Expand Sidebar"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="flex-1 flex flex-col gap-4 w-full px-3 overflow-y-auto scrollbar-hide items-center mt-6">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} title={item.label} className={`p-3 rounded-xl transition-colors flex items-center justify-center squishy-interaction ${isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>
                <span className="material-symbols-outlined" style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>{item.icon}</span>
              </Link>
            )
          })}
          
          <div className="h-px w-8 bg-outline-variant/30 my-2"></div>
          
          {toolItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} title={item.label} className={`p-3 rounded-xl transition-colors flex items-center justify-center squishy-interaction ${isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>
                <span className="material-symbols-outlined" style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>{item.icon}</span>
              </Link>
            )
          })}
          <a href="/api/export" title="Export CSV" className="p-3 rounded-xl transition-colors flex items-center justify-center squishy-interaction text-on-surface-variant hover:bg-surface-container-highest">
            <span className="material-symbols-outlined">download</span>
          </a>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-[260px] border-r-2 border-outline-variant/30 bg-surface-container-lowest p-6 hidden md:flex flex-col z-40 transition-all duration-300 relative h-screen sticky top-0 shrink-0">
      <div className="flex items-center justify-between h-12 mb-8">
        <div className="flex items-center gap-3 font-headline-lg-mobile text-primary tracking-tighter cursor-pointer overflow-hidden">
          <div className="p-2 bg-primary-container/20 rounded-xl text-primary shrink-0">
            <span className="material-symbols-outlined">bubble_chart</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl leading-none">ERDROP</span>
            <span className="text-[9px] font-label-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">Track Every Drop</span>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-lg transition-colors shrink-0 ml-2"
          title="Collapse Sidebar"
        >
          <span className="material-symbols-outlined text-sm">keyboard_double_arrow_left</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <nav className="flex flex-col gap-2 font-label-bold text-on-surface-variant">
          <div className="text-[10px] font-black text-outline uppercase tracking-widest mb-2 px-3">Menu</div>
          
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className={`px-4 py-3 rounded-full transition-colors flex items-center gap-3 squishy-interaction ${isActive ? 'bg-primary-container text-on-primary-container' : 'hover:bg-surface-container-highest'}`}>
                <span className="material-symbols-outlined" style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
          
          <div className="text-[10px] font-black text-outline uppercase tracking-widest mb-2 px-3 mt-6">Tools</div>
          {toolItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className={`px-4 py-3 rounded-full transition-colors flex items-center gap-3 squishy-interaction ${isActive ? 'bg-primary-container text-on-primary-container' : 'hover:bg-surface-container-highest'}`}>
                <span className="material-symbols-outlined" style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
          <a href="/api/export" className="px-4 py-3 rounded-full hover:bg-surface-container-highest transition-colors flex items-center gap-3 squishy-interaction">
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </a>
        </nav>
      </div>
    </aside>
  )
}
