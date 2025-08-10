import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, phone, gender, enquiry, variantIds, preferredDate, preferredTime } = await req.json()

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone are required' }, { status: 400 })
    }
    const saved = await prisma.enquiry.create({
      data: {
        name,
        phone,
        gender: gender || null,
        enquiry: enquiry || null,
        variantIds: Array.isArray(variantIds) ? JSON.stringify(variantIds) : null,
        status: 'new',
        source: 'web',
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime && preferredTime !== '' ? preferredTime : null,

      },
    })
    return NextResponse.json({ success: true, enquiry: saved })
  } catch (error) {
    console.error('Error in POST /api/web-enquiries', error)
    return NextResponse.json({ success: false, error: 'Failed to save enquiry' }, { status: 500 })
  }
}
