'use client'
import { useEffect, useState } from 'react'

interface Service {
  id: string
  main_service_name: string
  minPrice: number | null
  active: boolean
}

export default function ServicesAdmin() {
  const [services, setServices] = useState<Service[]>([])

  const load = async () => {
    const res = await fetch('/api/admin/services/all')
    const data = await res.json()
    setServices(data)
  }

  useEffect(() => { load() }, [])

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/admin/service/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Services</h1>
      <table className="w-full text-sm text-left">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr key={s.id} className="border-t border-gray-700">
              <td>{s.main_service_name}</td>
              <td>{s.minPrice ?? '—'}</td>
              <td>
                <input
                  type="checkbox"
                  checked={s.active}
                  onChange={e => toggle(s.id, e.target.checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
