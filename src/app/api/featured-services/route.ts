import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const featured = await prisma.featuredService.findMany({
    include: { service: true },
    orderBy: { order: 'asc' },
  })
  const grouped: Record<
    string,
    { id: string; name: string; slug: string; caption: string | null; imageUrl: string | null }[]
  > = {
    female: [],
    male: [],
    children: [],
  }
  featured.forEach((f) => {
    const gender = (f.applicableTo || f.service.applicableTo) as 'female' | 'male' | 'children'
    if (!grouped[gender]) grouped[gender] = []
    grouped[gender].push({
      id: f.service.id,
      name: f.service.name,
      slug: f.service.slug,
      caption: f.service.caption || null,
      imageUrl: f.service.imageUrl || null,
    })
  })
  return NextResponse.json(grouped)
}
