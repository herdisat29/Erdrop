'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/privy/server'
import { IS_BETA_PHASE, BETA_AI_LIMIT } from '@/lib/config'
import type { UserPlan } from '@/types'

// ============================================
// Limits
// ============================================
const FREE_LIMITS = {
  ai_analysis: BETA_AI_LIMIT,
  ai_plan: BETA_AI_LIMIT,
  export: false,
} as const

const PRO_LIMITS = {
  ai_analysis: Infinity,
  ai_plan: 5,
  export: true,
} as const

// ============================================
// Core gate functions
// ============================================

export async function getPlanInfo(userId: string) {
  const profile = await ensureProfile(userId)
  const isPro = profile.plan === 'pro'
  return { plan: profile.plan as UserPlan, isPro, profile }
}

export async function checkFeatureAccess(
  userId: string,
  feature: 'export' | 'ai_analysis' | 'ai_plan' | 'trending_realtime' | 'nft_trending' | 'crypto_news_unlimited'
): Promise<{ allowed: boolean; reason?: string; plan: UserPlan; betaLimitReached?: boolean }> {
  const { plan, isPro } = await getPlanInfo(userId)

  // During beta: all non-AI Pro features are unlocked for everyone
  if (IS_BETA_PHASE && feature !== 'ai_analysis' && feature !== 'ai_plan') {
    return { allowed: true, plan }
  }

  switch (feature) {
    case 'export':
      return {
        allowed: isPro,
        reason: isPro ? undefined : 'Export CSV/JSON is a Pro feature',
        plan,
      }

    case 'trending_realtime':
      return {
        allowed: isPro,
        reason: isPro ? undefined : 'Realtime trending data is a Pro feature. Free users see 15-min delayed data.',
        plan,
      }

    case 'nft_trending':
      return {
        allowed: isPro,
        reason: isPro ? undefined : 'NFT trending collections is a Pro-only feature',
        plan,
      }

    case 'crypto_news_unlimited':
      return {
        allowed: isPro,
        reason: isPro ? undefined : 'Unlimited crypto news is a Pro feature. Free users see 5 headlines/day.',
        plan,
      }

    case 'ai_analysis': {
      if (isPro) return { allowed: true, plan }

      const profile = await ensureProfile(userId)
      const limit = IS_BETA_PHASE ? BETA_AI_LIMIT : FREE_LIMITS.ai_analysis
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const isWithinWindow = profile.ai_analysis_reset_at && new Date(profile.ai_analysis_reset_at) > since
      const count = isWithinWindow ? profile.ai_analysis_count : 0

      if (count >= limit) {
        return {
          allowed: false,
          reason: IS_BETA_PHASE
            ? `Beta limit reached (${limit}/day). Resets tomorrow.`
            : `Free limit reached (${limit}/day). Upgrade to Pro for unlimited!`,
          plan,
          betaLimitReached: IS_BETA_PHASE,
        }
      }
      return { allowed: true, plan }
    }

    case 'ai_plan':
      return await checkAiPlanLimit(userId, plan, isPro)

    default:
      return { allowed: true, plan }
  }
}

async function checkAiPlanLimit(
  userId: string,
  plan: UserPlan,
  isPro: boolean
): Promise<{ allowed: boolean; reason?: string; plan: UserPlan; remaining?: number; betaLimitReached?: boolean }> {
  const profile = await ensureProfile(userId)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const isWithinWindow = profile.ai_plan_reset_at && new Date(profile.ai_plan_reset_at) > since
  const count = isWithinWindow ? profile.ai_plan_count : 0

  if (isPro) {
    if (count >= PRO_LIMITS.ai_plan) {
      return {
        allowed: false,
        reason: `Pro plan limit reached (${PRO_LIMITS.ai_plan}/day). Resets tomorrow.`,
        plan,
        remaining: 0,
      }
    }
    return { allowed: true, plan, remaining: PRO_LIMITS.ai_plan - count }
  } else {
    const limit = IS_BETA_PHASE ? BETA_AI_LIMIT : FREE_LIMITS.ai_plan

    if (count >= limit) {
      return {
        allowed: false,
        reason: IS_BETA_PHASE
          ? `Beta limit reached (${limit}/day). Resets tomorrow.`
          : `Free limit reached (${limit}/day). Upgrade to Pro for 5/day!`,
        plan,
        remaining: 0,
        betaLimitReached: IS_BETA_PHASE,
      }
    }
    return { allowed: true, plan, remaining: limit - count }
  }
}

export async function incrementAiUsage(userId: string, type: 'analysis' | 'plan') {
  const supabase = createClient()
  const profile = await ensureProfile(userId)
  const now = new Date().toISOString()

  if (type === 'plan') {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const isWithinWindow = profile.ai_plan_reset_at && new Date(profile.ai_plan_reset_at) > since
    const newCount = isWithinWindow ? profile.ai_plan_count + 1 : 1

    await supabase
      .from('profiles')
      .update({
        ai_plan_count: newCount,
        ai_plan_reset_at: isWithinWindow ? profile.ai_plan_reset_at : now,
        updated_at: now,
      })
      .eq('id', userId)
  } else {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const isWithinWindow = profile.ai_analysis_reset_at && new Date(profile.ai_analysis_reset_at) > since
    const newCount = isWithinWindow ? profile.ai_analysis_count + 1 : 1

    await supabase
      .from('profiles')
      .update({
        ai_analysis_count: newCount,
        ai_analysis_reset_at: isWithinWindow ? profile.ai_analysis_reset_at : now,
        updated_at: now,
      })
      .eq('id', userId)
  }
}
