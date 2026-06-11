'use client'

import Link from 'next/link'

interface UpgradePromptProps {
  feature: string
  description?: string
  inline?: boolean
}

/**
 * Upgrade prompt shown when free user tries a Pro feature.
 * Can be inline (in-place) or full-block.
 */
export function UpgradePrompt({ feature, description, inline }: UpgradePromptProps) {
  if (inline) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl text-sm">
        <span className="material-symbols-outlined text-green-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
        <span className="text-on-surface-variant flex-1">{feature} is a <strong className="text-green-700 dark:text-green-400">Pro</strong> feature</span>
        <Link href="/pricing" className="text-green-700 dark:text-green-400 font-bold text-xs hover:underline whitespace-nowrap">
          Upgrade →
        </Link>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-green-300 dark:border-green-800/50 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-900/10 p-6 md:p-8 text-center">
      {/* Blurred background decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="material-symbols-outlined text-[120px] text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
      </div>
      
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
        </div>
        
        <h3 className="text-lg font-bold text-on-surface mb-2">
          {feature}
        </h3>
        <p className="text-sm text-on-surface-variant mb-6 max-w-sm mx-auto">
          {description || `Upgrade to Pro to unlock ${feature.toLowerCase()} and supercharge your farming.`}
        </p>
        
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all squishy-interaction text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
          View Pro Plans
        </Link>
      </div>
    </div>
  )
}
