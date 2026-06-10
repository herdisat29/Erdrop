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

  const handleDevLogin = async () => {
    setIsLoading(true)
    const email = 'dev@localhost.com'
    const password = 'devpassword123'
    
    // Coba login dulu
    let { error } = await supabase.auth.signInWithPassword({ email, password })
    
    // Kalau gagal (misal karena belum ada), langsung coba otomatis bikin
    if (error) {
      console.log("Login gagal (wajar kalau belum ada akun):", error.message)
      toast.info('Membuat akun dev sementara...')
      
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        toast.error('Gagal bikin akun dev: ' + signUpError.message)
        setIsLoading(false)
        return
      }
      toast.success('Akun dev berhasil dibuat! Jika tertahan, pastikan Email Confirmation mati di Supabase.')
      
      // Coba login ulang setelah signup
      const { error: retryError } = await supabase.auth.signInWithPassword({ email, password })
      error = retryError
    }

    if (!error) {
      toast.success('Berhasil login sebagai Dev!')
      window.location.href = '/' // redirect ke dashboard
    } else {
      toast.error('Dev login gagal: ' + error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center backdrop-blur-sm shadow-xl relative overflow-hidden">
        {/* Dekorasi kecil biar nyambung sama tema */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
            <svg
              className="h-8 w-8 text-violet-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
            Erdrop
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Track Every Drop. Sign in to start managing your airdrops.
          </p>
        </div>

        <div className="space-y-4 relative z-10 mt-8">
          <Button 
            onClick={handleLogin} 
            disabled={isLoading}
            variant="outline"
            className="w-full bg-white hover:bg-zinc-200 text-zinc-950 hover:text-zinc-950 border-transparent h-12 font-bold squishy-interaction shadow-[2px_2px_0px_0px_rgba(139,92,246,0.5)] rounded-xl"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isLoading ? 'Connecting...' : 'Sign in with Google'}
          </Button>

          {/* Dev Only Button */}
          {process.env.NODE_ENV === 'development' && (
            <div className="pt-6 border-t border-zinc-800/50">
              <p className="text-xs text-zinc-500 font-medium mb-3 uppercase tracking-wider">Developer Testing</p>
              <Button 
                onClick={handleDevLogin} 
                disabled={isLoading}
                variant="outline"
                className="w-full bg-zinc-900 border-dashed border-2 border-zinc-700 text-zinc-400 hover:text-white hover:border-violet-500 hover:bg-violet-500/10 h-11 squishy-interaction rounded-xl transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Bypass Login (Localhost)
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
