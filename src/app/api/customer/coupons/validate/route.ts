import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { code, total } = Object.fromEntries(new URL(req.url).searchParams);
  if (!code || !total) {
    return NextResponse.json({ success: false, error: 'code & total required' }, { status: 400 });
  }
  const now = new Date();
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (
    !coupon ||
    !coupon.isActive ||
    coupon.startDate > now ||
    coupon.endDate < now ||
    (coupon.minAmount && parseFloat(total) < coupon.minAmount) ||
    (coupon.maxRedemptions && coupon.timesUsed >= coupon.maxRedemptions)
  ) {
    return NextResponse.json({ success: false, error: 'Invalid or expired coupon' });
  }
  return NextResponse.json({ success: true, coupon });
}
