// File: src/app/api/customer/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/customer/bookings
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.phone) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: no phone in session' },
      { status: 401 }
    );
  }

  const { branchId, preferredDate, items, notes } = await req.json();
  if (!branchId || !preferredDate || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { success: false, error: 'branchId, date and items are required' },
      { status: 400 }
    );
  }

  try {
    // find the logged-in customer by phone
    const customer = await prisma.user.findUnique({
      where: { phone: session.user.phone },
    });
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // create bookings
    const created = await Promise.all(
      items.map((it: { serviceId: string; staffId?: string }) =>
        prisma.booking.create({
          data: {
            userId: customer.id,
            branchId,
            serviceId: it.serviceId,
            staffId: it.staffId || null,
            status: 'pending',
            preferredDate: new Date(preferredDate),
            date: null,
            paid: false,
            notes: notes || null,
          },
        })
      )
    );

    return NextResponse.json({ success: true, bookings: created });
  } catch (err: any) {
    console.error('POST /api/customer/bookings error', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
