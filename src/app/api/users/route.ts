import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authz'

// Listing staff/role users — admin only.
export async function GET() {
  const guard = await requireAdmin()
  if (guard instanceof Response) return guard

  const users = await prisma.user.findMany({
    where: { role: { not: 'customer' } },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      designation: true,
      imageUrl: true,
      removed: true,
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ users })
}

// Changing a user's role / password / active flag — admin only.
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard instanceof Response) return guard

  const { id, role, password, removed } = await req.json()
  if (!id) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  const data: Partial<{ role: string; password: string; removed: boolean }> = {}
  if (role !== undefined) data.role = role
  if (password !== undefined) data.password = password
  if (removed !== undefined) data.removed = removed

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  try {
    await prisma.user.update({ where: { id }, data })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('user update error', e)
    return NextResponse.json({ error: 'Could not update user' }, { status: 500 })
  }
}
