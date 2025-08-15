import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany({
    where: { role: { not: 'customer' } },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      modules: true,
      designation: true,
      imageUrl: true,
      removed: true,
    },
  })
  return NextResponse.json({ users })
}

export async function POST(req: Request) {
  const { id, role, modules, password, removed } = await req.json()
  const data: Partial<{
    role: string
    modules: string[]
    password: string
    removed: boolean
  }> = {}
  if (role !== undefined) data.role = role
  if (modules !== undefined) data.modules = modules
  if (password !== undefined) data.password = password
  if (removed !== undefined) data.removed = removed
  await prisma.user.update({
    where: { id },
    data,
  })
  return NextResponse.json({ success: true })
}
