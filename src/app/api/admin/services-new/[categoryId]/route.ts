import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params
  const services = await prisma.serviceNew.findMany({
    where: { categoryId },
    include: { tiers: true },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  })

  const response = services.map((svc) => ({
    id: svc.id,
    name: svc.name,
    caption: svc.caption,
    description: svc.description,
    imageUrl: svc.imageUrl,
    applicableTo: svc.applicableTo,
    order: svc.order,
    variants: svc.tiers.map((t) => ({
      id: t.id,
      name: t.name,
      duration: t.duration,
    })),
  }))

  return NextResponse.json(response)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params
  const data = await req.json()
  const service = await prisma.serviceNew.create({
    data: {
      categoryId,
      name: data.name,
      caption: data.caption || null,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      applicableTo: data.applicableTo,
      order: data.order ?? 0,
    },
  })
  return NextResponse.json(service)
}

export async function PUT(req: Request) {
  const newOrder: { id: string; order: number }[] = await req.json()
  for (const s of newOrder) {
    await prisma.serviceNew.update({ where: { id: s.id }, data: { order: s.order } })
  }
  return NextResponse.json({ success: true })
}
