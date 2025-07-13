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
      <h1 className="text-2xl font-bold mb-4">Price History</h1>
      <select className="bg-gray-800 p-2 rounded mb-4" value={selected} onChange={e => setSelected(e.target.value)}>
        <option value="">Select service</option>
        {services.map(s => (
          <option key={s.id} value={s.id}>{s.main_service_name}</option>
        ))}
      </select>
      {selected && (
        <div className="space-y-4">
          <form onSubmit={save} className="space-y-2 bg-black p-4 rounded">
            <input
              type="number"
              className="w-full p-2 rounded bg-gray-800"
              placeholder="Actual price"
              value={form.actualPrice ?? 0}
              onChange={e => setForm({ ...form, actualPrice: parseFloat(e.target.value) })}
              required
            />
            <input
              type="number"
              className="w-full p-2 rounded bg-gray-800"
              placeholder="Offer price"
              value={form.offerPrice ?? ''}
              onChange={e => setForm({ ...form, offerPrice: e.target.value })}
            />
            <input
              type="date"
              className="w-full p-2 rounded bg-gray-800"
              value={form.offerStartDate || ''}
              onChange={e => setForm({ ...form, offerStartDate: e.target.value })}
            />
            <input
              type="date"
              className="w-full p-2 rounded bg-gray-800"
              value={form.offerEndDate || ''}
              onChange={e => setForm({ ...form, offerEndDate: e.target.value })}
            />
            <button className="bg-green-600 px-4 py-2 rounded" type="submit">
              {editing ? 'Update' : 'Add'} Entry
            </button>
          </form>
          {entries.length > 0 && (
            <table className="w-full text-sm text-left">
              <thead>
                <tr>
                  <th>Actual</th>
                  <th>Offer</th>
                  <th>Start</th>
                  <th>End</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} className="border-t border-gray-700">
                    <td>{e.actualPrice}</td>
                    <td>{e.offerPrice ?? '—'}</td>
                    <td>{e.offerStartDate ? new Date(e.offerStartDate).toLocaleDateString() : '—'}</td>
                    <td>{e.offerEndDate ? new Date(e.offerEndDate).toLocaleDateString() : '—'}</td>
                    <td className="space-x-2">
                      <button className="underline" onClick={() => edit(e)}>Edit</button>
                      <button className="underline text-red-400" onClick={() => del(e.id)}>Delete</button>
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
