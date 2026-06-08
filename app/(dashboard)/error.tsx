'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Something went wrong!</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          {error.message || "An unexpected error occurred in the dashboard. Don't worry, your data is safe."}
        </p>
      </div>
      <Button 
        onClick={() => reset()}
        className="bg-violet-600 hover:bg-violet-700 text-white"
      >
        Try again
      </Button>
    </div>
  )
}
