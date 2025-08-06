import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')

  if (phone) {
    const customer = await prisma.user.findUnique({ where: { phone } })
    const enquiries = await prisma.enquiry.findMany({
      where: {
        OR: [{ customer: { phone } }, { phone }],
      },
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    })
    const result = enquiries.map((e) => ({
      ...e,
      variantIds: e.variantIds ? JSON.parse(e.variantIds) : [],
    }))
    return NextResponse.json({ customer, enquiries: result })
  }

  const data = await prisma.enquiry.findMany({
    orderBy: { createdAt: 'desc' },
    include: { customer: true },
  })
  const result = data.map((e) => ({
    ...e,
    variantIds: e.variantIds ? JSON.parse(e.variantIds) : [],
  }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, gender, enquiry, variantIds, preferredDate, preferredTime } = await req.json()

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone required' }, { status: 400 })
    }

    const customer = await prisma.user.upsert({
      where: { phone },
      update: { name, gender, role: 'customer' },
      create: { name, phone, gender, role: 'customer' },
    })

    const saved = await prisma.enquiry.create({
      data: {
        customerId: customer.id,
        name,
        phone,
        gender,
        enquiry: enquiry || null,
        variantIds: Array.isArray(variantIds) ? JSON.stringify(variantIds) : null,
        status: 'new',
        source: 'admin',
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime || null,

      },
    })

    return NextResponse.json({ success: true, enquiry: saved })
  } catch (error) {
    console.error('Error in POST /api/admin/enquiries', error)
    return NextResponse.json({ success: false, error: 'Failed to save enquiry' }, { status: 500 })
  }
}
