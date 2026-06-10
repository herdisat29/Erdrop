'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Provider } from '@supabase/supabase-js'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Particle Animation (Refined, minimal)
  useEffect(() => {
    const particlesContainer = document.getElementById('particles')
    if (!particlesContainer) return
    
    particlesContainer.innerHTML = ''
    
    const particleCount = 6 // Reduced count
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      const size = Math.random() * 15 + 5
      const color = i % 2 === 0 ? '#76a9ff' : '#feb1c2'
      
      particle.style.position = 'absolute'
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.backgroundColor = color
      particle.style.opacity = '0.05' // Very subtle
      particle.style.borderRadius = '50%'
      particle.style.left = `${Math.random() * 100}vw`
      particle.style.top = `${Math.random() * 100}vh`
      particle.style.animation = `float ${Math.random() * 15 + 25}s linear infinite`
      
      particlesContainer.appendChild(particle)
    }

    if (!document.getElementById('particle-keyframes')) {
      const style = document.createElement('style')
      style.id = 'particle-keyframes'
      style.innerHTML = `
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.05; }
          90% { opacity: 0.05; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  const handleOAuthLogin = async (provider: Provider) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      toast.error(`Gagal login dengan ${provider}: ` + error.message)
      setIsLoading(false)
    }
  }

  const handleDevLogin = async () => {
    setIsLoading(true)
    const email = 'dev@localhost.com'
    const password = 'devpassword123'
    
    let { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        toast.error('Gagal bikin akun dev: ' + signUpError.message)
        setIsLoading(false)
        return
      }
      const { error: retryError } = await supabase.auth.signInWithPassword({ email, password })
      error = retryError
    }

    if (!error) {
      toast.success('Berhasil login sebagai Dev!')
      window.location.href = '/'
    } else {
      toast.error('Dev login gagal: ' + error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col font-body-md text-on-surface bg-background" style={{ colorScheme: 'light' }}>
      
      {/* Forcing light mode colors and custom refined classes */}
      <style dangerouslySetInnerHTML={{__html: `
        .force-light {
          --background: #f9f9ff;
          --surface: #f9f9ff;
          --on-surface: #111c2c;
          --on-surface-variant: #424751;
          --primary: #205dae;
          --primary-container: #76a9ff;
          --on-primary-container: #003c7d;
          --outline-variant: #c2c6d3;
          --surface-container-low: #f0f3ff;
          --surface-container-highest: #d8e3fa;
          --secondary-container: #feb1c2;
          --tertiary-fixed: #ffdeae;
          --on-tertiary-fixed: #281900;
          --outline: #727783;
        }
        
        .gingham-bg-refined {
          background-color: var(--background);
          background-image: linear-gradient(90deg, rgba(32, 93, 174, 0.03) 1px, transparent 1px),
                            linear-gradient(rgba(32, 93, 174, 0.03) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .login-card-refined {
          background: #ffffff;
          border: 1px solid #dee8ff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          position: relative;
        }

        .login-card-refined::after {
          content: '';
          position: absolute;
          top: 4px;
          right: -8px;
          bottom: -8px;
          left: 4px;
          background: #d6e3ff;
          border-radius: 1.5rem;
          z-index: -1;
          opacity: 0.5;
        }

        .btn-refined {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-refined:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .btn-refined:active {
          transform: translateY(0);
        }
      `}} />

      <main className="force-light gingham-bg-refined flex-grow flex items-center justify-center px-8 py-12 z-10">
        <div className="w-full max-w-md">
          {/* The Refined Login Card */}
          <div className="login-card-refined rounded-[1.5rem] p-8 md:p-10 flex flex-col gap-8 bg-white">
            
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-14 h-14 bg-primary flex items-center justify-center rounded-2xl shadow-sm">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <div className="flex flex-col items-center">
                  <span className="text-[40px] font-extrabold text-primary tracking-tight leading-none">ERDROP</span>
                  <span className="text-[10px] font-bold text-outline tracking-widest uppercase mt-1">Track Every Drop</span>
                </div>
                <div className="flex flex-col mt-3">
                  <h2 className="text-[24px] font-semibold text-on-surface">Welcome back</h2>
                  <p className="text-[16px] text-on-surface-variant">Log in to your account</p>
                </div>
              </div>
            </div>

            {/* Social Logins */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
                className="btn-refined w-full flex items-center justify-center gap-3 bg-white border-2 border-outline-variant/60 hover:border-primary/40 hover:bg-surface-container-low text-on-surface py-3.5 rounded-xl font-bold text-[14px] shadow-[0_2px_4px_rgba(0,0,0,0.02)] disabled:opacity-50 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button 
                onClick={() => handleOAuthLogin('twitter')}
                disabled={isLoading}
                className="btn-refined w-full flex items-center justify-center gap-3 bg-[#111c2c] hover:bg-[#111c2c]/90 text-white py-3.5 rounded-xl font-bold text-[14px] disabled:opacity-50"
              >
                <svg aria-hidden="true" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                Continue with X
              </button>

              <button 
                onClick={() => handleOAuthLogin('discord')}
                disabled={isLoading}
                className="btn-refined w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white py-3.5 rounded-xl font-bold text-[14px] disabled:opacity-50"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.33,46,96.22,53,91.08,65.69,84.69,65.69Z"/></svg>
                Continue with Discord
              </button>
            </div>

            {/* Dev Only Button */}
            {process.env.NODE_ENV === 'development' && (
              <div className="pt-2 border-t border-outline-variant/30">
                <button 
                  onClick={handleDevLogin} 
                  disabled={isLoading}
                  className="btn-refined w-full flex items-center justify-center gap-2 bg-surface-container-low border-dashed border-2 border-outline-variant/50 text-on-surface hover:text-primary hover:border-primary py-3 rounded-xl transition-all text-[14px] font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">developer_mode</span>
                  Bypass Login (Dev)
                </button>
              </div>
            )}


          </div>

          {/* Page Level Footer */}
          <p className="mt-12 text-center text-[12px] font-medium text-on-surface-variant opacity-60">
            © 2026 ERDROP. All rights reserved.
          </p>
        </div>
      </main>

      {/* Subtle Floating Particles for atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" id="particles"></div>
    </div>
  )
}
