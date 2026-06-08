'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

interface WalletContextType {
  address: string | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('mock_wallet_address')
    if (saved) setAddress(saved)
  }, [])

  const connect = () => {
    // Generate a mock EVM address
    const mockAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
    setAddress(mockAddress)
    localStorage.setItem('mock_wallet_address', mockAddress)
    toast.success('Wallet connected!')
  }

  const disconnect = () => {
    setAddress(null)
    localStorage.removeItem('mock_wallet_address')
    toast.success('Wallet disconnected!')
  }

  return (
    <WalletContext.Provider value={{ address, isConnected: !!address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
