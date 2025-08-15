import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const staffId = session?.user?.id
  if (!staffId) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const booking = await prisma.booking.findUnique({ where: { id: params.id } })
  if (!booking || booking.staffId !== staffId) {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const data: any = {}
  if (body.customer) data.customer = body.customer
  if (body.phone) data.phone = body.phone
  if (!data.customer && !data.phone) {
    return Response.json({ success: false, error: 'Nothing to update' }, { status: 400 })
  }

  await prisma.booking.update({ where: { id: params.id }, data })
  return Response.json({ success: true })
}
