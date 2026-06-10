'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [isScanning, setIsScanning] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
    }, 3000)
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 font-label-bold text-xs md:text-sm rounded-xl squishy-interaction shadow-sm transition-all whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[14px] md:text-base">account_balance_wallet</span>
          <span className="hidden sm:inline">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          <span className="sm:hidden">{address?.slice(0, 4)}..</span>
        </button>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white border-b-4 border-zinc-900 dark:border-white pb-2 inline-block">Wallet Connected</DialogTitle>
              <DialogDescription className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs pt-4">
                Address: {address}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div className="border-2 border-zinc-900 dark:border-zinc-800 p-4">
                <h4 className="font-black text-lg uppercase text-zinc-900 dark:text-white mb-2">Airdrop Scanner</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Scan this wallet address across popular airdrop checkers to automatically detect eligible claims.
                </p>
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full font-black uppercase py-3 border-2 border-zinc-900 dark:border-white bg-violet-200 dark:bg-violet-900 text-violet-900 dark:text-violet-100 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none disabled:opacity-50 disabled:transform-none transition-all"
                >
                  {isScanning ? 'Scanning Blockchain...' : 'Start Scan (Mock)'}
                </button>

                {/* Mock Result */}
                {!isScanning && (
                  <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 hidden text-center" id="scan-result" style={{ display: isScanning ? 'none' : 'block' }}>
                     <p className="text-xs font-bold uppercase text-zinc-500">Scan Complete</p>
                     <p className="text-sm font-black text-zinc-900 dark:text-white mt-1">No new eligible airdrops found for this address.</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  disconnect()
                  setShowModal(false)
                }}
                className="w-full font-black uppercase py-2 border-2 border-red-900 dark:border-red-400 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const handleConnect = () => {
    connect(
      { connector: injected() },
      {
        onError(error) {
          if (error.message.includes('Connector not found') || error.message.includes('Provider not found')) {
            toast.error('No wallet extension found. Please install MetaMask or a compatible Web3 wallet.')
          } else if (error.message.includes('User rejected')) {
            toast.error('Connection request was rejected.')
          } else {
            toast.error(`Connection failed: ${error.message}`)
          }
        },
      }
    )
  }

  return (
    <button 
      onClick={handleConnect}
      className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-primary text-on-primary hover:bg-primary/90 font-label-bold text-xs md:text-sm rounded-xl squishy-interaction shadow-sm transition-all whitespace-nowrap"
    >
      <span className="material-symbols-outlined text-[14px] md:text-base">account_balance_wallet</span>
      <span>Connect<span className="hidden sm:inline"> Wallet</span></span>
    </button>
  )
}
