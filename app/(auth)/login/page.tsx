'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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
    <div className="h-screen overflow-hidden flex flex-col font-body-md text-on-surface bg-background" style={{ colorScheme: 'light' }}>
      
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

            {/* Privy Login Button */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={login}
                disabled={!ready}
                className="btn-refined w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-[14px] shadow-sm disabled:opacity-50"
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
