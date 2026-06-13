'use client'

import { useState } from 'react'
import { Search, Loader2, CheckCircle2, XCircle, Clock, Wifi } from 'lucide-react'
import { toast } from 'sonner'
import type { ChainResult } from '@/app/api/wallets/scan/route'

const CHAIN_COLORS: Record<string, string> = {
  eth:    'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50',
  base:   'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/50',
  op:     'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700/50',
  arb:    'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-700/50',
  zora:   'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/50',
  scroll: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/50',
  linea:  'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/50',
  zksync: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700/50',
}

interface ScanResult {
  address: string
  results: ChainResult[]
  activeChainCount: number
  scannedAt: string
  cached: boolean
  cachedAt?: string
}

export function WalletScanner() {
  const [address, setAddress] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(address.trim())

  const handleScan = async () => {
    if (!isValidAddress) {
      setError('Please enter a valid 0x... EVM address (42 characters).')
      return
    }

    setIsScanning(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/wallets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Scan failed. Please try again.')
        return
      }

      setResult(data as ScanResult)

      if (data.cached) {
        toast.info('Loaded from cache — scan is fresh (< 1 hour old)')
      } else {
        toast.success(`Scan complete — ${data.activeChainCount} active chain${data.activeChainCount !== 1 ? 's' : ''} found`)
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidAddress && !isScanning) {
      handleScan()
    }
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 sticky-note-shadow">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Wifi className="h-5 w-5 text-primary" />
        <h2 className="font-headline-md text-on-surface">Wallet Scanner</h2>
        <span className="text-[10px] font-label-bold text-on-surface-variant bg-surface-container border border-outline-variant px-2 py-0.5 rounded-full uppercase tracking-widest">
          8 Chains
        </span>
      </div>

      {/* Input row */}
      <div className="flex gap-3 mb-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={address}
            onChange={e => { setAddress(e.target.value); setError(null) }}
            onKeyDown={handleKeyDown}
            placeholder="Enter 0x... EVM address"
            spellCheck={false}
            className="w-full bg-surface-container border border-outline-variant rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors font-mono"
          />
          {address.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValidAddress
                ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                : <XCircle className="h-4 w-4 text-red-400" />}
            </div>
          )}
        </div>
        <button
          onClick={handleScan}
          disabled={!isValidAddress || isScanning}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-on-primary font-label-bold rounded-2xl squishy-interaction disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors text-sm shrink-0"
        >
          {isScanning
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Search className="h-4 w-4" />}
          {isScanning ? 'Scanning...' : 'Scan'}
        </button>
      </div>

      {/* Address hint */}
      {address.length > 0 && !isValidAddress && (
        <p className="text-xs text-red-500 mb-4">
          Must be a 42-character address starting with 0x
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-error-container/30 border border-error/20 rounded-2xl text-sm text-error">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isScanning && (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-on-surface-variant font-label-bold uppercase tracking-widest text-center">
            Scanning across 8 chains...
          </p>
          <div className="grid grid-cols-4 gap-2">
            {['Ethereum','Base','Optimism','Arbitrum','Zora','Scroll','Linea','zkSync Era'].map(name => (
              <div key={name} className="bg-surface-container rounded-xl p-3 border border-outline-variant/50 animate-pulse">
                <div className="h-2 bg-outline-variant rounded mb-2" />
                <div className="h-2 bg-outline-variant rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isScanning && (
        <div className="mt-6">
          {/* Summary bar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-sm font-label-bold text-on-surface">
              {result.activeChainCount > 0
                ? `${result.activeChainCount} active chain${result.activeChainCount !== 1 ? 's' : ''} detected`
                : 'No activity detected on any chain'}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              {result.cached && (
                <span className="flex items-center gap-1 bg-surface-container border border-outline-variant px-2 py-0.5 rounded-full">
                  <Clock className="h-3 w-3" />
                  Cached
                </span>
              )}
              <span>
                {new Date(result.scannedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Chain grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {result.results.map(chain => (
              <div
                key={chain.chainId}
                className={`rounded-2xl border p-4 transition-all ${
                  chain.hasActivity
                    ? CHAIN_COLORS[chain.icon] || 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50'
                    : 'bg-surface-container border-outline-variant/40 text-on-surface-variant'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-label-bold uppercase tracking-widest truncate">
                    {chain.label}
                  </span>
                  {chain.hasActivity
                    ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    : chain.error
                      ? <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" title={chain.error} />
                      : <div className="h-3.5 w-3.5 rounded-full border-2 border-current opacity-30 shrink-0" />
                  }
                </div>
                {chain.hasActivity ? (
                  <div>
                    <p className="text-xl font-black tracking-tighter">
                      {chain.tokenCount}
                    </p>
                    <p className="text-[10px] opacity-70">
                      {chain.tokenCount === 1 ? 'token' : 'tokens'}
                      {chain.nativeBalance ? ` · ${chain.nativeBalance} ETH` : ''}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs opacity-50 mt-1">
                    {chain.error ? `Failed (${chain.error})` : 'No activity'}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Scanned address */}
          <p className="text-xs text-on-surface-variant mt-4 font-mono truncate">
            {result.address}
          </p>
        </div>
      )}
    </div>
  )
}
