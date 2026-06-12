'use client'

import { useState, useEffect } from 'react'
import { getCryptoNews } from '@/app/actions/market'
import { ProBadge } from '@/components/paywall/ProBadge'
import { UpgradePrompt } from '@/components/paywall/UpgradePrompt'

export function CryptoNews() {
  const [data, setData] = useState<any>(null)
  const [isPro, setIsPro] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCryptoNews().then(res => {
      setData(res.data)
      setIsPro(res.isPro || false)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="animate-pulse bg-surface-container rounded-2xl h-64 p-6">
      <div className="h-6 w-32 bg-outline-variant/30 rounded mb-4"></div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-outline-variant/20 rounded"></div>)}
      </div>
    </div>
  )

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>newspaper</span>
          Crypto News
        </h3>
        <ProBadge className={!isPro ? "opacity-50 grayscale" : ""} />
      </div>

      {!data ? (
        <div className="text-sm text-on-surface-variant">Failed to load news data.</div>
      ) : (
        <div className="space-y-4">
          {data.map((news: any) => (
            <a 
              key={news.id} 
              href={news.url || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group squishy-interaction"
            >
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0 group-hover:bg-primary transition-colors" />
                <div>
                  <p className="text-sm text-on-surface font-medium group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {news.title}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/70 mt-1">
                    {news.domain} • {new Date(news.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {!isPro && (
        <div className="mt-6 pt-5 border-t border-outline-variant/20">
          <UpgradePrompt inline feature="Unlimited News Stream" />
        </div>
      )}
    </div>
  )
}
