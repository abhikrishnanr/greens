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

  const startDate = new Date(start)
  const endDate = new Date(end)
  endDate.setHours(23, 59, 59, 999)

  const items = await prisma.bookingItem.findMany({
    where: {
      staffId,
      booking: { date: { gte: startDate, lte: endDate } },
    },
    include: { booking: true, service: true },
    orderBy: { start: 'asc' },
  })

  const data = items.map((i) => ({
    date: i.booking.date,
    service: i.name,
    category: i.service?.costCategory || null,
    price: i.price,
  }))

  return Response.json({ success: true, items: data })
}
