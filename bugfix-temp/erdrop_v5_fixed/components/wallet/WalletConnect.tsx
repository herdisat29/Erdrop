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
          className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest font-label-bold text-xs md:text-sm rounded-xl squishy-interaction shadow-sm transition-all whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[14px] md:text-base">account_balance_wallet</span>
          <span className="hidden sm:inline">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          <span className="sm:hidden">{address?.slice(0, 4)}..</span>
        </button>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-surface-container-lowest border border-outline-variant shadow-xl rounded-3xl p-6 sm:p-8 max-w-md w-full">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-headline-md font-bold tracking-tight text-on-surface">Wallet Connected</DialogTitle>
              <DialogDescription className="text-on-surface-variant font-label-sm uppercase tracking-wider text-xs pt-2">
                Address: <span className="font-mono bg-surface-container px-2 py-1 rounded-md ml-1">{address}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="border border-outline-variant/50 bg-surface-container/30 rounded-2xl p-5">
                <h4 className="font-label-bold text-lg text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  Wallet Analyzer
                </h4>
                <p className="text-sm text-on-surface-variant mb-5 font-body-md">
                  Scan this wallet address to automatically detect eligible airdrops across supported networks and protocols.
                </p>
                {/* [FIX] Clear demo disclaimer — scan is mock/demo only */}
                <div className="mb-4 flex items-start gap-2 p-3 bg-tertiary-container/30 border border-tertiary/20 rounded-xl text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-tertiary text-base shrink-0 mt-0.5">info</span>
                  <span><strong className="text-tertiary">Demo Feature:</strong> Wallet scanning is a UI mockup. Real on-chain eligibility detection is not yet implemented.</span>
                </div>

                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full font-label-bold py-3 bg-primary text-on-primary hover:bg-primary/90 rounded-xl squishy-interaction shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">radar</span>
                  {isScanning ? 'Scanning Blockchain...' : 'Start Scan (Demo)'}
                </button>

                {/* Mock Result */}
                {!isScanning && (
                  <div className="mt-4 p-4 bg-surface-container rounded-xl border border-outline-variant/30 hidden text-center" id="scan-result" style={{ display: isScanning ? 'none' : 'block' }}>
                     <p className="text-xs font-label-bold uppercase text-primary tracking-wider mb-1">Scan Complete</p>
                     <p className="text-sm font-label-bold text-on-surface">No new eligible airdrops found for this address.</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  disconnect()
                  setShowModal(false)
                }}
                className="w-full font-label-bold py-3 border border-error-container bg-error-container/20 text-error hover:bg-error-container/40 rounded-xl transition-colors flex items-center justify-center gap-2 squishy-interaction"
              >
                <span className="material-symbols-outlined text-[18px]">link_off</span>
                Disconnect Wallet
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
