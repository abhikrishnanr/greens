import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone required' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({ success: true, exists: false });
    }
    return NextResponse.json({ success: true, exists: true, user });
  } catch (err: any) {
    console.error('Check staff error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
