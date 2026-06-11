'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Suspense } from 'react'

// IS_BETA_PHASE is a server-side env var — we pass it as a prop from the server component
interface PricingModalProps {
  isPro: boolean
  isBetaPhase?: boolean
}

function Feature({
  text,
  included,
  notIncluded,
  pro,
  bold,
  subtle
}: {
  text: string
  included?: boolean
  notIncluded?: boolean
  pro?: boolean
  bold?: boolean
  subtle?: string
}) {
  if (notIncluded) {
    return (
      <div className="flex items-center gap-3 text-on-surface-variant/40">
        <span className="material-symbols-outlined text-[18px]">close</span>
        <span className="text-sm line-through">{text}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3">
      <span className={`material-symbols-outlined text-[18px] ${pro ? 'text-green-600 dark:text-green-400' : 'text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
        check_circle
      </span>
      <span className={`text-sm text-on-surface ${bold ? 'font-bold' : ''}`}>
        {text}
        {pro && <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">PRO</span>}
        {subtle && <span className="ml-1.5 text-[10px] text-on-surface-variant/50 uppercase">({subtle})</span>}
      </span>
    </div>
  )
}

function BetaWelcomeContent({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-container-highest transition-colors z-50 bg-surface-container/50 backdrop-blur"
      >
        <span className="material-symbols-outlined text-on-surface-variant">close</span>
      </button>

      <div className="text-center mb-8 mt-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
        </div>
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Welcome to the Beta</h1>
        <p className="mt-3 text-on-surface-variant max-w-md mx-auto">
          Erdrop is currently in open beta. All Pro features are unlocked — enjoy full access while we refine the product.
        </p>
      </div>

      <div className="bg-surface-container rounded-2xl p-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">What's included during beta</p>
        <div className="space-y-3">
          <Feature included text="Unlimited project tracking & logs" />
          <Feature included text="CSV import" />
          <Feature included text="Trending tokens & crypto news" />
          <Feature included text="NFT trending collections" />
          <Feature included text="Portfolio value tracker" />
          <Feature included text="Export CSV/JSON" />
          <Feature included text="AI analysis" subtle="3x per day beta limit" />
          <Feature included text="AI farming plan" subtle="3x per day beta limit" />
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 text-sm text-on-surface-variant text-center">
        AI features are limited to <strong className="text-on-surface">3 uses per day</strong> during beta to manage costs.
        This will increase at launch.
      </div>

      <div className="text-center">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-on-primary font-bold rounded-xl shadow-lg transition-all squishy-interaction text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
          Let's Farm
        </button>
        <p className="text-center text-[11px] text-on-surface-variant/60 mt-3">
          Punya pertanyaan? <a href="https://t.me/herdivoid" target="_blank" className="text-primary hover:underline font-semibold">Chat kami di Telegram</a>
        </p>
      </div>
    </div>
  )
}

function PricingModalContent({ isPro, isBetaPhase }: PricingModalProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isOpen = searchParams.get('upgrade') === 'true'

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('upgrade')
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
      router.replace(newUrl, { scroll: false })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl md:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none [&>button]:hidden">
        <DialogTitle className="sr-only">{isBetaPhase ? 'Beta Phase' : 'Upgrade to Pro'}</DialogTitle>
        <DialogDescription className="sr-only">{isBetaPhase ? 'Beta welcome info' : 'Pricing plans for Erdrop'}</DialogDescription>

        {isBetaPhase ? (
          <BetaWelcomeContent onClose={() => handleOpenChange(false)} />
        ) : (
          // Full pricing modal — shown post-beta when paid plans are live
          <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 relative">
            <button
              onClick={() => handleOpenChange(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-container-highest transition-colors z-50 bg-surface-container/50 backdrop-blur"
            >
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>

            <div className="text-center mb-10 mt-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">Upgrade Your Farming</h1>
              <p className="mt-3 text-on-surface-variant text-lg max-w-xl mx-auto">
                Unlock powerful tools to maximize your airdrop potential.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div className={`relative rounded-2xl border-2 p-6 md:p-8 transition-all ${!isPro ? 'border-primary bg-primary/5 shadow-lg' : 'border-outline-variant/30 bg-surface-container/30'}`}>
                {!isPro && (
                  <div className="absolute -top-3 left-6 bg-primary text-on-primary text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Current Plan</div>
                )}
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 bg-surface-container px-3 py-1 rounded-full">Free</span>
                </div>
                <h2 className="text-4xl font-extrabold text-on-surface tracking-tight">Rp 0<span className="text-base font-normal text-on-surface-variant ml-1">/bulan</span></h2>
                <p className="text-sm text-on-surface-variant mt-2">Buat user baru & komunitas.</p>
                <div className="mt-8 space-y-3">
                  <Feature included text="Unlimited project tracking" />
                  <Feature included text="Unlimited activity logs" />
                  <Feature included text="CSV import" />
                  <Feature included text="Dashboard & stats" />
                  <Feature included text="Trending tokens (delayed 15 min)" subtle="delayed" />
                  <Feature included text="Crypto news (5 headlines/day)" subtle="limited" />
                  <Feature included text="AI analysis 3x total" subtle="limited" />
                  <Feature included text="AI farming plan 3x total" subtle="limited" />
                  <Feature notIncluded text="NFT trending" />
                  <Feature notIncluded text="Portfolio value live" />
                  <Feature notIncluded text="Export data (CSV/JSON)" />
                </div>
              </div>

              <div className={`relative rounded-2xl border-2 p-6 md:p-8 transition-all ${isPro ? 'border-primary bg-primary/5 shadow-lg' : 'border-green-500/50 bg-green-500/5 shadow-xl ring-1 ring-green-500/20'}`}>
                {isPro ? (
                  <div className="absolute -top-3 left-6 bg-primary text-on-primary text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Current Plan</div>
                ) : (
                  <div className="absolute -top-3 left-6 bg-green-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">Pro</span>
                </div>
                <h2 className="text-4xl font-extrabold text-on-surface tracking-tight">Rp 49k<span className="text-base font-normal text-on-surface-variant ml-1">/bulan</span></h2>
                <p className="text-sm text-on-surface-variant mt-2">Buat user aktif yang serius farming.</p>
                <div className="mt-8 space-y-3">
                  <Feature included text="Semua fitur Starter" bold />
                  <Feature included text="Trending tokens (realtime)" pro />
                  <Feature included text="Crypto news (unlimited)" pro />
                  <Feature included text="NFT trending (full access)" pro />
                  <Feature included text="Portfolio value tracker (live price)" pro />
                  <Feature included text="AI analysis unlimited re-analyze" pro />
                  <Feature included text="AI farming plan 5x/day" pro />
                  <Feature included text="Export CSV/JSON" pro />
                  <Feature included text="Priority support" pro />
                </div>
                {!isPro && (
                  <div className="mt-8">
                    <a
                      href="https://t.me/herdivoid"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all squishy-interaction text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                      Upgrade via DM Telegram
                    </a>
                    <p className="text-center text-[11px] text-on-surface-variant/60 mt-3">Cancel anytime • 7 hari money-back guarantee</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 text-center pb-2">
              <p className="text-sm text-on-surface-variant/60">
                Punya pertanyaan? <a href="https://t.me/herdivoid" target="_blank" className="text-primary hover:underline font-semibold">Chat kami di Telegram</a>
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function PricingModal({ isPro, isBetaPhase }: PricingModalProps) {
  return (
    <Suspense fallback={null}>
      <PricingModalContent isPro={isPro} isBetaPhase={isBetaPhase} />
    </Suspense>
  )
}
