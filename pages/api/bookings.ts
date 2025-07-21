import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const date = req.query.date as string | undefined
    const where: { date?: string } = {}
    if (date) where.date = date
    const bookings = await prisma.booking.findMany({
      where,
      include: { items: true },
      orderBy: { start: 'asc' },
    })
    return res.status(200).json(bookings)
  }
  if (req.method === 'POST') {
    const data = req.body
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
            price: i.price,
          })) || [],
        },
      },
      include: { items: true },
    })
    return res.status(200).json(booking)
  }
  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
