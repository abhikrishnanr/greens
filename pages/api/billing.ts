import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { validateCoupon, allocateDiscount } from '@/lib/coupon'

interface BillGroup {
  id: string
  billingName: string | null
  billingAddress: string | null
  voucherCode: string | null
  paymentMethod: string
  paidAt: Date | null
  createdAt: Date
  items: {
    phone: string | null
    category: string
    service: string
    variant: string
    amountBefore: number
    amountAfter: number
    scheduledAt: Date
  }[]
  phones: Set<string>
  totalBefore: number
  totalAfter: number
}

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
        const bills: Record<string, BillGroup> = {}
      for (const it of items) {
        const b = bills[it.billId] || {
          id: it.billId,
          billingName: it.billingName,
          billingAddress: it.billingAddress,
          voucherCode: it.voucherCode,
          paymentMethod: it.paymentMethod,
          paidAt: it.paidAt,
          createdAt: it.createdAt,
          items: [],
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
    paymentMethod?: string
    paidAt?: string | null
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
    for (const s of data.services) {
      const dt = new Date(s.scheduledAt)
      const dateStr = dt.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
      const timeStr = dt.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      const booking = await prisma.booking.findFirst({
        where: { date: dateStr, items: { some: { start: timeStr } } },
        select: { status: true },
      })
      if (booking?.status === 'cancelled') {
        return res.status(400).json({ error: 'Cannot bill a cancelled booking' })
      }
    }
    const billId = randomUUID()

    // --- Server-trusted voucher discount ---------------------------------
    // The client only sends the voucher CODE and the per-line offer prices.
    // We re-validate the coupon and recompute the discount here so that what
    // gets written to `Billing.amountAfter` (and therefore every invoice,
    // billing-history total and report) always reflects the real discount and
    // can never be inflated/forged from the browser.
    const lineOffer = data.services.map((s) => Number(s.amountAfter) || 0)
    const subtotalAfter = lineOffer.reduce((a, b) => a + b, 0)

    let appliedDiscount = 0
    let appliedCode: string | null = null
    let coupon: Awaited<ReturnType<typeof prisma.coupon.findUnique>> | null = null

    if (data.voucherCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: data.voucherCode } })
      if (!coupon) {
        return res.status(422).json({ error: 'Invalid voucher code' })
      }
      const check = validateCoupon(coupon, subtotalAfter, new Date())
      if (!check.ok) {
        return res.status(422).json({ error: 'Voucher cannot be applied', reason: check.reason })
      }
      appliedDiscount = check.discount
      appliedCode = coupon.code
    }

    // Spread the discount proportionally across the line items so per-line
    // `amountAfter` stays consistent with the bill total.
    const discountedAfter = allocateDiscount(lineOffer, appliedDiscount)

    // Persist all rows + the coupon usage increment atomically. If anything
    // fails, nothing is written (no partial bills, no double-counted usage).
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < data.services.length; i++) {
        const s = data.services[i]
        await tx.billing.create({
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
            amountAfter: discountedAfter[i],
            voucherCode: appliedCode,
            paymentMethod: data.paymentMethod || 'cash',
            paidAt: data.paidAt
              ? new Date(data.paidAt)
              : data.paymentMethod === 'paylater'
                ? null
                : new Date(),
            scheduledAt: new Date(s.scheduledAt),
          },
        })
      }
      if (coupon && appliedDiscount > 0) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { timesUsed: { increment: 1 } },
        })
      }
    })

    return res.status(200).json({
      success: true,
      billId,
      discount: appliedDiscount,
      voucherCode: appliedCode,
    })
  } catch (err) {
    console.error('billing save error', err)
    return res.status(500).json({ error: 'Failed to save billing' })
  }
}
