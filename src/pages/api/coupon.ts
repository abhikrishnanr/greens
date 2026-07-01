import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  const code = (req.query.code as string) || ''
  if (!code) return res.status(400).json({ error: 'Missing code' })
  const now = new Date()
  const coupon = await prisma.coupon.findFirst({
    where: {
      code,
      startDate: { lte: now },
      endDate: { gte: now },
      isActive: true,
    },
  })
  if (!coupon) return res.status(404).json({ error: 'Invalid voucher code' })
  return res.json(coupon)
}
