import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tabs = await prisma.heroTab.findMany({
    orderBy: { order: 'asc' },
    include: { variants: true },
  })
  const result = tabs.map(t => ({
    ...t,
    variantIds: t.variants.map(v => v.serviceTierId),
  }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const tab = await prisma.heroTab.create({
    data: {
      name: data.name,
      iconUrl: data.iconUrl || null,
      backgroundUrl: data.backgroundUrl || null,
      videoSrc: data.videoSrc || null,
      heroTitle: data.heroTitle,
      heroDescription: data.heroDescription || null,
      buttonLabel: data.buttonLabel || null,
      buttonLink: data.buttonLink || null,
      order: data.order ?? 0,
      variants: {
        create: Array.isArray(data.variantIds)
          ? data.variantIds.map((id: string) => ({ serviceTierId: id }))
          : [],
      },
    },
  })
  return NextResponse.json(tab)
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  if (!data.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.heroTabVariant.deleteMany({ where: { heroTabId: data.id } })

  const tab = await prisma.heroTab.update({
    where: { id: data.id },
    data: {
      name: data.name,
      iconUrl: data.iconUrl || null,
      backgroundUrl: data.backgroundUrl || null,
      videoSrc: data.videoSrc || null,
      heroTitle: data.heroTitle,
      heroDescription: data.heroDescription || null,
      buttonLabel: data.buttonLabel || null,
      buttonLink: data.buttonLink || null,
      order: data.order ?? 0,
      variants: {
        create: Array.isArray(data.variantIds)
          ? data.variantIds.map((id: string) => ({ serviceTierId: id }))
          : [],
      },
    },
  })
  return NextResponse.json(tab)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await prisma.heroTabVariant.deleteMany({ where: { heroTabId: id } })
  await prisma.heroTab.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
