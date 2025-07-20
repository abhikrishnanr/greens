import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PDFDocument, StandardFonts } from 'pdf-lib'

export const runtime = 'nodejs'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: { select: { name: true } },
        branch: { select: { name: true } },
        staff: { select: { name: true } },
        user: { select: { name: true } },
      },
    })
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const pdf = await PDFDocument.create()
    const page = pdf.addPage()
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    let y = page.getHeight() - 40
    const draw = (text: string, size = 12) => {
      page.drawText(text, { x: 50, y, size, font })
      y -= size + 10
    }
    draw('Greens Salon Invoice', 16)
    draw(`Booking ID: ${booking.id}`)
    draw(`Customer: ${booking.user?.name || 'N/A'}`)
    draw(`Service: ${booking.service.name}`)
    if (booking.staff) draw(`Staff: ${booking.staff.name}`)
    draw(`Branch: ${booking.branch.name}`)
    if (booking.date) draw(`Date: ${new Date(booking.date).toLocaleString()}`)
    else if (booking.preferredDate) draw(`Preferred: ${new Date(booking.preferredDate).toLocaleDateString()}`)
    draw(`Status: ${booking.status}`)
    draw(`Paid: ${booking.paid ? 'Yes' : 'No'}`)

    const bytes = await pdf.save()
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${booking.id}.pdf`,
      },
    })
  } catch (err: any) {
    console.error('invoice error', err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
