'use client'

import { useState, useEffect } from 'react'
import { getTrendingNFTs } from '@/app/actions/market'
import { ProBadge } from '@/components/paywall/ProBadge'
import { UpgradePrompt } from '@/components/paywall/UpgradePrompt'

export function TrendingNFTs() {
  const [data, setData] = useState<any>(null)
  const [isPro, setIsPro] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTrendingNFTs().then(res => {
      setData(res.data)
      setIsPro(res.isPro || false)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="animate-pulse bg-surface-container rounded-2xl h-64 p-6">
      <div className="h-6 w-32 bg-outline-variant/30 rounded mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-outline-variant/20 rounded"></div>)}
      </div>
    </div>
  )

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>imagesmode</span>
          Trending NFTs
        </h3>
        <ProBadge className={!isPro ? "opacity-50 grayscale" : ""} />
      </div>

      {!isPro ? (
        <div className="py-2">
          <UpgradePrompt inline feature="NFT Trending Data" />
        </div>
      ) : !data ? (
        <div className="text-sm text-on-surface-variant">Failed to load NFT data.</div>
      ) : (
        <div className="space-y-4">
          {data.map((nft: any, i: number) => {
            const isPositive = nft.floor_price_24h_percentage_change >= 0
            return (
              <div key={nft.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-on-surface-variant/40 w-4">{i + 1}</span>
                <img src={nft.thumb} alt={nft.name} className="w-8 h-8 rounded-lg bg-surface-container object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{nft.name}</p>
                  <p className="text-[10px] font-label-bold uppercase tracking-wider text-on-surface-variant/70">{nft.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-on-surface">
                    {nft.data?.floor_price || '--'}
                  </p>
                  {nft.floor_price_24h_percentage_change && (
                    <p className={`text-[10px] font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{nft.floor_price_24h_percentage_change.toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
