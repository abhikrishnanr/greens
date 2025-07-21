import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') // YYYY-MM-DD
  const branchId = searchParams.get('branchId') || undefined
  const where: any = {}
  if (branchId) where.branchId = branchId
  if (date) {
    const start = new Date(date + 'T00:00:00')
    const end = new Date(date + 'T23:59:59')
    where.scheduledAt = { gte: start, lte: end }
  }
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      items: { include: { serviceTier: true } },
      staff: { select: { id: true, name: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  })
  return NextResponse.json({ success: true, bookings })
}

export async function POST(req: Request) {
  const data = await req.json()
  const items = (data.items || []) as { serviceTierId: string; quantity?: number }[]
  const booking = await prisma.booking.create({
    data: {
      customerName: data.customerName,
      phone: data.phone,
      branchId: data.branchId,
      staffId: data.staffId,
      scheduledAt: new Date(data.scheduledAt),
      duration: data.duration,
      estimatedAmount: data.estimatedAmount,
      items: { create: items.map(i => ({ serviceTierId: i.serviceTierId, quantity: i.quantity ?? 1 })) },
    },
    include: { items: true, staff: true },
  })
  return NextResponse.json({ success: true, booking })
}
