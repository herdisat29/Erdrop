'use client'

import { usePrivy } from '@privy-io/react-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'

// Brand SVG icons for social platforms
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
    </svg>
  )
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
    </svg>
  )
}

export function UserProfile() {
  const { user, ready, logout, linkWallet, linkEmail, linkGoogle, linkTwitter, linkDiscord } = usePrivy()
  const router = useRouter()

  if (!ready || !user) return null

  // Find linked accounts
  const emailAccount = user.linkedAccounts.find(a => a.type === 'email')
  const googleAccount = user.linkedAccounts.find(a => a.type === 'google_oauth')
  const twitterAccount = user.linkedAccounts.find(a => a.type === 'twitter_oauth')
  const discordAccount = user.linkedAccounts.find(a => a.type === 'discord_oauth')
  const walletAccount = user.linkedAccounts.find(a => a.type === 'wallet')

  // Determine primary display identity
  let displayName = 'User'
  let avatarInitial = 'U'
  
  if (twitterAccount && 'username' in twitterAccount) {
    displayName = `@${twitterAccount.username}`
    avatarInitial = (twitterAccount.username as string)?.[0]?.toUpperCase() || 'X'
  } else if (discordAccount && 'username' in discordAccount) {
    displayName = (discordAccount.username as string) || 'Discord'
    avatarInitial = displayName[0]?.toUpperCase() || 'D'
  } else if (googleAccount && 'name' in googleAccount) {
    displayName = (googleAccount.name as string) || 'Google'
    avatarInitial = displayName[0]?.toUpperCase() || 'G'
  } else if (emailAccount && 'address' in emailAccount) {
    displayName = emailAccount.address as string
    avatarInitial = displayName[0]?.toUpperCase() || 'E'
  } else if (walletAccount && 'address' in walletAccount) {
    const addr = walletAccount.address as string
    displayName = `${addr.slice(0, 6)}...${addr.slice(-4)}`
    avatarInitial = '0x'
  }

  const linkedCount = [emailAccount, googleAccount, twitterAccount, discordAccount, walletAccount].filter(Boolean).length

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Reusable row for a linked account
  const LinkedRow = ({ icon, label, detail }: { icon: React.ReactNode; label: string; detail: string }) => (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-container/40 border border-outline-variant/15">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/60">{label}</p>
        <p className="text-sm font-medium text-on-surface truncate">{detail}</p>
      </div>
      <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
    </div>
  )

  // Reusable row for linking a new account
  const LinkRow = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
    <DropdownMenuItem 
      onClick={onClick} 
      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl border border-dashed border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5 transition-all"
    >
      <div className="w-8 h-8 rounded-lg bg-surface-container-highest/60 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="flex-1 text-sm text-on-surface-variant">{label}</span>
      <span className="material-symbols-outlined text-[16px] text-primary/60">add_circle</span>
    </DropdownMenuItem>
  )

  return (
    <DropdownMenu>
      {/* Trigger Button — avatar pill */}
      <DropdownMenuTrigger className="flex items-center gap-2 pl-1.5 pr-3 py-1 md:pl-2 md:pr-4 md:py-1.5 bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest rounded-full squishy-interaction shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 group">
        {/* Avatar circle */}
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-[11px] md:text-xs font-bold shadow-inner shrink-0">
          {avatarInitial}
        </div>
        <span className="max-w-[100px] md:max-w-[120px] truncate text-xs md:text-sm font-semibold">{displayName}</span>
        <span className="material-symbols-outlined text-[14px] opacity-40 group-hover:opacity-70 transition-opacity">keyboard_arrow_down</span>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72 bg-surface-container-lowest border-outline-variant/40 shadow-2xl rounded-2xl p-0 overflow-hidden">
        
        {/* Profile Header with gradient */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-base font-bold shadow-md ring-2 ring-white/80">
              {avatarInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">{displayName}</p>
              <p className="text-[11px] text-on-surface-variant/70 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                {linkedCount} account{linkedCount !== 1 ? 's' : ''} linked
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-outline-variant/20 m-0" />

        {/* Linked Accounts Section */}
        <div className="p-2">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 px-3 py-1.5">
              Connected Accounts
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <div className="space-y-1.5 mt-1">
            {/* Email */}
            {emailAccount ? (
              <LinkedRow 
                icon={<span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>}
                label="Email"
                detail={'address' in emailAccount ? (emailAccount.address as string) : 'Linked'}
              />
            ) : (
              <LinkRow 
                icon={<span className="material-symbols-outlined text-[16px] text-on-surface-variant/50">mail</span>}
                label="Link Email"
                onClick={linkEmail}
              />
            )}

            {/* Google */}
            {googleAccount ? (
              <LinkedRow 
                icon={<GoogleIcon className="w-4 h-4" />}
                label="Google"
                detail={'email' in googleAccount ? (googleAccount.email as string) : 'Linked'}
              />
            ) : (
              <LinkRow 
                icon={<GoogleIcon className="w-4 h-4 opacity-50" />}
                label="Link Google"
                onClick={linkGoogle}
              />
            )}

            {/* Twitter / X */}
            {twitterAccount ? (
              <LinkedRow 
                icon={<XIcon className="w-3.5 h-3.5 text-on-surface" />}
                label="X (Twitter)"
                detail={'username' in twitterAccount ? `@${twitterAccount.username}` : 'Linked'}
              />
            ) : (
              <LinkRow 
                icon={<XIcon className="w-3.5 h-3.5 text-on-surface-variant/50" />}
                label="Link X (Twitter)"
                onClick={linkTwitter}
              />
            )}

            {/* Discord */}
            {discordAccount ? (
              <LinkedRow 
                icon={<DiscordIcon className="w-4 h-4 text-[#5865F2]" />}
                label="Discord"
                detail={'username' in discordAccount ? (discordAccount.username as string) : 'Linked'}
              />
            ) : (
              <LinkRow 
                icon={<DiscordIcon className="w-4 h-4 text-on-surface-variant/50" />}
                label="Link Discord"
                onClick={linkDiscord}
              />
            )}

            {/* Wallet */}
            {walletAccount ? (
              <LinkedRow 
                icon={<WalletIcon className="w-4 h-4 text-primary" />}
                label="Wallet"
                detail={'address' in walletAccount ? `${(walletAccount.address as string).slice(0, 6)}...${(walletAccount.address as string).slice(-4)}` : 'Linked'}
              />
            ) : (
              <LinkRow 
                icon={<WalletIcon className="w-4 h-4 text-on-surface-variant/50" />}
                label="Connect Wallet"
                onClick={linkWallet}
              />
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-outline-variant/20 m-0" />

        {/* Logout */}
        <div className="p-2">
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-xl text-error hover:bg-error/10 transition-all font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="text-sm">Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
