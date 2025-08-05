import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const services = await prisma.serviceNew.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, applicableTo: true }
  })
  return NextResponse.json(services)
}
