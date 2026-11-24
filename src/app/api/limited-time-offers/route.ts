import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { HOMEPAGE_CACHE_HEADERS } from '@/lib/http-cache'

export async function GET() {
  const offers = await prisma.offer.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(offers, { headers: HOMEPAGE_CACHE_HEADERS })
}
