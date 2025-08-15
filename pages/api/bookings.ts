import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { startOfDay, endOfDay } from 'date-fns'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const role = (session.user as { role?: string })?.role
  const userId = (session.user as { id?: string })?.id

  if (req.method === 'GET') {
    const date = req.query.date as string | undefined
    const where: { date?: string; staffId?: string } = {}
    if (date) where.date = date
    if (role !== 'admin') {
      const allowed = ['beautician', 'receptionist', 'manager', 'owner']
      if (!role || !allowed.includes(role) || !userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      where.staffId = userId
    }
    const bookings = await prisma.booking.findMany({
      where,
      include: { items: true },
      orderBy: { start: 'asc' },
    })

    if (date) {
      const billed = await prisma.billing.findMany({
        where: {
          scheduledAt: {
            gte: startOfDay(new Date(`${date}T00:00:00Z`)),
            lt: endOfDay(new Date(`${date}T00:00:00Z`)),
          },
        },
        select: { scheduledAt: true },
      })
      const billedSet = new Set(billed.map(b => b.scheduledAt.toISOString()))
      bookings.forEach(b => {
        b.items = b.items.map(it => {
          const scheduledAt = new Date(`${b.date}T${it.start}:00Z`).toISOString()
          return { ...it, billed: billedSet.has(scheduledAt) }
        }) as typeof b.items
      })
    }

    return res.status(200).json(bookings)
  }
  if (req.method === 'POST') {
    const data = req.body
    const firstItem = data.items?.[0]
    const bookingStaffId = firstItem?.staffId || data.staffId
    const allowed = ['beautician', 'receptionist', 'manager', 'owner']

    if (role !== 'admin') {
      if (!userId || bookingStaffId !== userId || !allowed.includes(role || '')) {
        return res.status(403).json({ error: 'Forbidden' })
      }
    }

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
        staffId: bookingStaffId,
        date: data.date,
        start: firstItem?.start || data.start,
        color: data.color,
        status: data.status || undefined,
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
    const { id, staffId, start, customer, phone, gender, age, status } = req.body
    const existing = await prisma.booking.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Booking not found' })
    if (role !== 'admin') {
      const allowed = ['beautician', 'receptionist', 'manager', 'owner']
      if (!userId || existing.staffId !== userId || !allowed.includes(role || '')) {
        return res.status(403).json({ error: 'Forbidden' })
      }
    }
    const updateData: Prisma.BookingUpdateInput = {
      staffId,
      start,
      customer,
      phone,
      gender,
      age: age !== null && age !== undefined ? Number(age) : null,
    }
    if (status) updateData.status = status
    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: { items: true },
    })
    return res.status(200).json(booking)
  }
  if (req.method === 'DELETE') {
    const id = (req.query.id as string) || req.body.id
    const existing = await prisma.booking.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Booking not found' })
    if (role !== 'admin') {
      const allowed = ['beautician', 'receptionist', 'manager', 'owner']
      if (!userId || existing.staffId !== userId || !allowed.includes(role || '')) {
        return res.status(403).json({ error: 'Forbidden' })
      }
    }
    await prisma.bookingItem.deleteMany({ where: { bookingId: id } })
    await prisma.booking.delete({ where: { id } })
    return res.status(204).end()
  }
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
