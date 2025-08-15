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

  const load = async () => {
    const res = await fetch(`/api/staff/assignments?date=${date}`)
    const data = await res.json()
    if (data.success) setGroups(data.groups)
  }
  useEffect(() => { load() }, [date])

  useEffect(() => {
    fetch('/api/services?branchId=default').then(res => res.json()).then(d => setServices(d.services || []))
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
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Assignments</h1>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-1" />
      {groups.map((g, idx) => (
        <div key={idx} className="border p-2 rounded">
          <h2 className="font-medium">{g.customer || 'No Name'} - {g.phone || 'No Phone'}</h2>
          {g.bookings.map(b => (
            <div key={b.id} className="mt-2 p-2 border rounded">
              <div className="flex items-center gap-2">
                <div className="flex-1">{b.start} - {b.status}</div>
                {b.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(b.id, 'completed')} className="px-2 py-1 bg-green-600 text-white rounded">Complete</button>
                    <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-2 py-1 bg-red-600 text-white rounded">Cancel</button>
                  </>
                )}
              </div>
              <ul className="list-disc ml-5 mt-2">
                {b.items.map(it => (<li key={it.id}>{it.name}</li>))}
              </ul>
              <div className="mt-2 flex items-center gap-2">
                <select onChange={(e) => addService(b.id, e.target.value)} defaultValue="">
                  <option value="" disabled>Add Service</option>
                  {services.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>
              {(!b.customer || !b.phone) && (
                <div className="mt-2 flex gap-2">
                  <input placeholder="Name" defaultValue={b.customer || ''} id={`name-${b.id}`} className="border p-1" />
                  <input placeholder="Phone" defaultValue={b.phone || ''} id={`phone-${b.id}`} className="border p-1" />
                  <button onClick={() => {
                    const customer = (document.getElementById(`name-${b.id}`) as HTMLInputElement).value
                    const phone = (document.getElementById(`phone-${b.id}`) as HTMLInputElement).value
                    updateCustomer(b.id, customer, phone)
                  }} className="px-2 py-1 bg-blue-600 text-white rounded">Save</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
