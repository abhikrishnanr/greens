import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const staffId = session?.user?.id
  if (!staffId) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking || booking.staffId !== staffId) {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const { serviceId, tierId, name, price, duration } = await req.json()
  if (
    !serviceId ||
    !tierId ||
    !name ||
    typeof price !== 'number' ||
    typeof duration !== 'number'
  ) {
    return Response.json({ success: false, error: 'Missing fields' }, { status: 400 })
  }

  const start = new Date()
  const time = start.toTimeString().slice(0, 5)

  await prisma.bookingItem.create({
    data: {
      bookingId: id,
      serviceId,
      tierId,
      name,
      price,
      duration,
      staffId,
      start: time,
      status: 'pending',
    },
  })

  return Response.json({ success: true })
}
