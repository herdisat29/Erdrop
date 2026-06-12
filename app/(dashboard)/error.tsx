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
      <div className="h-20 w-20 rounded-full bg-error-container flex items-center justify-center">
        <AlertCircle className="h-10 w-10 text-on-error-container" />
      </div>
      <div className="space-y-2">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Something went wrong!</h2>
        <p className="text-body-lg text-on-surface-variant max-w-md mx-auto">
          {error.message || "An unexpected error occurred in the dashboard. Don't worry, your data is safe."}
        </p>
      </div>
      <Button 
        onClick={() => reset()}
        className="bg-primary text-on-primary hover:bg-primary/90 font-label-bold rounded-full px-6 py-2 h-auto"
      >
        Try again
      </Button>
    </div>
  )
}
