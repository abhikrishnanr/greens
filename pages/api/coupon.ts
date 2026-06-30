import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { validateCoupon, reasonMessage } from '@/lib/coupon'

// GET /api/coupon?code=XXXX&amount=1234
// Validates a voucher server-side and returns the coupon plus the discount it
// would yield for `amount`. The authoritative discount that is actually charged
// is recomputed again when the bill is saved (see pages/api/billing.ts), so a
// tampered client value can never change what is persisted.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const code = ((req.query.code as string) || '').trim()
  if (!code) return res.status(400).json({ error: 'Missing code' })

  const amount = Number(req.query.amount ?? 0) || 0

  const coupon = await prisma.coupon.findUnique({ where: { code } })
  if (!coupon) return res.status(404).json({ error: 'Invalid voucher code' })

  const result = validateCoupon(coupon, amount, new Date())
  if (!result.ok) {
    const message = result.reason ? reasonMessage[result.reason] : 'Voucher cannot be applied'
    return res.status(422).json({ error: message, reason: result.reason })
  }

  return res.json({
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minAmount: coupon.minAmount,
    discount: result.discount, // server-computed preview for this amount
  })
}
