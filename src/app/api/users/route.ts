import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, modules: true }
  })
  return NextResponse.json({ users })
}

export async function POST(req: Request) {
  const { id, role, modules } = await req.json()
  await prisma.user.update({
    where: { id },
    data: { role, modules }
  })
  return NextResponse.json({ success: true })
}
