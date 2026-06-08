'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      toast.error('Gagal login: ' + error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center backdrop-blur-sm">
        <div>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
            <svg
              className="h-6 w-6 text-violet-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Erdrop
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Track Every Drop. Sign in to start managing your airdrops.
          </p>
        </div>
        <Button 
          onClick={handleLogin} 
          disabled={isLoading}
          className="w-full bg-violet-600 text-white hover:bg-violet-700 h-11"
        >
          {isLoading ? 'Connecting...' : 'Sign in with Google'}
        </Button>
      </div>
    </div>
  )
}
