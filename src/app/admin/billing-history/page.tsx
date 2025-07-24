'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader as DHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const SALON_INFO = {
  name: 'Greens Beauty Salon',
  logo: '/logo.png',
  address: 'TC 45/215, Kunjalumood Junction, Karamana PO, Trivandrum',
  phone: '+91 8891 467678',
  email: 'greensalon@gmail.com',
  website: 'https://greensbeautysalon.com',
}

interface BillItem {
  phone: string | null
  category: string
  service: string
  variant: string
  amountBefore: number
  amountAfter: number
  scheduledAt: string
}

interface Bill {
  id: string
  phones: string[]
  billingName: string | null
  billingAddress: string | null
  voucherCode: string | null
  paymentMethod: string
  paidAt: string | null
  totalBefore: number
  totalAfter: number
  createdAt: string
  items: BillItem[]
}

export default function BillingHistoryPage() {
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [bills, setBills] = useState<Bill[]>([])
  const [viewBill, setViewBill] = useState<Bill | null>(null)

  useEffect(() => { loadBills() }, [date])

  const loadBills = async () => {
    const res = await fetch(`/api/billing?date=${date}`)
    if (res.ok) {
      const data: Bill[] = await res.json()
      setBills(data)
    } else {
      setBills([])
    }
  }

  const billText = (b: Bill) =>
    `${SALON_INFO.name}\n${SALON_INFO.address}\n${SALON_INFO.phone} | ${SALON_INFO.email}\n` +
    '------------------------------\n' +
    `Bill ID: ${b.id}\n` +
    `Date: ${format(new Date(b.createdAt), 'yyyy-MM-dd HH:mm')}\n` +
    `Phones: ${b.phones.join(', ')}\n` +
    `Name: ${b.billingName || ''}\n` +
    `Voucher: ${b.voucherCode || 'N/A'}\n` +
    `Payment: ${b.paymentMethod}\n` +
    b.items
      .map(
        it => `${it.service} - ${it.variant} - ₹${it.amountAfter.toFixed(2)}`,
      )
      .join('\n') +
    '\n------------------------------\n' +
    `Actual: ₹${b.totalBefore.toFixed(2)}\nGST(18%): ₹${(b.totalAfter*0.18).toFixed(2)}\nNet: ₹${b.totalAfter.toFixed(2)}\n${SALON_INFO.website}`

  const printBill = (b: Bill) => {
    const win = window.open('', 'print', 'height=600,width=300')
    if (!win) return
    win.document.write(`
      <div style="font-family: monospace; padding: 10px;">
        <img src="${SALON_INFO.logo}" style="height:50px;margin:0 auto 10px;display:block" />
        <pre>${billText(b)}</pre>
      </div>
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  const downloadPdf = async (b: Bill) => {
    const { PDFDocument, rgb } = await import('pdf-lib')
    const fontkit = (await import('@pdf-lib/fontkit')).default
    const fontBytes = await fetch('/fonts/NotoSans-Regular.ttf').then(res => res.arrayBuffer())
    const logoBytes = await fetch(SALON_INFO.logo).then(res => res.arrayBuffer())

    const pdf = await PDFDocument.create()
    pdf.registerFontkit(fontkit)
    const font = await pdf.embedFont(fontBytes)
    const png = await pdf.embedPng(logoBytes)
    const pageWidth = 595
    const pageHeight = 842
    const page = pdf.addPage([pageWidth, pageHeight])
    const logoDims = png.scale(0.5)
    page.drawImage(png, { x: (pageWidth - logoDims.width) / 2, y: pageHeight - logoDims.height - 40, ...logoDims })
    let y = pageHeight - logoDims.height - 60
    page.drawText(`Bill ID: ${b.id}`, { x: 40, y, size: 12, font })
    y -= 16
    page.drawText(`Date: ${format(new Date(b.createdAt), 'yyyy-MM-dd HH:mm')}`, { x: 40, y, size: 12, font })
    y -= 16
    page.drawText(`Phones: ${b.phones.join(', ')}`, { x: 40, y, size: 12, font })
    y -= 16
    page.drawText(`Name: ${b.billingName || ''}`, { x: 40, y, size: 12, font })
    y -= 16
    page.drawText(`Voucher: ${b.voucherCode || 'N/A'}`, { x: 40, y, size: 12, font })
    y -= 16
    page.drawText(`Payment: ${b.paymentMethod}`, { x: 40, y, size: 12, font })
    y -= 24
    page.drawLine({ start: { x: 40, y }, end: { x: pageWidth - 40, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) })
    y -= 16
    b.items.forEach(it => {
      page.drawText(`${it.service} - ${it.variant} - ₹${it.amountAfter.toFixed(2)}`, { x: 40, y, size: 12, font })
      y -= 16
    })
    y -= 8
    page.drawLine({ start: { x: 40, y }, end: { x: pageWidth - 40, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) })
    y -= 16
    page.drawText(`Actual: ₹${b.totalBefore.toFixed(2)}`, { x: 40, y, size: 12, font })
    y -= 16
    page.drawText(`GST(18%): ₹${(b.totalAfter*0.18).toFixed(2)}`, { x: 40, y, size: 12, font })
    y -= 16
    page.drawText(`Net: ₹${b.totalAfter.toFixed(2)}`, { x: 40, y, size: 12, font })
    const blob = new Blob([await pdf.save()], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bill-${b.id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-700">Billing History</h1>
      <div className="flex items-center gap-2">
        <Label>Date</Label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ₹{bills.reduce((s, b) => s + b.totalAfter, 0).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>GST (18%)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ₹{(bills.reduce((s, b) => s + b.totalAfter, 0) * 0.18).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Services</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {bills.reduce((s, b) => s + b.items.length, 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bills Generated</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {bills.length}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Phone/Name</TableHead>
              <TableHead>Voucher</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Service</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map(b => (
                <TableRow key={b.id}>
                  <TableCell>{format(new Date(b.createdAt), 'HH:mm')}</TableCell>
                  <TableCell>{b.phones.join(', ')}{b.billingName ? ` - ${b.billingName}` : ''}</TableCell>
                  <TableCell>{b.voucherCode || '-'}</TableCell>
                  <TableCell>{b.paymentMethod}</TableCell>
                  <TableCell>
                    {b.items.length === 1
                      ? `${b.items[0].service} - ${b.items[0].variant}`
                      : `${b.items.length} services`}
                  </TableCell>
                  <TableCell>₹{b.totalBefore.toFixed(2)}</TableCell>
                  <TableCell>₹{b.totalAfter.toFixed(2)}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" onClick={() => setViewBill(b)}>View</Button>
                    <Button size="sm" onClick={() => printBill(b)}>Print</Button>
                    <Button size="sm" onClick={() => downloadPdf(b)}>PDF</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={!!viewBill} onOpenChange={open => !open && setViewBill(null)}>
        {viewBill && (
          <DialogContent className="text-black" onClick={e => e.stopPropagation()}>
            <img src={SALON_INFO.logo} className="h-12 mx-auto my-4" />
            <DHeader>
              <DialogTitle>Billing Details</DialogTitle>
            </DHeader>
            <div className="p-4 space-y-1 text-sm">
              <div><strong>Bill ID:</strong> {viewBill.id}</div>
              <div><strong>Date:</strong> {format(new Date(viewBill.createdAt), 'yyyy-MM-dd HH:mm')}</div>
              <div><strong>Phones:</strong> {viewBill.phones.join(', ')}</div>
              <div><strong>Name:</strong> {viewBill.billingName || ''}</div>
              <div><strong>Address:</strong> {viewBill.billingAddress || ''}</div>
              <ul className="list-disc pl-5">
                {viewBill.items.map((it, idx) => (
                  <li key={idx}>{it.service} - {it.variant} - ₹{it.amountAfter.toFixed(2)}</li>
                ))}
              </ul>
              <div><strong>Amount Before:</strong> ₹{viewBill.totalBefore.toFixed(2)}</div>
              <div><strong>Voucher:</strong> {viewBill.voucherCode || 'N/A'}</div>
              <div><strong>Payment:</strong> {viewBill.paymentMethod}</div>
              <div><strong>GST (18%):</strong> ₹{(viewBill.totalAfter*0.18).toFixed(2)}</div>
              <div><strong>Amount After:</strong> ₹{viewBill.totalAfter.toFixed(2)}</div>
              <div>{SALON_INFO.address}</div>
              <div>{SALON_INFO.phone} | {SALON_INFO.email}</div>
              <div>{SALON_INFO.website}</div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setViewBill(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
