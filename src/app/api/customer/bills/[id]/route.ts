import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const phone = (session?.user as { phone?: string | null })?.phone
    if (!phone) return Response.json({ bill: null }, { status: 401 })

    const bill = await prisma.billing.findFirst({
      where: { id: params.id, phone },
    })
    if (!bill) return Response.json({ bill: null }, { status: 404 })

    return Response.json({ bill })
  } catch (err) {
    console.error('Error in /api/customer/bills/[id]:', err)
    return Response.json({ bill: null }, { status: 500 })
  }
}
