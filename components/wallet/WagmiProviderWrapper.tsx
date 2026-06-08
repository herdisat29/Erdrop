'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
// @ts-expect-error - TS sometimes fails to resolve viem's ESM chains bundle in next15
import { mainnet, base, arbitrum, optimism } from 'viem/chains'

// Create a client
const queryClient = new QueryClient()

const config = createConfig({
  chains: [mainnet, base, arbitrum, optimism],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
})

export function WagmiProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
