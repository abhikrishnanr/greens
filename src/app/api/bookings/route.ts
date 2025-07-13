import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ── GET /api/bookings?userId=…&status=… ───────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const status = searchParams.get('status'); // optional

  const where: any = {};
  if (userId) where.userId = userId;
  if (status) where.status = status;

  try {
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: { select: { id: true, name: true, duration: true } },
        staff:   { select: { id: true, name: true } },
        branch:  { select: { id: true, name: true } },
        user:    { select: { id: true, name: true } },
      },
      orderBy: { date: 'asc' }
    });
    return NextResponse.json({ success: true, bookings });
  } catch (err: any) {
    console.error('GET /api/bookings error', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ── POST /api/bookings ────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { date, customerName, customerPhone, customerGender, items, branchId, coupon } = await req.json();

    let customer;

    // CASE 1: Self-booking (logged-in customer)
    if (session?.user?.phone && !customerPhone) {
      customer = await prisma.user.findUnique({
        where: { phone: session.user.phone },
      });

      if (!customer) {
        return NextResponse.json({ success: false, error: 'Logged-in customer not found' }, { status: 404 });
      }

    // CASE 2: Staff-side or manual entry (phone provided)
    } else if (customerPhone && customerName) {
      // Validate 10 digit phone number
      if (!/^\d{10}$/.test(customerPhone)) {
        return NextResponse.json({ success: false, error: "A valid 10 digit mobile is required" }, { status: 400 });
      }

      // Try to find user by phone
      customer = await prisma.user.findUnique({
        where: { phone: customerPhone }
      });

      if (!customer) {
        // No user: create new one with gender
        customer = await prisma.user.create({
          data: {
            name: customerName,
            phone: customerPhone,
            gender: customerGender || null,
            role: 'customer',
            active: true,
          }
        });
      } else {
        // Optionally update latest name/gender
        await prisma.user.update({
          where: { id: customer.id },
          data: { name: customerName, gender: customerGender || null }
        });
      }
    } else {
      return NextResponse.json({ success: false, error: 'Missing customer info' }, { status: 400 });
    }

    // Create booking(s) for each item
    const created = await Promise.all(
      items.map((it: { serviceId: string; staffId?: string; slot: string; date?: string }) =>
        prisma.booking.create({
          data: {
            userId: customer.id,
            serviceId: it.serviceId,
            branchId,
            staffId: it.staffId || null,
            status: 'pending',
            date: it.date 
              ? new Date(`${it.date}T${it.slot}:00`) 
              : new Date(`${date}T${it.slot}:00`),
            paid: false,
            coupon: coupon || null,
          },
        })
      )
    );

    return NextResponse.json({ success: true, bookings: created });

  } catch (err: any) {
    console.error('POST /api/bookings error', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Could not save booking' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...data } = await req.json();
    const booking = await prisma.booking.update({
      where: { id },
      data,
      include: { service: true, staff: true, branch: true, user: true },
    });
    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    console.error('PUT /api/bookings error', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/bookings error', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
