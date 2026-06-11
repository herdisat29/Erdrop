'use server'

import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'
import { checkFeatureAccess } from '@/lib/plan-gate'

interface CachedData {
  id: string
  data: any
  fetched_at: string
}

/**
 * Helper to get or refresh cached data.
 * Realtime (Pro) = max 5 minutes old
 * Delayed (Free) = max 20 minutes old, but uses whatever is in cache if available to save API calls
 */
async function getCachedData(
  key: string,
  fetcher: () => Promise<any>,
  maxAgeMinutes: number
) {
  const supabase = createClient()
  
  // Try cache
  const { data: cache } = await supabase
    .from('market_cache')
    .select('*')
    .eq('id', key)
    .single()

  const now = new Date()
  let isStale = true

  if (cache && cache.fetched_at) {
    const fetchedAt = new Date(cache.fetched_at)
    const ageMinutes = (now.getTime() - fetchedAt.getTime()) / (1000 * 60)
    isStale = ageMinutes > maxAgeMinutes
  }

  // If valid, return cache
  if (cache && !isStale) {
    return cache.data
  }

  // Need to fetch fresh data
  try {
    const freshData = await fetcher()
    
    if (freshData) {
      if (cache) {
        await supabase
          .from('market_cache')
          .update({ data: freshData, fetched_at: now.toISOString() })
          .eq('id', key)
      } else {
        await supabase
          .from('market_cache')
          .insert({ id: key, data: freshData, fetched_at: now.toISOString() })
      }
      return freshData
    }
  } catch (error) {
    console.error(`Error fetching ${key}:`, error)
    // Fallback to stale cache if API fails
    if (cache) return cache.data
  }

  return null
}

export async function getTrendingTokens() {
  const user = await getPrivyUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const access = await checkFeatureAccess(user.id, 'trending_realtime')
  const isPro = access.allowed
  
  // Pro: max 5 min stale. Free: max 30 min stale.
  const maxAge = isPro ? 5 : 30 

  const data = await getCachedData('coingecko_trending', async () => {
    // Note: CoinGecko public API rate limits apply
    const res = await fetch('https://api.coingecko.com/api/v3/search/trending', {
      next: { revalidate: 300 } // Next.js level cache (5 min)
    })
    if (!res.ok) throw new Error('CoinGecko API failed')
    return res.json()
  }, maxAge)

  if (!data || !data.coins) return { data: null, isPro }

  return {
    data: data.coins.slice(0, 5).map((c: any) => ({
      id: c.item.id,
      name: c.item.name,
      symbol: c.item.symbol,
      thumb: c.item.thumb,
      price_btc: c.item.price_btc,
      rank: c.item.market_cap_rank
    })),
    isPro
  }
}

export async function getTrendingNFTs() {
  const user = await getPrivyUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  // Access check for nft_trending
  const access = await checkFeatureAccess(user.id, 'nft_trending')
  const isPro = access.allowed

  // NFT trending is Pro ONLY. But we might want to let Free users see a locked state or delayed data.
  // The pricing page says "NFT trending collections" is a Pro feature (not included in Free).
  // We'll return isPro so the UI can lock it.
  
  // We use the same cache key so it doesn't double-fetch CoinGecko API
  const maxAge = isPro ? 5 : 30 
  const data = await getCachedData('coingecko_trending', async () => {
    const res = await fetch('https://api.coingecko.com/api/v3/search/trending', {
      next: { revalidate: 300 } 
    })
    if (!res.ok) throw new Error('CoinGecko API failed')
    return res.json()
  }, maxAge)

  if (!data || !data.nfts) return { data: null, isPro }

  return {
    data: data.nfts.slice(0, 5).map((n: any) => ({
      id: n.id,
      name: n.name,
      symbol: n.symbol,
      thumb: n.thumb,
      floor_price_24h_percentage_change: n.floor_price_24h_percentage_change,
      data: n.data
    })),
    isPro
  }
}

export async function getCryptoNews() {
  const user = await getPrivyUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const access = await checkFeatureAccess(user.id, 'crypto_news_unlimited')
  const isPro = access.allowed

  // CryptoPanic API (requires token, using public RSS for demo if no token)
  const token = process.env.CRYPTOPANIC_TOKEN
  
  const data = await getCachedData('cryptopanic_news', async () => {
    if (token) {
      const res = await fetch(`https://cryptopanic.com/api/v1/posts/?auth_token=${token}&kind=news&filter=important`, {
        next: { revalidate: 600 }
      })
      if (!res.ok) throw new Error('CryptoPanic API failed')
      return res.json()
    } else {
      // Mock data for development if no token
      return {
        results: [
          { id: 1, title: 'Bitcoin surges past new resistance levels', domain: 'coindesk.com', created_at: new Date().toISOString() },
          { id: 2, title: 'Ethereum network upgrade scheduled for next month', domain: 'cointelegraph.com', created_at: new Date().toISOString() },
          { id: 3, title: 'Major protocol announces massive airdrop', domain: 'theblock.co', created_at: new Date().toISOString() },
          { id: 4, title: 'Regulatory bodies issue new crypto framework', domain: 'bloomberg.com', created_at: new Date().toISOString() },
          { id: 5, title: 'DeFi TVL reaches all time high in Q3', domain: 'defillama.com', created_at: new Date().toISOString() },
          { id: 6, title: 'Pro-only news: Market manipulation detected', domain: 'wsj.com', created_at: new Date().toISOString() },
          { id: 7, title: 'Pro-only news: Alpha leak for upcoming token launch', domain: 'alpha.io', created_at: new Date().toISOString() },
        ]
      }
    }
  }, 15) // News cache is 15 mins

  if (!data || !data.results) return { data: null, isPro }

  // Free users only get 3 news items, Pro gets up to 10
  const limit = isPro ? 10 : 3
  
  return {
    data: data.results.slice(0, limit).map((n: any) => ({
      id: n.id,
      title: n.title,
      domain: n.domain,
      url: n.url,
      created_at: n.created_at
    })),
    isPro
  }
}
