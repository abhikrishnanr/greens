import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  const date = req.query.date as string | undefined
  if (!date) return res.status(400).json({ error: 'Missing date' })
  try {
    const bookings = await prisma.booking.findMany({
      where: { date },
      include: { items: true },
      orderBy: { start: 'asc' },
    })
    const tierIds = Array.from(
      new Set(bookings.flatMap(b => b.items.map(i => i.tierId)))
    )
    const tiers = await prisma.serviceTier.findMany({
      where: { id: { in: tierIds } },
      include: { service: { include: { category: true } } },
    })
    const tierMap: Record<string, typeof tiers[number]> = {}
    tiers.forEach(t => {
      tierMap[t.id] = t
    })
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
    const services = [] as any[]
    bookings.forEach(b => {
      b.items.forEach(it => {
        const scheduledAt = new Date(`${b.date}T${it.start}:00`)
        if (billedSet.has(scheduledAt.toISOString())) return
        const tier = tierMap[it.tierId]
        services.push({
          id: it.id,
          phone: b.phone,
          customer: b.customer,
          category: tier?.service.category.name || '',
          service: tier?.service.name || '',
          variant: tier?.name || it.name,
          start: it.start,
          price: it.price,
          scheduledAt: scheduledAt.toISOString(),
        })
      })
    })
    return res.status(200).json(services)
  } catch (err) {
    console.error('billing services error', err)
    return res.status(500).json({ error: 'Failed to load services' })
  }
}
