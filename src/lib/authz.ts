import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export interface SessionUser {
  id?: string
  role?: string | null
  phone?: string | null
  modules?: string[]
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions)
  return (session?.user as SessionUser) ?? null
}

/**
 * Guard for API routes. Returns the session user when their role is allowed,
 * otherwise returns a ready-to-send 401/403 Response (call sites: `if (guard
 * instanceof Response) return guard`).
 */
export async function requireRole(
  allowed: string[],
): Promise<SessionUser | Response> {
  const user = await getSessionUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (!user.role || !allowed.includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Not authorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return user
}

export const requireAdmin = () => requireRole(['admin'])
