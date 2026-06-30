import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authz'

// GET /api/admin/coupons            -> all coupons (admin management list)
// GET /api/admin/coupons?active=1   -> only currently-valid coupons (billing picker)
export async function GET(req: Request) {
  const guard = await requireAdmin()
  if (guard instanceof Response) return guard

  const activeOnly = new URL(req.url).searchParams.get('active')
  const now = new Date()

  const where = activeOnly
    ? { isActive: true, startDate: { lte: now }, endDate: { gte: now } }
    : {}

  const coupons = await prisma.coupon.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ coupons })
}

function parseBody(body: any) {
  const code = String(body.code || '').trim().toUpperCase()
  const discountType = body.discountType === 'fixed' ? 'fixed' : 'percent'
  const discountValue = Number(body.discountValue)
  const startDate = body.startDate ? new Date(body.startDate) : null
  const endDate = body.endDate ? new Date(body.endDate) : null
  const minAmount = body.minAmount === '' || body.minAmount == null ? null : Number(body.minAmount)
  const maxRedemptions =
    body.maxRedemptions === '' || body.maxRedemptions == null ? null : Number(body.maxRedemptions)
  const isActive = body.isActive !== false

  const errors: string[] = []
  if (!code) errors.push('Code is required')
  if (!Number.isFinite(discountValue) || discountValue <= 0) errors.push('Discount value must be greater than 0')
  if (discountType === 'percent' && discountValue > 100) errors.push('Percentage discount cannot exceed 100')
  if (!startDate || isNaN(+startDate)) errors.push('Valid start date is required')
  if (!endDate || isNaN(+endDate)) errors.push('Valid end date is required')
  if (startDate && endDate && endDate < startDate) errors.push('End date must be after start date')

  return {
    errors,
    data: { code, description: body.description?.trim() || null, discountType, discountValue, startDate, endDate, minAmount, maxRedemptions, isActive },
  }
}

// POST /api/admin/coupons -> create
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard instanceof Response) return guard

  const { errors, data } = parseBody(await req.json())
  if (errors.length) return NextResponse.json({ error: errors.join('. ') }, { status: 400 })

  try {
    const coupon = await prisma.coupon.create({
      data: { id: randomUUID(), ...data, startDate: data.startDate!, endDate: data.endDate! },
    })
    return NextResponse.json({ coupon })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 })
    }
    console.error('coupon create error', e)
    return NextResponse.json({ error: 'Could not create coupon' }, { status: 500 })
  }
}
