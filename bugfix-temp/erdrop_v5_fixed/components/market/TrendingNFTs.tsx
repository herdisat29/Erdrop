'use client'

import { ProBadge } from '@/components/paywall/ProBadge'

export function TrendingNFTs() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>imagesmode</span>
          Trending NFTs
        </h3>
        <ProBadge />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-surface-container/30 rounded-xl border border-dashed border-outline-variant/50">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">hourglass_empty</span>
        <h4 className="font-label-bold text-on-surface mb-1">Coming Soon</h4>
        <p className="text-xs text-on-surface-variant max-w-[200px]">
          We're preparing the most accurate NFT trending data for you. Stay tuned!
        </p>
      </div>
    </div>
  )
}
