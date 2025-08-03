import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const today = await prisma.enquiry.count({
    where: { createdAt: { gte: start } },
  })
  const newCount = await prisma.enquiry.count({ where: { status: 'new' } })
  const processing = await prisma.enquiry.count({ where: { status: 'processing' } })
  const closed = await prisma.enquiry.count({ where: { status: 'closed' } })
  return NextResponse.json({ today, new: newCount, processing, closed })
}
