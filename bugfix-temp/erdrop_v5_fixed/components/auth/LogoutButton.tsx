'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const { logout } = usePrivy()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
    router.refresh()
  }

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-1.5 justify-center px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-outline-variant/30 bg-surface-container hover:bg-surface-container-highest text-on-surface shadow-sm squishy-interaction transition-all"
    >
      <span className="material-symbols-outlined text-[14px] md:text-[18px]">logout</span>
      <span className="hidden md:inline font-label-bold text-sm">Logout</span>
    </button>
  )
}
