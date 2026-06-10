'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      toast.error('Gagal mengirim link login: ' + error.message)
      setIsLoading(false)
    } else {
      setIsEmailSent(true)
      setIsLoading(false)
      toast.success('Link login berhasil dikirim ke email kamu!')
    }
  }

  const handleDevLogin = async () => {
    setIsLoading(true)
    const emailStr = 'dev@localhost.com'
    const password = 'devpassword123'
    
    let { error } = await supabase.auth.signInWithPassword({ email: emailStr, password })
    
    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({ email: emailStr, password })
      if (signUpError) {
        toast.error('Gagal bikin akun dev: ' + signUpError.message)
        setIsLoading(false)
        return
      }
      const { error: retryError } = await supabase.auth.signInWithPassword({ email: emailStr, password })
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
        .btn-refined:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(32, 93, 174, 0.15);
        }
        .btn-refined:active:not(:disabled) {
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
                  <h2 className="text-[24px] font-semibold text-on-surface">
                    {isEmailSent ? 'Check your email' : 'Welcome back'}
                  </h2>
                  <p className="text-[16px] text-on-surface-variant">
                    {isEmailSent ? 'We sent a secure login link to your inbox.' : 'Log in to your account'}
                  </p>
                </div>
              </div>
            </div>

            {/* Email Login Form */}
            {!isEmailSent ? (
              <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-on-surface-variant px-1">
                    Email address
                  </label>
                  <input 
                    id="email"
                    type="email" 
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3.5 text-on-surface outline-none transition-all placeholder:text-outline/60"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading || !email}
                  className="btn-refined w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-[14px] shadow-sm disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  )}
                  {isLoading ? 'Sending...' : 'Continue with Email'}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center text-primary mb-2">
                  <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
                </div>
                <p className="text-center text-on-surface-variant text-[14px]">
                  A magic link has been sent to <br/><span className="font-bold text-on-surface">{email}</span>
                </p>
                <button 
                  onClick={() => setIsEmailSent(false)}
                  className="mt-4 text-primary font-bold text-sm hover:underline"
                >
                  Use a different email
                </button>
              </div>
            )}

            {/* Dev Only Button */}
            {process.env.NODE_ENV === 'development' && (
              <div className="pt-6 border-t border-outline-variant/30 mt-2">
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
