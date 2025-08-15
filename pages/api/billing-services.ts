import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  const date = req.query.date as string | undefined
  if (!date) return res.status(400).json({ error: 'Missing date' })
  try {
    const bookings = await prisma.booking.findMany({
      where: { date, status: { not: 'cancelled' } },
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


    const tz = "+05:30"
    const billed = await prisma.billing.findMany({
      where: {
        scheduledAt: {
          gte: new Date(`${date}T00:00:00${tz}`),
          lt: new Date(`${date}T23:59:59${tz}`),
        },
      },
      select: { scheduledAt: true },
    })
    const billedSet = new Set(billed.map(b => b.scheduledAt.toISOString()))
    const services: {
      id: string
      phone: string | null
      customer: string | null
      category: string
      service: string
      variant: string
      start: string
      actualPrice: number
      offerPrice: number
      scheduledAt: string
    }[] = []
    for (const b of bookings) {
      for (const it of b.items) {
        const scheduledAt = new Date(`${b.date}T${it.start}:00${tz}`)
        if (billedSet.has(scheduledAt.toISOString())) continue
        const tier = tierMap[it.tierId]
        const ph = await prisma.serviceTierPriceHistory.findFirst({
          where: {
            tierId: it.tierId,
            startDate: { lte: scheduledAt },
            OR: [{ endDate: null }, { endDate: { gt: scheduledAt } }],
          },
          orderBy: { startDate: 'desc' },
        })
        const actualPrice = ph?.actualPrice ?? tier?.actualPrice ?? 0
        const offerPrice = ph?.offerPrice ?? ph?.actualPrice ?? tier?.offerPrice ?? actualPrice

        services.push({
          id: it.id,
          phone: b.phone,
          customer: b.customer,
          category: tier?.service.category.name || '',
          service: tier?.service.name || '',
          variant: tier?.name || it.name,
          start: it.start,
          actualPrice,
          offerPrice,
          scheduledAt: scheduledAt.toISOString(),
        })
      }
    }
    return res.status(200).json(services)
  } catch (err) {
    console.error('billing services error', err)
    return res.status(500).json({ error: 'Failed to load services' })
  }
}
