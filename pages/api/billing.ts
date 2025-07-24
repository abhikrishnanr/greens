import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const date = req.query.date as string | undefined
    if (!date) return res.status(400).json({ error: 'Missing date' })
    try {
      const start = new Date(`${date}T00:00:00`)
      const end = new Date(`${date}T23:59:59`)
      const items = await prisma.billing.findMany({
        where: {
          scheduledAt: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      const bills: Record<string, any> = {}
      for (const it of items) {
        const b = bills[it.billId] || {
          id: it.billId,
          billingName: it.billingName,
          billingAddress: it.billingAddress,
          voucherCode: it.voucherCode,
          createdAt: it.createdAt,
          items: [] as any[],
          phones: new Set<string>(),
          totalBefore: 0,
          totalAfter: 0,
        }
        b.items.push({
          phone: it.phone,
          category: it.category,
          service: it.service,
          variant: it.variant,
          amountBefore: it.amountBefore,
          amountAfter: it.amountAfter,
          scheduledAt: it.scheduledAt,
        })
        if (it.phone) b.phones.add(it.phone)
        b.totalBefore += it.amountBefore
        b.totalAfter += it.amountAfter
        bills[it.billId] = b
      }
      return res.json(
        Object.values(bills).map(b => ({
          ...b,
          phones: Array.from(b.phones),
        }))
      )
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
    billingName?: string | null
    billingAddress?: string | null
    voucherCode?: string | null
    services: {
      phone: string | null
      category: string
      service: string
      variant: string
      amountBefore: number
      amountAfter: number
      scheduledAt: string
    }[]
  }
  try {
    const billId = randomUUID()
    for (const s of data.services) {
      await prisma.billing.create({
        data: {
          customerId: data.customerId || null,
          billId,
          phone: s.phone,
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
