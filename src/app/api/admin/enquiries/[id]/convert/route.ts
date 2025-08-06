import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const enquiry = await prisma.enquiry.findUnique({ where: { id: params.id } })
  if (!enquiry) {
    return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 })
  }
  if (enquiry.customerId) {
    return NextResponse.json({ success: false, error: 'Enquiry already linked to customer' }, { status: 400 })
  }
  const customer = await prisma.user.create({
    data: {
      name: enquiry.name || undefined,
      phone: enquiry.phone || undefined,
      gender: enquiry.gender || undefined,
      role: 'customer',
    },
  })
  await prisma.enquiry.update({
    where: { id: enquiry.id },
    data: { customerId: customer.id },
  })
  return NextResponse.json({ success: true, customer })
}
