'use client'

import { useEffect, useState } from 'react'

interface ReportItem {
  dateTime: string
  service: string
  category: string | null
}

export default function ReportsPage() {
  const today = new Date().toISOString().split('T')[0]
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const [items, setItems] = useState<ReportItem[]>([])
  const [search, setSearch] = useState('')

  const load = async () => {
    const res = await fetch(`/api/staff/reports?start=${start}&end=${end}`)
    const data = await res.json()
    if (data.success) setItems(data.items)
    else setItems([])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = items.filter((i) =>
    i.service.toLowerCase().includes(search.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border rounded p-2"
        />
        <button onClick={load} className="px-4 py-2 bg-green-600 text-white rounded">
          Generate
        </button>
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 flex-1"
        />
      </div>

      {filtered.length > 0 ? (
        <table className="min-w-full border mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Sl. No.</th>
              <th className="border px-2 py-1 text-left">Date and time</th>
              <th className="border px-2 py-1 text-left">Service category</th>
              <th className="border px-2 py-1 text-left">Service Name</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{idx + 1}</td>
                <td className="border px-2 py-1">{i.dateTime}</td>
                <td className="border px-2 py-1">{i.category || '-'}</td>
                <td className="border px-2 py-1">{i.service}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No records for selected range.</p>
      )}
    </div>
  )
}
