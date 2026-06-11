import { PrivyClient } from '@privy-io/server-auth'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { Profile, UserPlan } from '@/types'

export const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
)

/**
 * Verify the Privy auth token from cookies and return the user ID.
 * Returns null if not authenticated.
 */
export async function getPrivyUser(): Promise<{ id: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('privy-token')?.value

  if (!token) return null

  try {
    const verifiedClaims = await privy.verifyAuthToken(token)
    return { id: verifiedClaims.userId }
  } catch {
    return null
  }
}

/**
 * Ensure a profile row exists for the given user.
 * Auto-creates with plan='free' on first login.
 * Returns the profile.
 */
export async function ensureProfile(userId: string): Promise<Profile> {
  const supabase = createClient()

  // Try to fetch existing profile
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (existing) return existing as Profile

  // Create new profile with free plan
  const { data: created, error } = await supabase
    .from('profiles')
    .insert({ id: userId })
    .select()
    .single()

  if (error) {
    // Race condition: another request might have created it
    const { data: retry } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (retry) return retry as Profile
    throw new Error(`Failed to create profile: ${error.message}`)
  }

  return created as Profile
}

/**
 * Get user's current plan. Returns 'free' if profile doesn't exist yet.
 */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  const profile = await ensureProfile(userId)
  
  // Check if pro plan has expired
  if (profile.plan === 'pro' && profile.plan_expires_at) {
    if (new Date(profile.plan_expires_at) < new Date()) {
      // Plan expired, downgrade to free
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({ plan: 'free', updated_at: new Date().toISOString() })
        .eq('id', userId)
      return 'free'
    }
  }

  return profile.plan
}

export { privy }
