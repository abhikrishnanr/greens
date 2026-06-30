import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authz'

// PATCH /api/admin/coupons/:id -> update (partial). Also used to toggle isActive.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard instanceof Response) return guard

  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (body.code !== undefined) data.code = String(body.code).trim().toUpperCase()
  if (body.description !== undefined) data.description = body.description?.trim() || null
  if (body.discountType !== undefined) data.discountType = body.discountType === 'fixed' ? 'fixed' : 'percent'
  if (body.discountValue !== undefined) data.discountValue = Number(body.discountValue)
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate)
  if (body.endDate !== undefined) data.endDate = new Date(body.endDate)
  if (body.minAmount !== undefined) data.minAmount = body.minAmount === '' || body.minAmount == null ? null : Number(body.minAmount)
  if (body.maxRedemptions !== undefined)
    data.maxRedemptions = body.maxRedemptions === '' || body.maxRedemptions == null ? null : Number(body.maxRedemptions)
  if (body.isActive !== undefined) data.isActive = !!body.isActive

  try {
    const coupon = await prisma.coupon.update({ where: { id }, data })
    return NextResponse.json({ coupon })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 })
    }
    console.error('coupon update error', e)
    return NextResponse.json({ error: 'Could not update coupon' }, { status: 500 })
  }
}

// DELETE /api/admin/coupons/:id
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard instanceof Response) return guard

  const { id } = await params
  try {
    await prisma.coupon.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('coupon delete error', e)
    return NextResponse.json({ error: 'Could not delete coupon' }, { status: 500 })
  }
}
