import { PremiumLogo } from '@/components/ui/icons'

/**
 * Small "PRO" badge component to mark premium features.
 * Usage: <ProBadge /> next to any menu item or card title.
 */
export function ProBadge({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-md leading-none ${className || ''}`}>
      <PremiumLogo className="w-3 h-3 text-green-600 dark:text-green-400" />
      BETA
    </span>
  )
}
