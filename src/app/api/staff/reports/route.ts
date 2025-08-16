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
    include: { booking: true, service: true },
    orderBy: { start: 'asc' },
  })

  const data = items.map((i) => ({
    dateTime: `${i.booking.date} ${i.start}`,
    service: i.name,
    category: i.service?.costCategory || null,
  }))

  return Response.json({ success: true, items: data })
}
