'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface BookingItem {
  id: string
  bookingId: string
  serviceId: string
  tierId: string
  name: string
  duration: number
  price: number
  staffId: string
  start: string
}
interface Booking {
  id: string
  customer: string | null
  phone: string | null
  date: string
  start: string
  items: BookingItem[]
}
interface Coupon {
  id: string
  code: string
  discountType: string
  discountValue: number
}

interface ServiceInfo {
  item: BookingItem
  category: string
  service: string
  variant: string
  phone: string | null
  scheduledAt: string
}

export default function BillingPage() {
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [services, setServices] = useState<ServiceInfo[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [voucher, setVoucher] = useState('')
  const [billingName, setBillingName] = useState('')
  const [billingAddress, setBillingAddress] = useState('')

  useEffect(() => {
    fetch(`/api/bookings?date=${date}`)
      .then(res => res.json())
      .then((bs: Booking[]) => loadServices(bs))
  }, [date])

  const loadServices = async (bs: Booking[]) => {
    const result: ServiceInfo[] = []
    for (const b of bs) {
      for (const it of b.items) {
        const tierRes = await fetch(`/api/admin/service-tiers/${it.tierId}`)
        let variant = it.name
        let service = ''
        let category = ''
        if (tierRes.ok) {
          const t = await tierRes.json()
          variant = t.name
          service = t.service.name
          category = t.service.category.name
        }
        result.push({
          item: it,
          category,
          service,
          variant,
          phone: b.phone,
          scheduledAt: `${b.date}T${it.start}:00`,
        })
      }
    }
    setServices(result)
  }

  const groupedByPhone: { [key: string]: ServiceInfo[] } = {}
  services.forEach(s => {
    const key = s.phone || 'unknown'
    groupedByPhone[key] = groupedByPhone[key] || []
    groupedByPhone[key].push(s)
  })
  const colors = ['#fee2e2', '#dbeafe', '#d1fae5', '#fef3c7', '#e9d5ff']
  const totalBefore = selected.reduce((acc, id) => {
    const s = services.find(s => s.item.id === id)
    return acc + (s?.item.price || 0)
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
      .map(id => services.find(s => s.item.id === id)!)
      .map(s => ({
        category: s.category,
        service: s.service,
        variant: s.variant,
        amountBefore: s.item.price,
        amountAfter: s.item.price * (finalTotal / totalBefore || 1),
        scheduledAt: s.scheduledAt,
      }))
    await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        billingName: billingName || null,
        billingAddress: billingAddress || null,
        phone: svcData[0]?.phone || null,
        voucherCode: coupon?.code || null,
        services: svcData,
      }),
    })
    window.print()
    setSelected([])
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-700">Billing</h1>
      <div className="flex gap-2 items-center">
        <Label>Date</Label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      {Object.entries(groupedByPhone).map(([phone, list], idx) => (
        <Card key={phone} style={{ backgroundColor: colors[idx % colors.length] }}>
          <CardHeader>
            <CardTitle>{phone === 'unknown' ? 'No Phone' : phone}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {list.map(s => (
              <label key={s.item.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(s.item.id)}
                  onChange={e => {
                    setSelected(sel =>
                      e.target.checked
                        ? [...sel, s.item.id]
                        : sel.filter(i => i !== s.item.id)
                    )
                  }}
                />
                <span>{s.service} - {s.variant} at {s.item.start}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      ))}

      {selected.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-5 text-sm">
              {selected.map(id => {
                const s = services.find(s => s.item.id === id)!
                return (
                  <li key={id}>{s.service} - {s.variant} - ₹{s.item.price}</li>
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
  )
}
