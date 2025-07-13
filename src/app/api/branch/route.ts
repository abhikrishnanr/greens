import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const branches = await prisma.branch.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ success: true, branches });
}
