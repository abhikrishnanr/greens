import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
  const dateStr = new URL(req.url).searchParams.get('date');
  if (!dateStr) return NextResponse.json([]);
  const date = new Date(dateStr);
  const bookings = await prisma.walkinBooking.findMany({
    where: {
      startTime: { gte: startOfDay(date), lt: endOfDay(date) },
    },
    include: { staff: { select: { id: true, name: true } } },
    orderBy: { startTime: 'asc' },
  });
  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const services = data.services || [];
  const duration = services.reduce((t: number, s: any) => t + (s.duration || 0), 0);
  const totalAmount = services.reduce((t: number, s: any) => t + (s.price || 0), 0);
  const booking = await prisma.walkinBooking.create({
    data: {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      services: JSON.stringify(services),
      totalAmount,
      startTime: new Date(data.startTime),
      duration,
      staffId: data.staffId || null,
    },
    include: { staff: { select: { id: true, name: true } } },
  });
  return NextResponse.json(booking);
}
