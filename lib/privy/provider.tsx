'use client'

import { PrivyProvider } from '@privy-io/react-auth'

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#205dae',
        },
        loginMethods: ['email', 'google', 'twitter', 'discord', 'wallet'],
      }}
    >
      {children}
    </PrivyProvider>
  )
}
