'use client'

import { useState, useEffect } from 'react'
import { getTrendingTokens } from '@/app/actions/market'
import { ProBadge } from '@/components/paywall/ProBadge'
import { UpgradePrompt } from '@/components/paywall/UpgradePrompt'
import { TrendingUp, TrendingDown } from 'lucide-react'

const formatPrice = (price: number) => {
  if (!price) return '--'
  if (price < 0.0001) {
    return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 8 })
  }
  if (price < 1) {
    return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 4, minimumFractionDigits: 2 })
  }
  return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
}

export function TrendingTokens() {
  const [data, setData] = useState<any>(null)
  const [isPro, setIsPro] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTrendingTokens().then(res => {
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
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          Trending Tokens
        </h3>
        {!isPro ? (
          <div className="flex items-center gap-2 text-[10px] text-on-surface-variant/70">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Delayed 15m
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[10px] text-green-600 dark:text-green-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Realtime
          </div>
        )}
      </div>

      {!data ? (
        <div className="text-sm text-on-surface-variant">Failed to load trending data.</div>
      ) : (
        <div className="space-y-4">
          {data.map((coin: any, i: number) => (
            <div key={coin.id} className="flex items-center gap-3">
              <span className="text-xs font-bold text-on-surface-variant/40 w-4">{i + 1}</span>
              <img src={coin.thumb} alt={coin.name} className="w-8 h-8 rounded-full bg-surface-container" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{coin.name}</p>
                <p className="text-[10px] font-label-bold uppercase tracking-wider text-on-surface-variant/70">{coin.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-on-surface font-mono">
                  {formatPrice(coin.price)}
                </p>
                <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${coin.price_change_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {coin.price_change_24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(coin.price_change_24h).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isPro && (
        <div className="mt-6 pt-5 border-t border-outline-variant/20">
          <UpgradePrompt inline feature="Realtime Market Data" />
        </div>
      )}
    </div>
  )
}
