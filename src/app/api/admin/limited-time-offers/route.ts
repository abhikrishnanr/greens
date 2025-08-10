import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const offers = await prisma.offer.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(offers)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const offer = await prisma.offer.create({
    data: {
      title: data.title,
      subTitle: data.subTitle || null,
      category: data.category || null,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
    },
  })
  return NextResponse.json(offer)
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  if (!data.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const offer = await prisma.offer.update({
    where: { id: data.id },
    data: {
      title: data.title,
      subTitle: data.subTitle || null,
      category: data.category || null,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
    },
  })
  return NextResponse.json(offer)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await prisma.offer.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
