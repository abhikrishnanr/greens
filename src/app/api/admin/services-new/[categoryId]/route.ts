import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { categoryId: string } }) {
  const { categoryId } = params
  const services = await prisma.serviceNew.findMany({
    where: { categoryId },
    include: { tiers: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(services)
}

export async function POST(req: Request, { params }: { params: { categoryId: string } }) {
  const { categoryId } = params
  const data = await req.json()
  const service = await prisma.serviceNew.create({
    data: {
      categoryId,
      name: data.name,
      caption: data.caption || null,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
    },
  })
  return NextResponse.json(service)
}

export async function PUT(req: Request, { params }: { params: { categoryId: string } }) {
  const newOrder: { id: string; order: number }[] = await req.json()
  for (const s of newOrder) {
    await prisma.serviceNew.update({ where: { id: s.id }, data: { order: s.order } })
  }
  return NextResponse.json({ success: true })
}
