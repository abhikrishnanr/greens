'use client'
import { useEffect, useState } from 'react'

interface Service {
  id: string
  main_service_name: string
}
interface Entry {
  id: string
  actualPrice: number
  offerPrice?: number
  offerStartDate?: string
  offerEndDate?: string
}

export default function PriceHistoryPage() {
  const [services, setServices] = useState<Service[]>([])
  const [selected, setSelected] = useState<string>('')
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    fetch('/api/admin/services/all').then(r => r.json()).then(setServices)
  }, [])

  useEffect(() => {
    if (!selected) return
    fetch(`/api/admin/price-history/${selected}`).then(r => r.json()).then(setEntries)
  }, [selected])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Price History</h1>
      <select className="bg-gray-800 p-2 rounded mb-4" value={selected} onChange={e => setSelected(e.target.value)}>
        <option value="">Select service</option>
        {services.map(s => (
          <option key={s.id} value={s.id}>{s.main_service_name}</option>
        ))}
      </select>
      {entries.length > 0 && (
        <table className="w-full text-sm text-left">
          <thead>
            <tr>
              <th>Actual</th>
              <th>Offer</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-t border-gray-700">
                <td>{e.actualPrice}</td>
                <td>{e.offerPrice ?? '—'}</td>
                <td>{e.offerStartDate ? new Date(e.offerStartDate).toLocaleDateString() : '—'}</td>
                <td>{e.offerEndDate ? new Date(e.offerEndDate).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
