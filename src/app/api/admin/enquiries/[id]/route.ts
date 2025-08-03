import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { status, remark } = await req.json()
  if (!status) {
    return NextResponse.json({ success: false, error: 'Status required' }, { status: 400 })
  }
  const updated = await prisma.enquiry.update({
    where: { id: params.id },
    data: { status, remark: remark || null },
    include: { customer: true },
  })
  return NextResponse.json({ success: true, enquiry: { ...updated, variantIds: updated.variantIds ? JSON.parse(updated.variantIds) : [] } })
}
