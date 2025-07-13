import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate:   { gte: now },
        // if you want to enforce maxRedemptions globally:
        OR: [
          { maxRedemptions: null },
          { timesUsed: { lt: prisma.coupon.fields.maxRedemptions } }
        ]
      },
    });
    return NextResponse.json({ success: true, coupons });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
