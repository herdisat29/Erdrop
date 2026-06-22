import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPrivyUser } from '@/lib/privy/server'

const GOLDRUSH_API_KEY = process.env.GOLDRUSH_API_KEY
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const REQUEST_TIMEOUT_MS = 8000 // 8s per chain

const CHAINS = [
  { id: 'eth-mainnet',       label: 'Ethereum',  icon: 'eth' },
  { id: 'base-mainnet',      label: 'Base',       icon: 'base' },
  { id: 'optimism-mainnet',  label: 'Optimism',   icon: 'op' },
  { id: 'arbitrum-mainnet',  label: 'Arbitrum',   icon: 'arb' },
  { id: 'bsc-mainnet',       label: 'BSC',        icon: 'bsc' },
  { id: 'scroll-mainnet',    label: 'Scroll',     icon: 'scroll' },
  { id: 'linea-mainnet',     label: 'Linea',      icon: 'linea' },
  { id: 'zksync-mainnet',    label: 'zkSync Era', icon: 'zksync' },
] as const

export interface ChainResult {
  chainId: string
  label: string
  icon: string
  hasActivity: boolean
  tokenCount: number
  nativeBalance: string | null
  error?: string
}

async function scanChain(
  address: string,
  chain: typeof CHAINS[number]
): Promise<ChainResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const url = `https://api.covalenthq.com/v1/${chain.id}/address/${address}/balances_v2/`
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${GOLDRUSH_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    clearTimeout(timer)

    if (!res.ok) {
      return {
        chainId: chain.id, label: chain.label, icon: chain.icon,
        hasActivity: false, tokenCount: 0, nativeBalance: null,
        error: `HTTP ${res.status}`,
      }
    }

    const json = await res.json()
    const items: any[] = json?.data?.items ?? []

    // Filter tokens with non-zero balance
    const nonZero = items.filter(item => {
      const balance = BigInt(item.balance ?? '0')
      return balance > BigInt(0)
    })

    const native = items.find(item => item.native_token)
    const nativeBalance = native
      ? (Number(BigInt(native.balance ?? '0')) / 1e18).toFixed(4)
      : null

    return {
      chainId: chain.id,
      label: chain.label,
      icon: chain.icon,
      hasActivity: nonZero.length > 0,
      tokenCount: nonZero.length,
      nativeBalance: native && Number(nativeBalance) > 0 ? nativeBalance : null,
    }
  } catch (err: any) {
    clearTimeout(timer)
    const isTimeout = err.name === 'AbortError'
    return {
      chainId: chain.id, label: chain.label, icon: chain.icon,
      hasActivity: false, tokenCount: 0, nativeBalance: null,
      error: isTimeout ? 'Timeout (8s)' : err.message,
    }
  }
}

export async function POST(req: Request) {
  try {
    if (!GOLDRUSH_API_KEY) {
      return NextResponse.json({ error: 'GOLDRUSH_API_KEY not configured' }, { status: 500 })
    }

    const user = await getPrivyUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const address: string = body.address?.trim() ?? ''

    // Strict EVM address validation: 0x + 40 hex chars = 42 total
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid EVM address. Must be a 42-character 0x... hex address.' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const normalizedAddress = address.toLowerCase()

    // Check cache
    const { data: cached } = await supabase
      .from('wallet_scan_cache')
      .select('data, scanned_at')
      .eq('user_id', user.id)
      .eq('address', normalizedAddress)
      .maybeSingle()

    if (cached) {
      const ageMs = Date.now() - new Date(cached.scanned_at).getTime()
      if (ageMs < CACHE_TTL_MS) {
        return NextResponse.json({
          ...cached.data,
          cached: true,
          cachedAt: cached.scanned_at,
        })
      }
    }

    // Parallel scan all chains — allSettled so one failure doesn't kill the rest
    const settled = await Promise.allSettled(
      CHAINS.map(chain => scanChain(normalizedAddress, chain))
    )

    const results: ChainResult[] = settled.map((result, i) => {
      if (result.status === 'fulfilled') return result.value
      // Should never happen since scanChain catches internally, but just in case
      return {
        chainId: CHAINS[i].id,
        label: CHAINS[i].label,
        icon: CHAINS[i].icon,
        hasActivity: false,
        tokenCount: 0,
        nativeBalance: null,
        error: 'Unknown error',
      }
    })

    const activeChains = results.filter(r => r.hasActivity)
    const scannedAt = new Date().toISOString()

    const payload = {
      address: normalizedAddress,
      results,
      activeChainCount: activeChains.length,
      scannedAt,
      cached: false,
    }

    // Upsert cache — update if exists, insert if not
    await supabase
      .from('wallet_scan_cache')
      .upsert(
        { user_id: user.id, address: normalizedAddress, data: payload, scanned_at: scannedAt },
        { onConflict: 'user_id,address' }
      )

    return NextResponse.json(payload)

  } catch (err: any) {
    console.error('[Wallet Scan] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
