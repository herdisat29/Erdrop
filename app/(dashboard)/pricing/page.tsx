import { getPrivyUser, getUserPlan } from '@/lib/privy/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const user = await getPrivyUser()
  if (!user) return null

  const currentPlan = await getUserPlan(user.id)
  const isPro = currentPlan === 'pro'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
          Upgrade Your Farming
        </h1>
        <p className="mt-3 text-on-surface-variant text-lg max-w-xl mx-auto">
          Unlock powerful tools to maximize your airdrop potential.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        
        {/* Starter (Free) */}
        <div className={`relative rounded-2xl border-2 p-6 md:p-8 transition-all ${
          !isPro 
            ? 'border-primary bg-primary/5 shadow-lg' 
            : 'border-outline-variant/30 bg-surface-container/30'
        }`}>
          {!isPro && (
            <div className="absolute -top-3 left-6 bg-primary text-on-primary text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Current Plan
            </div>
          )}
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 bg-surface-container px-3 py-1 rounded-full">
              Free
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight">
            Rp 0<span className="text-base font-normal text-on-surface-variant ml-1">/bulan</span>
          </h2>
          <p className="text-sm text-on-surface-variant mt-2">Buat user baru & komunitas. Hook dulu, upsell belakangan.</p>

          <div className="mt-8 space-y-3">
            <Feature included text="Unlimited project tracking" />
            <Feature included text="Unlimited activity logs" />
            <Feature included text="CSV import" />
            <Feature included text="Dashboard & stats" />
            <Feature included text="Trending tokens (delayed 15 min)" subtle="delayed" />
            <Feature included text="Crypto news (5 headlines/day)" subtle="limited" />
            <Feature included text="AI analysis 1x per project" subtle="limited" />
            <Feature included text="AI farming plan 1x total" subtle="limited" />
            <Feature notIncluded text="NFT trending" />
            <Feature notIncluded text="Portfolio value live" />
            <Feature notIncluded text="Export data (CSV/JSON)" />
          </div>
        </div>

        {/* Pro */}
        <div className={`relative rounded-2xl border-2 p-6 md:p-8 transition-all ${
          isPro 
            ? 'border-primary bg-primary/5 shadow-lg' 
            : 'border-green-500/50 bg-green-500/5 shadow-xl ring-1 ring-green-500/20'
        }`}>
          {isPro ? (
            <div className="absolute -top-3 left-6 bg-primary text-on-primary text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Current Plan
            </div>
          ) : (
            <div className="absolute -top-3 left-6 bg-green-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              Most Popular
            </div>
          )}
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
              Pro
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight">
            Rp 49k<span className="text-base font-normal text-on-surface-variant ml-1">/bulan</span>
          </h2>
          <p className="text-sm text-on-surface-variant mt-2">Buat user aktif yang serius farming. Target utama monetisasi.</p>

          <div className="mt-8 space-y-3">
            <Feature included text="Semua fitur Starter" bold />
            <Feature included text="Trending tokens (realtime)" pro />
            <Feature included text="Crypto news (unlimited)" pro />
            <Feature included text="NFT trending collections" pro />
            <Feature included text="Portfolio value tracker (live price)" pro />
            <Feature included text="AI analysis unlimited re-analyze" pro />
            <Feature included text="AI farming plan 5x/day" pro />
            <Feature included text="Export CSV/JSON" pro />
            <Feature included text="Priority support" pro />
          </div>

          {!isPro && (
            <div className="mt-8">
              <a
                href="https://t.me/herdisat29"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all squishy-interaction text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                Upgrade via DM Telegram
              </a>
              <p className="text-center text-[11px] text-on-surface-variant/60 mt-3">
                Cancel anytime • 7 hari money-back guarantee
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FAQ / Trust section */}
      <div className="mt-12 text-center">
        <p className="text-sm text-on-surface-variant/60">
          Punya pertanyaan? <a href="https://t.me/herdisat29" target="_blank" className="text-primary hover:underline font-semibold">Chat kami di Telegram</a>
        </p>
      </div>
    </div>
  )
}

// Feature row component
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
