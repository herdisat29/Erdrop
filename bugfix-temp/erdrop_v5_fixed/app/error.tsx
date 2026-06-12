'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 space-y-6 bg-zinc-50 dark:bg-zinc-950">
      <div className="h-24 w-24 rounded-3xl bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
        <ShieldAlert className="h-12 w-12 text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Fatal Application Error</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          We encountered a critical error. Please try reloading the application.
        </p>
      </div>
      <Button 
        onClick={() => window.location.reload()}
        className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
      >
        Reload Application
      </Button>
    </div>
  )
}
