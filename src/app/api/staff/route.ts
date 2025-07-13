import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');

    if (!branchId) {
      return Response.json({ success: false, error: 'Missing branchId' }, { status: 400 });
    }

    const staff = await prisma.user.findMany({
      where: {
        role: 'STAFF',
        branchId: branchId,
        removed: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        designation: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return Response.json({ success: true, staff });

  } catch (err) {
    console.error('🔥 Error in /api/staff:', err);
    return Response.json({ success: false, error: 'Failed to load staff' }, { status: 500 });
  }
}
