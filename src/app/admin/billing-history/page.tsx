'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader as DHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

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
    `Date: ${format(new Date(b.createdAt), 'yyyy-MM-dd HH:mm')}\n` +
    `Phones: ${b.phones.join(', ')}\n` +
    `Name: ${b.billingName || ''}\n` +
    `Voucher: ${b.voucherCode || 'N/A'}\n` +
    b.items
      .map(
        it => `${it.service} - ${it.variant} - ₹${it.amountAfter.toFixed(2)}`,
      )
      .join('\n') +
    `\nActual: ₹${b.totalBefore.toFixed(2)}\nNet: ₹${b.totalAfter.toFixed(2)}`

  const printBill = (b: Bill) => {
    const win = window.open('', 'print', 'height=600,width=300')
    if (!win) return
    win.document.write(`<pre>${billText(b)}</pre>`)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  const downloadPdf = async (b: Bill) => {
    const { PDFDocument } = await import('pdf-lib')
    const pdf = await PDFDocument.create()
    const page = pdf.addPage([300, 300])
    page.drawText(billText(b), { x: 20, y: 280, size: 12 })
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
          <DialogContent onClick={e => e.stopPropagation()}>
            <DHeader>
              <DialogTitle>Billing Details</DialogTitle>
            </DHeader>
            <div className="p-4 space-y-1 text-sm">
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
              <div><strong>Amount After:</strong> ₹{viewBill.totalAfter.toFixed(2)}</div>
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
