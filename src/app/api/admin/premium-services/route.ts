import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const plans = await prisma.premiumService.findMany({
    include: { items: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(plans)
}

export async function POST(req: Request) {
  const data = await req.json()
  const created = await prisma.premiumService.create({
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      order: data.order ?? 0,
      items: {
        create: (data.items || []).map(
          (
            item: { name: string; currentPrice: number; offerPrice?: number },
            idx: number,
          ) => ({
            name: item.name,
            currentPrice: item.currentPrice,
            offerPrice: item.offerPrice,
            order: idx,
          }),
        ),
      },
    },
    include: { items: { orderBy: { order: 'asc' } } },
  })
  return NextResponse.json(created)
}

export async function PUT(req: Request) {
  const data = await req.json()
  const updated = await prisma.premiumService.update({
    where: { id: data.id },
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      order: data.order ?? 0,
      items: {
        deleteMany: {},
        create: (data.items || []).map(
          (
            item: { name: string; currentPrice: number; offerPrice?: number },
            idx: number,
          ) => ({
            name: item.name,
            currentPrice: item.currentPrice,
            offerPrice: item.offerPrice,
            order: idx,
          }),
        ),
      },
    },
    include: { items: { orderBy: { order: 'asc' } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  await prisma.premiumService.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
