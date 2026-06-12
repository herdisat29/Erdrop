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
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 space-y-6 bg-surface-container-lowest text-on-surface">
      <div className="h-24 w-24 rounded-3xl bg-error-container flex items-center justify-center">
        <ShieldAlert className="h-12 w-12 text-on-error-container" />
      </div>
      <div className="space-y-2">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Fatal Application Error</h2>
        <p className="text-body-lg text-on-surface-variant max-w-md mx-auto">
          We encountered a critical error. Please try reloading the application.
        </p>
      </div>
      <Button 
        onClick={() => window.location.reload()}
        className="bg-primary text-on-primary hover:bg-primary/90 font-label-bold rounded-full px-6 py-2 h-auto"
      >
        Reload Application
      </Button>
    </div>
  )
}
