import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');

    const where: any = { role: { in: ['staff', 'customer_staff', 'admin'] } };
    if (branchId) where.branchId = branchId;

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
