// src/app/api/availability/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date      = searchParams.get('date');
  const serviceId = searchParams.get('serviceId');
  const staffId   = searchParams.get('staffId');

  if (!date || !serviceId) {
    return NextResponse.json(
      { success: false, error: 'Missing date or serviceId' },
      { status: 400 }
    );
  }

  // 1. Fetch the service duration
  const svc = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!svc) {
    return NextResponse.json(
      { success: false, error: 'Service not found' },
      { status: 404 }
    );
  }

  // 2. Fetch all bookings on that date for this service & (optional) staff
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd   = new Date(`${date}T23:59:59`);
  const where: any = {
    date: { gte: dayStart, lte: dayEnd }
  };
  if (staffId) where.staffId = staffId;

  const existing = await prisma.booking.findMany({
    where,
    select: { date: true, service: { select: { duration: true } } }
  });

  // 3. Build occupied time ranges
  const occupied: [number, number][] = existing.map(b => {
    const start = b.date.getHours() * 60 + b.date.getMinutes();
    const end   = start + b.service.duration;
    return [start, end];
  });

  // 4. Generate all slots and filter free ones
  const slots: string[] = [];
  for (let h = 9; h < 18; h++) {
    const startMin = h * 60;
    const endMin   = startMin + svc.duration;
    // if the service spans past the working day, skip
    if (endMin > 18 * 60) continue;
    // check overlap
    const overlaps = occupied.some(([o1, o2]) =>
      !(endMin <= o1 || startMin >= o2)
    );
    slots.push(
      `${String(h).padStart(2, '0')}:00`
    );
    // if overlap, mark as unavailable
    // we'll send both lists below
  }

  // 5. Return full list + occupied set
  const occupiedSlots = new Set(
    occupied.map(([m]) => `${String(Math.floor(m/60)).padStart(2,'0')}:00`)
  );

  return NextResponse.json({
    success: true,
    slots: slots.map(s => ({
      time: s,
      available: !occupiedSlots.has(s)
    }))
  });
}
