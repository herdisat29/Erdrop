import { WalletScanner } from '@/components/wallet/WalletScanner'
import { WalletConnect } from '@/components/wallet/WalletConnect'

export const dynamic = 'force-dynamic'

export default function WalletsPage() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto">
      <div className="pb-2">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
          Wallets
        </h1>
        <p className="font-body-md text-on-surface-variant text-sm mt-1">
          Connect your wallet or scan any address for multi-chain activity.
        </p>
      </div>

      {/* Multi-chain scanner */}
      <WalletScanner />

      {/* Existing wallet connect (wagmi) */}
      <WalletConnect />
    </div>
  )
}
