import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Lets a multi-capability user switch the active "mode" cookie used by
// middleware. SECURITY: the role is validated against what the signed-in user
// is actually entitled to — a caller can never grant themselves a role they
// don't have (previously this set any cookie value with no checks).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const phone = (session?.user as { phone?: string | null })?.phone
  if (!phone) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { role } = await req.json()

  const user = await prisma.user.findUnique({ where: { phone }, select: { role: true } })
  const [billing, booking] = await Promise.all([
    prisma.billing.findFirst({ where: { phone }, select: { id: true } }),
    prisma.booking.findFirst({ where: { phone }, select: { id: true } }),
  ])

  const allowed = new Set<string>()
  if (user?.role === 'admin') allowed.add('admin')
  if (user?.role === 'staff' || user?.role === 'customer_staff') allowed.add('staff')
  if (
    user?.role === 'customer' ||
    user?.role === 'customer_staff' ||
    billing ||
    booking
  ) {
    allowed.add('customer')
  }

  if (!allowed.has(role)) {
    return NextResponse.json({ error: 'Role not permitted for this account' }, { status: 403 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set('role', role, { path: '/', httpOnly: true, sameSite: 'lax' })
  return res
}
