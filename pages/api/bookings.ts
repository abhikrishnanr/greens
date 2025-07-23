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
    const firstItem = data.items?.[0]
    const booking = await prisma.booking.create({
      data: {
        customer: data.customer,
        phone: data.phone,
        gender: data.gender,
        age: data.age !== null && data.age !== undefined ? Number(data.age) : null,
        staffId: firstItem?.staffId || data.staffId,
        date: data.date,
        start: firstItem?.start || data.start,
        color: data.color,
        items: {
          create:
            (data.items as {
              serviceId: string
              tierId: string
              name: string
              duration: number
              price: number
              staffId: string
              start: string
            }[] | undefined)?.map((i) => ({
              serviceId: i.serviceId,
              tierId: i.tierId,
              name: i.name,
              duration: i.duration,
              price: i.price,
              staffId: i.staffId,
              start: i.start,
            })) || [],
        },
      },
      include: { items: true },
    })
    return res.status(200).json(booking)
  }
  if (req.method === 'PUT') {
    const { id, staffId, start } = req.body
    const booking = await prisma.booking.update({
      where: { id },
      data: { staffId, start },
      include: { items: true },
    })
    return res.status(200).json(booking)
  }
  if (req.method === 'DELETE') {
    const id = (req.query.id as string) || req.body.id
    await prisma.bookingItem.deleteMany({ where: { bookingId: id } })
    await prisma.booking.delete({ where: { id } })
    return res.status(204).end()
  }
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
