import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

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

    if (date) {
      const billed = await prisma.billing.findMany({
        where: {
          scheduledAt: {
            gte: startOfDay(new Date(date)),
            lt: endOfDay(new Date(date)),
          },
        },
        select: { scheduledAt: true },
      })
      const billedSet = new Set(billed.map(b => b.scheduledAt.toISOString()))
      bookings.forEach(b => {
        b.items = b.items.map(it => {
          const scheduledAt = new Date(`${b.date}T${it.start}:00`).toISOString()
          return { ...it, billed: billedSet.has(scheduledAt) }
        }) as typeof b.items
      })
    }

    return res.status(200).json(bookings)
  }
  if (req.method === 'POST') {
    const data = req.body
    const firstItem = data.items?.[0]

    if (data.phone && data.customer) {
      try {
        await prisma.user.upsert({
          where: { phone: data.phone },
          update: { name: data.customer, gender: data.gender },
          create: { name: data.customer, phone: data.phone, gender: data.gender, role: 'customer' },
        })
      } catch (err) {
        console.error('customer upsert failed', err)
      }
    }
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
    const { id, staffId, start, customer, phone, gender, age } = req.body
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        staffId,
        start,
        customer,
        phone,
        gender,
        age: age !== null && age !== undefined ? Number(age) : null,
      },
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
