'use client'

import { useEffect, useState } from 'react'

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
    else setItems([])
  }

  useEffect(() => { load() }, [])

  const total = items.reduce((sum, i) => sum + i.price, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border rounded p-2" />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border rounded p-2" />
        <button onClick={load} className="px-4 py-2 bg-green-600 text-white rounded">Generate</button>
      </div>

      {items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded shadow bg-blue-100 text-blue-800">
              <div className="text-2xl font-bold">{items.length}</div>
              <div className="text-sm">Services</div>
            </div>
            <div className="p-4 rounded shadow bg-green-100 text-green-800">
              <div className="text-2xl font-bold">₹{total}</div>
              <div className="text-sm">Revenue</div>
            </div>
          </div>
          <table className="min-w-full border mt-4">
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
        </>
      ) : (
        <p className="text-gray-500">No records for selected range.</p>
      )}
    </div>
  )
}
