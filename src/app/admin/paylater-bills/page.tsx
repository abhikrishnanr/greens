'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface BillItem { service: string; variant: string; amountAfter: number }
interface Bill { id: string; createdAt: string; paymentMethod: string; items: BillItem[]; totalAfter: number }

export default function PayLaterBillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [method, setMethod] = useState('cash')
  const [date, setDate] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    const res = await fetch('/api/paylater')
    const data = await res.json()
    setBills(data)
  }

  const markPaid = async (id: string) => {
    if (!date) return alert('Select date')
    await fetch('/api/paylater', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, paymentMethod: method, paidAt: date })
    })
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-700">Pay Later Bills</h1>
      <div className="space-y-4">
        {bills.map(b => (
          <div key={b.id} className="border p-4 rounded space-y-1">
            <div className="font-medium">Bill {b.id} - {format(new Date(b.createdAt), 'yyyy-MM-dd')}</div>
            <ul className="text-sm list-disc pl-5">
              {b.items.map((it, i) => (
                <li key={i}>{it.service} - {it.variant} - ₹{it.amountAfter.toFixed(2)}</li>
              ))}
            </ul>
            <div className="font-semibold">Total: ₹{b.totalAfter.toFixed(2)}</div>
            <div className="flex gap-2 items-center mt-2">
              <select value={method} onChange={e => setMethod(e.target.value)} className="border px-2 py-1 rounded">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              <Button onClick={() => markPaid(b.id)}>Mark Paid</Button>
            </div>
          </div>
        ))}
        {bills.length === 0 && <p>No pending bills</p>}
      </div>
    </div>
  )
}
