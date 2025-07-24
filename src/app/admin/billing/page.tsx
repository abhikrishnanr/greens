'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface Coupon {
  id: string
  code: string
  discountType: string
  discountValue: number
}

interface ServiceInfo {
  id: string
  phone: string | null
  customer: string | null
  category: string
  service: string
  variant: string
  start: string
  price: number
  scheduledAt: string
}

export default function BillingPage() {
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [services, setServices] = useState<ServiceInfo[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [voucher, setVoucher] = useState('')
  const [billingName, setBillingName] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const router = useRouter()


  useEffect(() => {
    fetch(`/api/billing-services?date=${date}`)
      .then(res => res.json())
      .then((data: ServiceInfo[]) => setServices(data))
  }, [date])

  const filtered = services.filter(s =>
    !search ||
    s.service.toLowerCase().includes(search.toLowerCase()) ||
    s.variant.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').includes(search) ||
    (s.customer || '').toLowerCase().includes(search.toLowerCase())
  )
  const groupedByPhone: { [key: string]: ServiceInfo[] } = {}
  filtered.forEach(s => {
    const key = s.phone || 'unknown'
    groupedByPhone[key] = groupedByPhone[key] || []
    groupedByPhone[key].push(s)
  })
  const colors = ['#fee2e2', '#dbeafe', '#d1fae5', '#fef3c7', '#e9d5ff']
  const totalBefore = selected.reduce((acc, id) => {
    const s = services.find(s => s.id === id)
    return acc + (s?.price || 0)
  }, 0)
  const discount = coupon
    ? coupon.discountType === 'fixed'
      ? coupon.discountValue
      : (coupon.discountValue / 100) * totalBefore
    : 0
  const finalTotal = totalBefore - discount

  const applyVoucher = async () => {
    if (!voucher) return
    const res = await fetch(`/api/coupon?code=${voucher}`)
    if (res.ok) {
      const c = await res.json()
      setCoupon(c)
    } else {
      setCoupon(null)
      alert('Invalid voucher code')
    }
  }

  const confirmBilling = async () => {
    const svcData = selected
      .map(id => services.find(s => s.id === id)!)
      .map(s => ({
        category: s.category,
        service: s.service,
        variant: s.variant,
        amountBefore: s.price,
        amountAfter: s.price * (finalTotal / totalBefore || 1),
        scheduledAt: s.scheduledAt,
      }))
    await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        billingName: billingName || null,
        billingAddress: billingAddress || null,
        phone: services.find(s => s.id === selected[0])?.phone || null,
        voucherCode: coupon?.code || null,
        services: svcData,
      }),
    })
    setSelected([])
    router.push(`/admin/billing-history?date=${date}`)

  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-700">Billing</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <Input
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
          </div>
          {Object.entries(groupedByPhone).map(([phone, list], idx) => (
            <Card key={phone} style={{ backgroundColor: colors[idx % colors.length] }}>
              <CardHeader>
                <CardTitle>
                  {phone === 'unknown' ? 'No Phone' : phone}
                  {list[0].customer ? ` - ${list[0].customer}` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {list.map(s => (
                  <label key={s.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(s.id)}
                      onChange={e => {
                        setSelected(sel =>
                          e.target.checked
                            ? [...sel, s.id]
                            : sel.filter(i => i !== s.id)
                        )
                      }}
                    />
                    <span>{s.service} - {s.variant} at {s.start}</span>
                  </label>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {selected.length > 0 && (
            <Card className="md:sticky md:top-4">
              <CardHeader>
                <CardTitle>Billing Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc pl-5 text-sm">
                  {selected.map(id => {
                    const s = services.find(s => s.id === id)!
                    return (
                      <li key={id}>{s.service} - {s.variant} - ₹{s.price}</li>
                    )
                  })}
                </ul>
                <p>Total: ₹{totalBefore.toFixed(2)}</p>
                {coupon && (
                  <p>Discount: -₹{discount.toFixed(2)} ({coupon.code})</p>
                )}
                <p className="font-bold">Final: ₹{finalTotal.toFixed(2)}</p>
                <div className="grid gap-2">
                  <Input placeholder="Billing Name" value={billingName} onChange={e => setBillingName(e.target.value)} />
                  <Input placeholder="Billing Address" value={billingAddress} onChange={e => setBillingAddress(e.target.value)} />
                  <div className="flex gap-2 items-center">
                    <Input placeholder="Voucher Code" value={voucher} onChange={e => setVoucher(e.target.value)} />
                    <Button type="button" onClick={applyVoucher}>Apply</Button>
                  </div>
                  <Button type="button" onClick={confirmBilling}>Confirm Billing</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
