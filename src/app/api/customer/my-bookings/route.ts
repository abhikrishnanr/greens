import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      include: {
        service: { select: { name: true } },
        branch: { select: { name: true } },
        staff: { select: { name: true } },
        coupon: { select: { code: true } },
      },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Fetch error', error);
    return NextResponse.json({ success: false, error: 'Error fetching bookings' }, { status: 500 });
  }
}
