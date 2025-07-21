import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const where: { date?: string } = {}
  if (date) where.date = date
  const bookings = await prisma.booking.findMany({
    where,
    include: { items: true },
    orderBy: { start: 'asc' }
  })
  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const booking = await prisma.booking.create({
    data: {
      customer: data.customer,
      phone: data.phone,
      staffId: data.staffId,
      date: data.date,
      start: data.start,
      color: data.color,
      items: {
        create: (data.items as {
          serviceId: string
          tierId: string
          name: string
          duration: number
          price: number
        }[] | undefined)?.map((i) => ({
          serviceId: i.serviceId,
          tierId: i.tierId,
          name: i.name,
          duration: i.duration,
          price: i.price
        })) || []
      }
    },
    include: { items: true }
  })
  return NextResponse.json(booking)
}
