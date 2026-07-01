import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  const phone = req.query.phone as string | undefined
  if (!phone) return res.status(400).json({ error: 'Missing phone' })
  try {
    const customer = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, name: true, phone: true, gender: true },
    })
    if (!customer) return res.json({ customer: null })
    const agg = await prisma.billing.aggregate({
      where: {
        OR: [{ customerId: customer.id }, { phone }],
      },
      _sum: { amountAfter: true },
      _count: true,
    })
    return res.json({
      customer,
      totalAmount: agg._sum.amountAfter || 0,
      billCount: agg._count,
    })
  } catch (err) {
    console.error('customer lookup error', err)
    return res.status(500).json({ error: 'Failed to lookup customer' })
  }
}
