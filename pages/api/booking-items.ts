import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const role = (session.user as { role?: string })?.role
  const userId = (session.user as { id?: string })?.id
  const allowed = ['beautician', 'receptionist', 'manager', 'owner']

  if (req.method === 'POST') {
    const { bookingId, serviceId, tierId, name, duration, price, start } = req.body
    try {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
      if (!booking) return res.status(404).json({ error: 'Booking not found' })
      if (!booking.phone) return res.status(403).json({ error: 'Cannot add service without customer phone' })
      if (booking.status === 'cancelled') return res.status(400).json({ error: 'Cannot modify a cancelled booking' })
      if (role !== 'admin') {
        if (!userId || booking.staffId !== userId || !allowed.includes(role || '')) {
          return res.status(403).json({ error: 'Forbidden' })
        }
      }
      const item = await prisma.bookingItem.create({
        data: {
          bookingId,
          serviceId,
          tierId,
          name,
          duration,
          price,
          staffId: userId!,
          start,
        },
      })
      return res.status(200).json(item)
    } catch (err) {
      console.error('add booking item error', err)
      return res.status(500).json({ error: 'Failed to add service' })
    }
  }

  if (req.method === 'PUT') {
    const { id, staffId, start, customer, phone, gender, age } = req.body
    try {
      const existing = await prisma.bookingItem.findUnique({
        where: { id },
        include: { booking: true },
      })
      if (!existing) return res.status(404).json({ error: 'Booking item not found' })
      if (existing.booking.status === 'cancelled') return res.status(400).json({ error: 'Cannot modify a cancelled booking' })
      if (role !== 'admin') {
        if (!userId || existing.booking.staffId !== userId || !allowed.includes(role || '')) {
          return res.status(403).json({ error: 'Forbidden' })
        }
      }

      const scheduledAt = new Date(`${existing.booking.date}T${existing.start}:00`)
      const billed = await prisma.billing.findFirst({ where: { scheduledAt } })
      if (billed) {
        return res.status(400).json({ error: 'Cannot modify a billed booking' })
      }

      const item = await prisma.bookingItem.update({
        where: { id },
        data: { staffId, start },
      })
      const booking = await prisma.booking.update({
        where: { id: item.bookingId },
        data: {
          staffId: item.staffId,
          start: item.start,
          customer,
          phone,
          gender,
          age: age !== null && age !== undefined ? Number(age) : null,
        },
        include: { items: true },
      })
      const billedEntries = await prisma.billing.findMany({
        where: {
          scheduledAt: {
            gte: startOfDay(new Date(booking.date)),
            lt: endOfDay(new Date(booking.date)),
          },
        },
        select: { scheduledAt: true },
      })
      const billedSet = new Set(billedEntries.map(b => b.scheduledAt.toISOString()))
      const bookingWithBilled = {
        ...booking,
        items: booking.items.map(it => ({
          ...it,
          billed: billedSet.has(new Date(`${booking.date}T${it.start}:00`).toISOString()),
        })),
      }
      return res.status(200).json({ item, booking: bookingWithBilled })
    } catch (err) {
      console.error('update booking item error', err)
      return res.status(500).json({ error: 'Failed to update booking item' })
    }
  }

  if (req.method === 'DELETE') {
    const id = (req.query.id as string) || req.body.id
    try {
      const item = await prisma.bookingItem.findUnique({
        where: { id },
        include: { booking: true },
      })
      if (!item) return res.status(404).json({ error: 'Booking item not found' })
      if (item.booking.status === 'cancelled') return res.status(400).json({ error: 'Cannot modify a cancelled booking' })
      if (role !== 'admin') {
        if (!userId || item.booking.staffId !== userId || !allowed.includes(role || '')) {
          return res.status(403).json({ error: 'Forbidden' })
        }
      }
      const scheduledAt = new Date(`${item.booking.date}T${item.start}:00`)
      const billed = await prisma.billing.findFirst({ where: { scheduledAt } })
      if (billed) {
        return res.status(400).json({ error: 'Cannot cancel a billed booking' })
      }

      await prisma.bookingItem.delete({ where: { id } })
      const remaining = await prisma.bookingItem.findMany({ where: { bookingId: item.bookingId } })
      if (remaining.length === 0) {
        await prisma.booking.delete({ where: { id: item.bookingId } })
      } else {
        const first = remaining[0]
        await prisma.booking.update({
          where: { id: item.bookingId },
          data: { staffId: first.staffId, start: first.start },
        })
      }
      return res.status(204).end()
    } catch (err) {
      console.error('delete booking item error', err)
      return res.status(500).json({ error: 'Failed to delete booking item' })
    }
  }

  res.setHeader('Allow', ['POST', 'PUT', 'DELETE'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
