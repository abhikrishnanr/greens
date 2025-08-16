'use client'

import { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, CheckCircle, Clock, XCircle, ClipboardList } from 'lucide-react'

interface BookingItem {
  id: string
  name: string
  price: number
  status: string
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
  const [search, setSearch] = useState('')

  const load = async () => {
    const res = await fetch(`/api/staff/assignments?date=${date}`)
    const data = await res.json()
    if (data.success) {
      setGroups(data.groups)
      const allItems = data.groups.flatMap((g: Group) =>
        g.bookings.flatMap((b: Booking) => b.items),
      )
      setStats({
        total: allItems.length,
        pending: allItems.filter((it: BookingItem) => it.status === 'pending').length,
        completed: allItems.filter((it: BookingItem) => it.status === 'completed').length,
        cancelled: allItems.filter((it: BookingItem) => it.status === 'cancelled').length,
      })
    }
  }
  useEffect(() => {
    load()
  }, [date])

  useEffect(() => {
    fetch('/api/admin/services-walkin')
      .then(res => res.json())
      .then((d: ServiceOption[]) => {
        if (Array.isArray(d)) setServices(d)
      })
  }, [])

  const updateItemStatus = async (id: string, status: string) => {
    await fetch(`/api/staff/assignments/items/${id}/status`, {
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
        serviceId: svc.id,
        tierId: variant.id,
        name: `${svc.name} - ${variant.name}`,
        price: variant.currentPrice?.offerPrice ?? variant.currentPrice?.actualPrice ?? 0,
        duration: variant.duration || 0,
      }),
    })
    setSelectedService(p => ({ ...p, [bookingId]: '' }))
    setSelectedVariant(p => ({ ...p, [bookingId]: '' }))
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

  const searchLower = search.toLowerCase()
  const filteredGroups = groups
    .map(g => {
      const filteredBookings = g.bookings
        .map(b => ({
          ...b,
          items: b.items.filter(it => it.name.toLowerCase().includes(searchLower)),
        }))
        .filter(b => b.items.length > 0)
      const matchGroup =
        (g.customer || '').toLowerCase().includes(searchLower) ||
        (g.phone || '').includes(search)
      if (matchGroup) return g
      if (filteredBookings.length === 0) return null
      return { ...g, bookings: filteredBookings }
    })
    .filter(Boolean) as Group[]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6" /> Assignments
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 w-48"
            />
          </div>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-40" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4 text-blue-800 flex items-center gap-3">
            <ClipboardList className="h-5 w-5" />
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-4 text-yellow-800 flex items-center gap-3">
            <Clock className="h-5 w-5" />
            <div>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4 text-green-800 flex items-center gap-3">
            <CheckCircle className="h-5 w-5" />
            <div>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <div className="text-sm">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="p-4 text-red-800 flex items-center gap-3">
            <XCircle className="h-5 w-5" />
            <div>
              <div className="text-2xl font-bold">{stats.cancelled}</div>
              <div className="text-sm">Cancelled</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredGroups.map((g, idx) => (
        <Card key={idx} className="shadow">
          <CardHeader>
            <CardTitle className="text-lg">
              {g.customer || 'No Name'} - {g.phone || 'No Phone'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {g.bookings.map(b => (
              <div key={b.id} className="p-4 border rounded bg-gray-50 space-y-4">
                <div className="font-medium">{b.start}</div>
                <ul className="space-y-2">
                  {b.items.map(it => (
                    <li
                      key={it.id}
                      className="flex items-center justify-between bg-white p-2 rounded shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        {it.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {it.status === 'cancelled' && (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        {it.status === 'pending' && (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="text-sm">{it.name}</span>
                      </div>
                      {it.status === 'pending' && (
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => updateItemStatus(it.id, 'completed')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateItemStatus(it.id, 'cancelled')}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-500">Add extra service</p>
                  <ReactSelect<ServiceSelectOption>
                    className="text-sm"
                    options={services.map(s => ({ value: s.id, label: `${s.categoryName} - ${s.name}` }))}
                    value={
                      selectedService[b.id]
                        ? {
                            value: selectedService[b.id],
                            label: `${services.find(s => s.id === selectedService[b.id])?.categoryName} - ${
                              services.find(s => s.id === selectedService[b.id])?.name
                            }`,
                          }
                        : null
                    }
                    onChange={opt => {
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
                        onValueChange={val => setSelectedVariant(prev => ({ ...prev, [b.id]: val }))}
                        className="flex-1"
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select variant" />
                        </SelectTrigger>
                        <SelectContent>
                          {services
                            .find(s => s.id === selectedService[b.id])
                            ?.variants.map(v => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.name} ({v.duration}m) - ₹
                                {v.currentPrice?.offerPrice ?? v.currentPrice?.actualPrice}
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
                    <Input
                      placeholder="Name"
                      defaultValue={b.customer || ''}
                      id={`name-${b.id}`}
                    />
                    <Input
                      placeholder="Phone"
                      defaultValue={b.phone || ''}
                      id={`phone-${b.id}`}
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
