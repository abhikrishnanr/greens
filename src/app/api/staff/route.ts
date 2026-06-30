import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');
    // When called from the appointment scheduling picker, only return staff
    // flagged to appear there (and not removed).
    const scheduling =
      searchParams.get('scheduling') === '1' || searchParams.get('scheduling') === 'true';

    const where: any = { role: { in: ['staff', 'customer_staff', 'admin'] } };
    if (branchId) where.branchId = branchId;
    if (scheduling) {
      where.listInScheduling = true;
      where.removed = false;
    }

    const staff = await prisma.user.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return Response.json({ success: true, staff });
  } catch (err) {
    console.error('🔥 Error in /api/staff:', err);
    return Response.json({ success: false, error: 'Failed to load staff' }, { status: 500 });
  }
}
