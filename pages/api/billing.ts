import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const date = req.query.date as string | undefined
    if (!date) return res.status(400).json({ error: 'Missing date' })
    try {
      const start = new Date(`${date}T00:00:00`)
      const end = new Date(`${date}T23:59:59`)
      const bills = await prisma.billing.findMany({
        where: {
          scheduledAt: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      return res.json(bills)
    } catch (err) {
      console.error('billing fetch error', err)
      return res.status(500).json({ error: 'Failed to load billing' })
    }
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  const data = req.body as {
    customerId?: string | null
    phone?: string | null
    billingName?: string | null
    billingAddress?: string | null
    voucherCode?: string | null
    services: {
      category: string
      service: string
      variant: string
      amountBefore: number
      amountAfter: number
      scheduledAt: string
    }[]
  }
  try {
    for (const s of data.services) {
      await prisma.billing.create({
        data: {
          customerId: data.customerId || null,
          phone: data.phone || null,
          billingName: data.billingName || null,
          billingAddress: data.billingAddress || null,
          category: s.category,
          service: s.service,
          variant: s.variant,
          amountBefore: s.amountBefore,
          amountAfter: s.amountAfter,
          voucherCode: data.voucherCode || null,
          scheduledAt: new Date(s.scheduledAt),
        },
      })
    }
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('billing save error', err)
    return res.status(500).json({ error: 'Failed to save billing' })
  }
}
