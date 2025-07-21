import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const data = await req.json();
  const booking = await prisma.walkinBooking.update({
    where: { id },
    data: { staffId: data.staffId || null },
    include: { staff: { select: { id: true, name: true } } },
  });
  return NextResponse.json(booking);
}
