'use client'

import { useState } from 'react'

interface ReportItem {
  date: string
  service: string
  category: string | null
  price: number
}

export default function ReportsPage() {
  const today = new Date().toISOString().split('T')[0]
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const [items, setItems] = useState<ReportItem[]>([])

  const load = async () => {
    const res = await fetch(`/api/staff/reports?start=${start}&end=${end}`)
    const data = await res.json()
    if (data.success) setItems(data.items)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reports</h1>
      <div className="flex gap-2">
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border p-1" />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border p-1" />
        <button onClick={load} className="px-3 py-1 bg-green-600 text-white rounded">Generate</button>
      </div>
      {items.length > 0 && (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Date</th>
              <th className="border px-2 py-1 text-left">Category</th>
              <th className="border px-2 py-1 text-left">Service</th>
              <th className="border px-2 py-1 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{i.date}</td>
                <td className="border px-2 py-1">{i.category || '-'}</td>
                <td className="border px-2 py-1">{i.service}</td>
                <td className="border px-2 py-1 text-right">{i.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
