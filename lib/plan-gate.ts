'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/privy/server'
import type { UserPlan } from '@/types'

// ============================================
// Free tier limits
// ============================================
const FREE_LIMITS = {
  ai_analysis: 1,       // 1 per project (handled separately)
  ai_plan: 1,           // 1 total
  export: false,         // blocked
} as const

const PRO_LIMITS = {
  ai_analysis: Infinity, // unlimited re-analyze
  ai_plan: 5,            // 5 per day
  export: true,          // allowed
} as const

// ============================================
// Core gate functions
// ============================================

/**
 * Check if user has Pro plan. Returns plan info.
 */
export async function getPlanInfo(userId: string) {
  const profile = await ensureProfile(userId)
  const isPro = profile.plan === 'pro'
  
  return {
    plan: profile.plan as UserPlan,
    isPro,
    profile,
  }
}

/**
 * Check if a premium feature is allowed for the user.
 * Returns { allowed, reason, plan }
 */
export async function checkFeatureAccess(
  userId: string,
  feature: 'export' | 'ai_analysis' | 'ai_plan' | 'trending_realtime' | 'nft_trending' | 'crypto_news_unlimited'
): Promise<{ allowed: boolean; reason?: string; plan: UserPlan }> {
  const { plan, isPro } = await getPlanInfo(userId)

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

    case 'ai_analysis':
      // Free: 1x per project (implied by no force re-analyze)
      // Pro: unlimited re-analyze (needs force access)
      return { 
        allowed: isPro, 
        reason: isPro ? undefined : 'Upgrade to Pro for unlimited AI re-analysis',
        plan 
      }

    case 'ai_plan':
      return await checkAiPlanLimit(userId, plan, isPro)

    default:
      return { allowed: true, plan }
  }
}

/**
 * Check AI Farming Plan limit.
 * Free: 1 total ever. Pro: 5/day.
 */
async function checkAiPlanLimit(
  userId: string,
  plan: UserPlan,
  isPro: boolean
): Promise<{ allowed: boolean; reason?: string; plan: UserPlan; remaining?: number }> {
  const profile = await ensureProfile(userId)
  const supabase = createClient()

  if (isPro) {
    // Pro: 5 per 24h window
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const isWithinWindow = profile.ai_plan_reset_at && new Date(profile.ai_plan_reset_at) > since
    const count = isWithinWindow ? profile.ai_plan_count : 0

    if (count >= PRO_LIMITS.ai_plan) {
      return {
        allowed: false,
        reason: `Pro plan limit reached (${PRO_LIMITS.ai_plan}/day). Resets in a few hours.`,
        plan,
        remaining: 0,
      }
    }
    return { allowed: true, plan, remaining: PRO_LIMITS.ai_plan - count }
  } else {
    // Free: 1 total ever
    if (profile.ai_plan_count >= FREE_LIMITS.ai_plan) {
      return {
        allowed: false,
        reason: 'Free plan allows 1 farming plan total. Upgrade to Pro for 5/day!',
        plan,
        remaining: 0,
      }
    }
    return { allowed: true, plan, remaining: FREE_LIMITS.ai_plan - profile.ai_plan_count }
  }
}

/**
 * Increment AI usage counter after successful generation.
 */
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
    await supabase
      .from('profiles')
      .update({
        ai_analysis_count: profile.ai_analysis_count + 1,
        updated_at: now,
      })
      .eq('id', userId)
  }
}
