'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ErdropLogo } from '@/components/ui/icons'

export default function LoginPage() {
  const { login, ready, authenticated } = usePrivy()
  const router = useRouter()

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (ready && authenticated) {
      router.push('/')
    }
  }, [ready, authenticated, router])

  return (
    <div className="h-screen overflow-hidden flex flex-col font-body-md text-on-surface bg-background">
      
      <style dangerouslySetInnerHTML={{__html: `
        .gingham-bg-refined {
          background-color: var(--background);
          background-image: linear-gradient(90deg, rgba(118, 169, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(rgba(118, 169, 255, 0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .login-card-refined {
          background: var(--surface-container-lowest);
          border: 1px solid var(--outline-variant);
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
          background: var(--surface-container-highest);
          border-radius: 1.5rem;
          z-index: -1;
          opacity: 0.5;
        }

        .btn-refined {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-refined:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(118, 169, 255, 0.15);
        }
        .btn-refined:active:not(:disabled) {
          transform: translateY(0);
        }
      `}} />

      <main className="gingham-bg-refined flex-grow flex items-center justify-center px-8 py-12 z-10">
        <div className="w-full max-w-md">
          <div className="login-card-refined rounded-[1.5rem] p-8 md:p-10 flex flex-col gap-8">
            
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-6">
              <ErdropLogo className="w-20 h-20 text-primary" />
              <div className="flex flex-col gap-1 items-center">
                <div className="flex flex-col items-center">
                  <span className="text-[44px] font-extrabold text-primary tracking-tighter leading-none" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>Erdrop</span>
                  <span className="text-[10px] font-bold text-outline tracking-widest uppercase mt-1">Track Every Drop</span>
                </div>
                <div className="flex flex-col mt-3">
                  <h2 className="text-[24px] font-semibold text-on-surface">Welcome back</h2>
                  <p className="text-[16px] text-on-surface-variant">Log in to your account</p>
                </div>
              </div>
            </div>

            {/* Privy Login Button */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={login}
                disabled={!ready}
                className="btn-refined w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3.5 rounded-xl font-bold text-[14px] shadow-sm disabled:opacity-50"
              >
                {!ready ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">login</span>
                )}
                {!ready ? 'Loading...' : 'Continue'}
              </button>
              <p className="text-center text-[12px] text-on-surface-variant mt-1">
                Sign in with Email, Google, Twitter, Discord, or Wallet
              </p>
            </div>

          </div>

          <p className="mt-12 text-center text-[12px] font-medium text-on-surface-variant opacity-60">
            © 2026 ERDROP. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  )
}
