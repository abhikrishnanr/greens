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
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const bookings = await prisma.booking.findMany({
    where: { staffId, date },
    orderBy: { start: 'asc' },
    include: { items: true },
  })

  const grouped = Object.values(
    bookings.reduce((acc, b) => {
      const key = `${b.phone || ''}|${b.customer || ''}`
      if (!acc[key]) {
        acc[key] = { phone: b.phone || null, customer: b.customer || null, bookings: [] as typeof bookings }
      }
      acc[key].bookings.push(b)
      return acc
    }, {} as Record<string, { phone: string | null; customer: string | null; bookings: typeof bookings }>)
  )

  return Response.json({ success: true, groups: grouped })
}
