'use client'

import { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BookingItem {
  id: string
  name: string
  price: number
}

interface Booking {
  id: string
  start: string
  status: string
  customer: string | null
  phone: string | null
  items: BookingItem[]
}

interface Group {
  phone: string | null
  customer: string | null
  bookings: Booking[]
}

interface Variant {
  id: string
  name: string
  duration?: number | null
  currentPrice?: { actualPrice: number; offerPrice?: number | null } | null
}

interface ServiceOption {
  id: string
  name: string
  categoryId: string
  categoryName: string
  variants: Variant[]
}

interface ServiceSelectOption {
  value: string
  label: string
}

export default function AssignmentsPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [groups, setGroups] = useState<Group[]>([])
  const [services, setServices] = useState<ServiceOption[]>([])
  const [selectedService, setSelectedService] = useState<Record<string, string>>({})
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({})
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, cancelled: 0 })

  const load = async () => {
    const res = await fetch(`/api/staff/assignments?date=${date}`)
    const data = await res.json()
    if (data.success) {
      setGroups(data.groups)
      const all = data.groups.flatMap((g: Group) => g.bookings)
      setStats({
        total: all.length,
        pending: all.filter((b: Booking) => b.status === 'pending').length,
        completed: all.filter((b: Booking) => b.status === 'completed').length,
        cancelled: all.filter((b: Booking) => b.status === 'cancelled').length,
      })
    }
  }
  useEffect(() => { load() }, [date])

  useEffect(() => {
    fetch('/api/admin/services-walkin')
      .then(res => res.json())
      .then((d: ServiceOption[]) => {
        if (Array.isArray(d)) setServices(d)
      })
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/staff/assignments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  const addService = async (bookingId: string) => {
    const svcId = selectedService[bookingId]
    const variantId = selectedVariant[bookingId]
    const svc = services.find(s => s.id === svcId)
    const variant = svc?.variants.find(v => v.id === variantId)
    if (!svc || !variant) return
    await fetch(`/api/staff/assignments/${bookingId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: variant.id,
        name: `${svc.name} - ${variant.name}`,
        price: variant.currentPrice?.offerPrice ?? variant.currentPrice?.actualPrice ?? 0,
        duration: variant.duration || 0,
      }),
    })
    setSelectedService((p) => ({ ...p, [bookingId]: '' }))
    setSelectedVariant((p) => ({ ...p, [bookingId]: '' }))
    load()
  }

  const updateCustomer = async (bookingId: string, customer: string, phone: string) => {
    await fetch(`/api/staff/assignments/${bookingId}/customer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer, phone }),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4 text-blue-800">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-4 text-yellow-800">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4 text-green-800">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-sm">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="p-4 text-red-800">
            <div className="text-2xl font-bold">{stats.cancelled}</div>
            <div className="text-sm">Cancelled</div>
          </CardContent>
        </Card>
      </div>

      {groups.map((g, idx) => (
        <Card key={idx} className="shadow">
          <CardHeader>
            <CardTitle className="text-lg">{g.customer || 'No Name'} - {g.phone || 'No Phone'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {g.bookings.map(b => (
              <div key={b.id} className="p-4 border rounded bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-medium">{b.start} - {b.status}</div>
                  {b.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => updateStatus(b.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Complete
                      </Button>
                      <Button
                        onClick={() => updateStatus(b.id, 'cancelled')}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
                <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                  {b.items.map(it => (<li key={it.id}>{it.name}</li>))}
                </ul>
                <div className="mt-4 space-y-2">
                  <ReactSelect<ServiceSelectOption>
                    className="text-sm"
                    options={services.map(s => ({ value: s.id, label: `${s.categoryName} - ${s.name}` }))}
                    value={selectedService[b.id] ? { value: selectedService[b.id], label: `${services.find(s => s.id === selectedService[b.id])?.categoryName} - ${services.find(s => s.id === selectedService[b.id])?.name}` } : null}
                    onChange={(opt) => {
                      const val = opt?.value || ''
                      setSelectedService(prev => ({ ...prev, [b.id]: val }))
                      setSelectedVariant(prev => ({ ...prev, [b.id]: '' }))
                    }}
                    placeholder="Select service"
                    isSearchable
                  />
                  {selectedService[b.id] && (
                    <div className="flex gap-2">
                      <Select
                        value={selectedVariant[b.id] || ''}
                        onValueChange={(val) => setSelectedVariant(prev => ({ ...prev, [b.id]: val }))}
                        className="flex-1"
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select variant" />
                        </SelectTrigger>
                        <SelectContent>
                          {services
                            .find((s) => s.id === selectedService[b.id])
                            ?.variants.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.name} ({v.duration}m) - ₹{v.currentPrice?.offerPrice ?? v.currentPrice?.actualPrice}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => addService(b.id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!selectedVariant[b.id]}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>
                {(!b.customer || !b.phone) && (
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <input
                      placeholder="Name"
                      defaultValue={b.customer || ''}
                      id={`name-${b.id}`}
                      className="border p-2 flex-1 rounded"
                    />
                    <input
                      placeholder="Phone"
                      defaultValue={b.phone || ''}
                      id={`phone-${b.id}`}
                      className="border p-2 flex-1 rounded"
                    />
                    <Button
                      onClick={() => {
                        const customer = (document.getElementById(`name-${b.id}`) as HTMLInputElement).value
                        const phone = (document.getElementById(`phone-${b.id}`) as HTMLInputElement).value
                        updateCustomer(b.id, customer, phone)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
