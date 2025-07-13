import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { id, active } = await req.json();
  try {
    await prisma.user.update({
      where: { id },
      data: { active },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: 'Could not toggle' }, { status: 500 });
  }
}
