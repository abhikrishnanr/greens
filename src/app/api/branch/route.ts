import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const branches = await prisma.branch.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ success: true, branches });
}

export async function POST(req: Request) {
  const data = await req.json();
  const branch = await prisma.branch.create({ data });
  return NextResponse.json({ success: true, branch });
}

export async function PUT(req: Request) {
  const data = await req.json();
  const { id, ...rest } = data;
  const branch = await prisma.branch.update({ where: { id }, data: rest });
  return NextResponse.json({ success: true, branch });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.branch.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
