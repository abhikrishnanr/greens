'use client'
import { useEffect, useState } from 'react'

interface Tier {
  id: string
  tierName: string
  serviceName: string
  categoryName: string
}

interface Entry {
  id: string
  actualPrice: number
  offerPrice?: number | null
  changedAt: string
}

export default function TierPriceHistoryPage() {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [selected, setSelected] = useState('')
  const [entries, setEntries] = useState<Entry[]>([])
  const empty: Partial<Entry> = { id: '', actualPrice: 0 }
  const [form, setForm] = useState<Partial<Entry>>(empty)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    fetch('/api/admin/service-tiers/all').then(r => r.json()).then(setTiers)
  }, [])

  useEffect(() => {
    if (!selected) return
    fetch(`/api/admin/tier-price-history/${selected}`).then(r => r.json()).then(setEntries)
  }, [selected])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = {
      actualPrice: Number(form.actualPrice),
      offerPrice: form.offerPrice !== undefined && form.offerPrice !== null ? Number(form.offerPrice) : null,
    }
    if (editing) {
      await fetch(`/api/admin/tier-price-history/${selected}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: form.id, ...body }),
      })
    } else {
      await fetch(`/api/admin/tier-price-history/${selected}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: crypto.randomUUID(), ...body }),
      })
    }
    setForm(empty)
    setEditing(false)
    fetch(`/api/admin/tier-price-history/${selected}`).then(r => r.json()).then(setEntries)
  }

  const edit = (e: Entry) => {
    setForm(e)
    setEditing(true)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/admin/tier-price-history/${selected}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetch(`/api/admin/tier-price-history/${selected}`).then(r => r.json()).then(setEntries)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Tier Price History</h1>
      <select className="bg-gray-800 p-2 rounded mb-4" value={selected} onChange={e => setSelected(e.target.value)}>
        <option value="">Select tier</option>
        {tiers.map(t => (
          <option key={t.id} value={t.id}>
            {t.categoryName} / {t.serviceName} / {t.tierName}
          </option>
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
              onChange={e => setForm({ ...form, offerPrice: e.target.value ? parseFloat(e.target.value) : null })}
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
                  <th className="px-3 py-2">Changed At</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} className="border-t">
                    <td className="px-3 py-2">{e.actualPrice}</td>
                    <td className="px-3 py-2">{e.offerPrice ?? '—'}</td>
                    <td className="px-3 py-2">{new Date(e.changedAt).toLocaleDateString()}</td>
                    <td className="space-x-2 px-3 py-2">
                      <button className="underline" onClick={() => edit(e)}>Edit</button>
                      <button className="underline text-red-600" onClick={() => del(e.id)}>Delete</button>
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
