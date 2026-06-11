'use client'

import { usePrivy } from '@privy-io/react-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'

export function UserProfile() {
  const { user, ready, logout, linkWallet, linkEmail, linkGoogle, linkTwitter, linkDiscord } = usePrivy()
  const router = useRouter()

  if (!ready || !user) return null

  // Find primary identity to display
  const emailAccount = user.linkedAccounts.find(a => a.type === 'email')
  const googleAccount = user.linkedAccounts.find(a => a.type === 'google_oauth')
  const twitterAccount = user.linkedAccounts.find(a => a.type === 'twitter_oauth')
  const discordAccount = user.linkedAccounts.find(a => a.type === 'discord_oauth')
  const walletAccount = user.linkedAccounts.find(a => a.type === 'wallet')

  let displayName = 'User'
  let displayIcon = 'person'
  
  if (twitterAccount && 'username' in twitterAccount) {
    displayName = `@${twitterAccount.username}`
    displayIcon = 'tag'
  } else if (discordAccount && 'username' in discordAccount) {
    displayName = discordAccount.username || 'Discord User'
    displayIcon = 'sports_esports'
  } else if (googleAccount && 'name' in googleAccount) {
    displayName = googleAccount.name || 'Google User'
    displayIcon = 'account_circle'
  } else if (emailAccount && 'address' in emailAccount) {
    displayName = emailAccount.address
    displayIcon = 'mail'
  } else if (walletAccount && 'address' in walletAccount) {
    displayName = `${walletAccount.address.slice(0, 6)}...${walletAccount.address.slice(-4)}`
    displayIcon = 'account_balance_wallet'
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest font-label-bold text-xs md:text-sm rounded-xl squishy-interaction shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50">
        <span className="material-symbols-outlined text-[14px] md:text-base">{displayIcon}</span>
        <span className="max-w-[120px] truncate">{displayName}</span>
        <span className="material-symbols-outlined text-[14px] opacity-50">expand_more</span>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 bg-surface-container-lowest border-outline-variant shadow-xl rounded-2xl p-2">
        <DropdownMenuLabel className="font-headline-md text-on-surface">My Accounts</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-outline-variant/30" />
        
        {/* Linked Accounts */}
        <div className="py-2 space-y-1">
          {/* Email */}
          {emailAccount ? (
             <div className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant bg-surface-container/50 rounded-lg">
               <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
               <span className="truncate">{'address' in emailAccount ? emailAccount.address : 'Email Linked'}</span>
             </div>
          ) : (
             <DropdownMenuItem onClick={linkEmail} className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg hover:bg-surface-container">
               <span className="material-symbols-outlined text-[16px]">mail</span>
               <span>Link Email</span>
             </DropdownMenuItem>
          )}

          {/* Google */}
          {googleAccount ? (
             <div className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant bg-surface-container/50 rounded-lg">
               <span className="material-symbols-outlined text-[16px] text-primary">account_circle</span>
               <span className="truncate">{'email' in googleAccount ? googleAccount.email : 'Google Linked'}</span>
             </div>
          ) : (
             <DropdownMenuItem onClick={linkGoogle} className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg hover:bg-surface-container">
               <span className="material-symbols-outlined text-[16px]">account_circle</span>
               <span>Link Google</span>
             </DropdownMenuItem>
          )}

          {/* Twitter */}
          {twitterAccount ? (
             <div className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant bg-surface-container/50 rounded-lg">
               <span className="material-symbols-outlined text-[16px] text-primary">tag</span>
               <span className="truncate">{'username' in twitterAccount ? `@${twitterAccount.username}` : 'Twitter Linked'}</span>
             </div>
          ) : (
             <DropdownMenuItem onClick={linkTwitter} className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg hover:bg-surface-container">
               <span className="material-symbols-outlined text-[16px]">tag</span>
               <span>Link Twitter (X)</span>
             </DropdownMenuItem>
          )}

          {/* Discord */}
          {discordAccount ? (
             <div className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant bg-surface-container/50 rounded-lg">
               <span className="material-symbols-outlined text-[16px] text-primary">sports_esports</span>
               <span className="truncate">{'username' in discordAccount ? discordAccount.username : 'Discord Linked'}</span>
             </div>
          ) : (
             <DropdownMenuItem onClick={linkDiscord} className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg hover:bg-surface-container">
               <span className="material-symbols-outlined text-[16px]">sports_esports</span>
               <span>Link Discord</span>
             </DropdownMenuItem>
          )}

          {/* Wallet */}
          {walletAccount ? (
             <div className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant bg-surface-container/50 rounded-lg">
               <span className="material-symbols-outlined text-[16px] text-primary">account_balance_wallet</span>
               <span className="truncate">{'address' in walletAccount ? `${walletAccount.address.slice(0, 6)}...${walletAccount.address.slice(-4)}` : 'Wallet Linked'}</span>
             </div>
          ) : (
             <DropdownMenuItem onClick={linkWallet} className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg hover:bg-surface-container text-primary font-bold">
               <span className="material-symbols-outlined text-[16px]">add_link</span>
               <span>Connect Wallet</span>
             </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator className="bg-outline-variant/30" />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg text-error hover:bg-error-container hover:text-on-error-container transition-colors mt-1 font-label-bold"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
