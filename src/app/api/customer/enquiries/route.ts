import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const phone = (session?.user as { phone?: string | null })?.phone
    const userId = (session?.user as { id?: string })?.id
    if (!phone && !userId) return Response.json({ enquiries: [] })

    const enquiriesDb = await prisma.enquiry.findMany({
      where: {
        OR: [
          phone ? { phone } : undefined,
          userId ? { customerId: userId } : undefined,
        ].filter(Boolean) as any,
      },
      orderBy: { createdAt: 'desc' },
    })

    const enquiries = enquiriesDb.map((e) => ({
      id: e.id,
      enquiry: e.enquiry || '',
      status: e.status,
      remark: e.remark || '',
    }))

    return Response.json({ enquiries })
  } catch (err) {
    console.error('Error in /api/customer/enquiries:', err)
    return Response.json({ enquiries: [] }, { status: 500 })
  }
}
