import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const staffId = session?.user?.id
  if (!staffId) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  if (!start || !end) {
    return Response.json({ success: false, error: 'Missing date range' }, { status: 400 })
  }

  const items = await prisma.bookingItem.findMany({
    where: {
      staffId,
      status: 'completed',
      booking: { date: { gte: start, lte: end } },
    },
    include: { booking: true },
    orderBy: { start: 'asc' },
  })

  const serviceIds = Array.from(new Set(items.map((i) => i.serviceId)))
  const [legacyServices, newServices] = await Promise.all([
    prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, category: { select: { name: true } } },
    }),
    prisma.serviceNew.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, category: { select: { name: true } } },
    }),
  ])
  const serviceMap = new Map(
    [...legacyServices, ...newServices].map((s) => [s.id, s.category?.name || null])
  )

  const data = items.map((i) => ({
    dateTime: `${i.booking.date} ${i.start}`,
    service: i.name,
    category: serviceMap.get(i.serviceId) || null,
  }))

  return Response.json({ success: true, items: data })
}
