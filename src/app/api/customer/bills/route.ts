import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const phone = (session?.user as { phone?: string | null })?.phone
    if (!phone) return Response.json({ bills: [] })

    const billsDb = await prisma.billing.findMany({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    })
    const bills = billsDb.map((b) => ({
      id: b.id,
      date: b.createdAt.toISOString().split('T')[0],
      amount: b.amountAfter,
    }))
    return Response.json({ bills })
  } catch (err) {
    console.error('Error in /api/customer/bills:', err)
    return Response.json({ bills: [] }, { status: 500 })
  }
}
