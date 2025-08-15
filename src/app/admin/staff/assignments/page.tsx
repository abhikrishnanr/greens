'use client'

import { useEffect, useState } from 'react'

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

interface Service {
  id: string
  name: string
  offerPrice: number
  duration: number
}

export default function AssignmentsPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [groups, setGroups] = useState<Group[]>([])
  const [services, setServices] = useState<Service[]>([])
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
    fetch('/api/admin/services/all')
      .then(res => res.json())
      .then(d => {
        const list = Array.isArray(d)
          ? d.map((s: any) => ({
            id: s.id,
            name: s.main_service_name || s.name,
            offerPrice: s.minPrice || 0,
            duration: s.duration || 0,
          }))
          : []
        setServices(list)
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

  const addService = async (bookingId: string, serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return
    await fetch(`/api/staff/assignments/${bookingId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId, name: service.name, price: service.offerPrice || 0, duration: service.duration }),
    })
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
          className="border rounded p-2"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded shadow bg-blue-100 text-blue-800">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm">Total</div>
        </div>
        <div className="p-4 rounded shadow bg-yellow-100 text-yellow-800">
          <div className="text-2xl font-bold">{stats.pending}</div>
          <div className="text-sm">Pending</div>
        </div>
        <div className="p-4 rounded shadow bg-green-100 text-green-800">
          <div className="text-2xl font-bold">{stats.completed}</div>
          <div className="text-sm">Completed</div>
        </div>
        <div className="p-4 rounded shadow bg-red-100 text-red-800">
          <div className="text-2xl font-bold">{stats.cancelled}</div>
          <div className="text-sm">Cancelled</div>
        </div>
      </div>

      {groups.map((g, idx) => (
        <div key={idx} className="border rounded p-4 shadow">
          <h2 className="font-semibold text-lg mb-2">{g.customer || 'No Name'} - {g.phone || 'No Phone'}</h2>
          {g.bookings.map(b => (
            <div key={b.id} className="mt-4 p-4 border rounded bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="flex-1 font-medium">{b.start} - {b.status}</div>
                {b.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(b.id, 'completed')}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => updateStatus(b.id, 'cancelled')}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
              <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                {b.items.map(it => (<li key={it.id}>{it.name}</li>))}
              </ul>
              <div className="mt-4 flex items-center gap-2">
                <select
                  onChange={(e) => addService(b.id, e.target.value)}
                  defaultValue=""
                  className="border rounded p-2"
                >
                  <option value="" disabled>Add Service</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
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
                  <button
                    onClick={() => {
                      const customer = (document.getElementById(`name-${b.id}`) as HTMLInputElement).value
                      const phone = (document.getElementById(`phone-${b.id}`) as HTMLInputElement).value
                      updateCustomer(b.id, customer, phone)
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
