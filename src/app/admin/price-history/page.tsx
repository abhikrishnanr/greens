'use client'
import { useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

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
  const empty: Partial<Entry> = { id: '', actualPrice: 0 }
  const [form, setForm] = useState<Partial<Entry>>(empty)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    fetch('/api/admin/services/all').then(r => r.json()).then(setServices)
  }, [])

  useEffect(() => {
    if (!selected) return
    fetch(`/api/admin/price-history/${selected}`).then(r => r.json()).then(setEntries)
  }, [selected])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = {
      actualPrice: Number(form.actualPrice),
      offerPrice: form.offerPrice ? Number(form.offerPrice) : null,
      offerStartDate: form.offerStartDate || null,
      offerEndDate: form.offerEndDate || null,
    }
    if (editing) {
      await fetch(`/api/admin/price-history/${selected}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: form.id, ...body }),
      })
    } else {
      await fetch(`/api/admin/price-history/${selected}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: crypto.randomUUID(), ...body }),
      })
    }
    setForm(empty)
    setEditing(false)
    fetch(`/api/admin/price-history/${selected}`).then(r => r.json()).then(setEntries)
  }

  const edit = (e: Entry) => {
    setForm(e)
    setEditing(true)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/admin/price-history/${selected}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetch(`/api/admin/price-history/${selected}`).then(r => r.json()).then(setEntries)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Price History</h1>
      <select className="bg-white p-2 rounded mb-4 border" value={selected} onChange={e => setSelected(e.target.value)}>
        <option value="">Select service</option>
        {services.map(s => (
          <option key={s.id} value={s.id}>{s.main_service_name}</option>
        ))}
      </select>
      {selected && (
        <div className="space-y-4">
          <form onSubmit={save} className="space-y-2 bg-white p-4 rounded shadow border">
            <input
              type="number"
              className="w-full p-2 rounded border"
              placeholder="Actual price"
              value={form.actualPrice ?? 0}
              onChange={e => setForm({ ...form, actualPrice: parseFloat(e.target.value) })}
              required
            />
            <input
              type="number"
              className="w-full p-2 rounded border"
              placeholder="Offer price"
              value={form.offerPrice ?? ''}
              onChange={e => setForm({ ...form, offerPrice: e.target.value })}
            />
            <input
              type="date"
              className="w-full p-2 rounded border"
              value={form.offerStartDate || ''}
              onChange={e => setForm({ ...form, offerStartDate: e.target.value })}
            />
            <input
              type="date"
              className="w-full p-2 rounded border"
              value={form.offerEndDate || ''}
              onChange={e => setForm({ ...form, offerEndDate: e.target.value })}
            />
            <button className="bg-green-600 px-4 py-2 rounded text-white" type="submit">
              {editing ? 'Update' : 'Add'} Entry
            </button>
          </form>
          {entries.length > 0 && (
            <table className="w-full text-sm text-left bg-white rounded shadow border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2">Actual</th>
                  <th className="px-3 py-2">Offer</th>
                  <th className="px-3 py-2">Start</th>
                  <th className="px-3 py-2">End</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} className="border-t">
                    <td className="px-3 py-2">{e.actualPrice}</td>
                    <td className="px-3 py-2">{e.offerPrice ?? '—'}</td>
                    <td className="px-3 py-2">{e.offerStartDate ? new Date(e.offerStartDate).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2">{e.offerEndDate ? new Date(e.offerEndDate).toLocaleDateString() : '—'}</td>
                    <td className="flex gap-2 px-3 py-2">
                      <button
                        className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                        onClick={() => edit(e)}
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        className="flex items-center gap-1 px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                        onClick={() => del(e.id)}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
