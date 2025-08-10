import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  const phone = (session?.user as { phone?: string | null })?.phone
  if (!phone) return Response.json({ staff: false, customer: false })

  const user = await prisma.user.findUnique({ where: { phone }, select: { role: true } })
  const staff = user?.role !== 'customer'

  const [billing, booking] = await Promise.all([
    prisma.billing.findFirst({ where: { phone } }),
    prisma.booking.findFirst({ where: { phone } }),
  ])
  const customer = user?.role === 'customer' || !!billing || !!booking

  return Response.json({ staff, customer })
}
