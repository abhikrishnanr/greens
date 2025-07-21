import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { staffId, status } = await req.json()
  const booking = await prisma.booking.update({
    where: { id: params.id },
    data: { staffId, status },
  })
  return NextResponse.json({ success: true, booking })
}
