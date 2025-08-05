import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { id } = params
  await prisma.featuredService.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
