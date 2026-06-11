import { PrivyClient } from '@privy-io/server-auth'
import { cookies } from 'next/headers'

const privy = new PrivyClient(
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

export { privy }
