'use client'
import { useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

interface TierRow {
  id: string
  tierName: string
  serviceName: string
  categoryName: string
  current?: Entry
  upcoming?: Entry
}

interface Entry {
  id: string
  actualPrice: number
  offerPrice?: number | null
  startDate: string
  endDate?: string | null
}

function getCurrentAndNext(entries: Entry[]) {
  const now = new Date()
  const sorted = [...entries].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  let current: Entry | undefined
  let upcoming: Entry | undefined
  for (const e of sorted) {
    const start = new Date(e.startDate)
    const end = e.endDate ? new Date(e.endDate) : null
    if (!current && start <= now && (!end || now < end)) current = e
    if (!upcoming && start > now) upcoming = e
  }
  return { current, upcoming }
}

export default function TierPriceHistoryPage() {
  const empty: Partial<Entry> = { id: '', actualPrice: 0, startDate: '' }
  const [rows, setRows] = useState<TierRow[]>([])
  const [selected, setSelected] = useState('')
  const [entries, setEntries] = useState<Entry[]>([])
  const [form, setForm] = useState<Partial<Entry>>(empty)
  const [editing, setEditing] = useState(false)

  useEffect(() => { loadRows() }, [])

  const loadRows = async () => {
    const tiers = await fetch('/api/admin/service-tiers/all').then(r => r.json())
    const enriched: TierRow[] = []
    for (const t of tiers) {
      const hist: Entry[] = await fetch(`/api/admin/tier-price-history/${t.id}`).then(r => r.json())
      const { current, upcoming } = getCurrentAndNext(hist)
      enriched.push({ ...t, current, upcoming })
    }
    setRows(enriched)
  }

  const open = async (tierId: string) => {
    setSelected(tierId)
    const hist = await fetch(`/api/admin/tier-price-history/${tierId}`).then(r => r.json())
    setEntries(hist)
    setForm({ ...empty, id: crypto.randomUUID() })
    setEditing(false)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = {
      actualPrice: Number(form.actualPrice),
      offerPrice: form.offerPrice !== undefined && form.offerPrice !== null ? Number(form.offerPrice) : null,
      startDate: form.startDate,
      endDate: form.endDate || null,
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
        body: JSON.stringify(body),
      })
    }
    setForm({ ...empty, id: crypto.randomUUID() })
    setEditing(false)
    const hist = await fetch(`/api/admin/tier-price-history/${selected}`).then(r => r.json())
    setEntries(hist)
    loadRows()
  }

  const edit = (e: Entry) => {
    setForm({ ...e })
    setEditing(true)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/admin/tier-price-history/${selected}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const hist = await fetch(`/api/admin/tier-price-history/${selected}`).then(r => r.json())
    setEntries(hist)
    loadRows()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-700">Tier Price History</h1>
      <table className="w-full text-sm bg-white rounded shadow border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Service</th>
            <th className="px-3 py-2">Tier</th>
            <th className="px-3 py-2">Current Price</th>
            <th className="px-3 py-2">Current Ends</th>
            <th className="px-3 py-2">Upcoming Price</th>
            <th className="px-3 py-2">Upcoming Starts</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="border-t">
              <td className="px-3 py-2">{row.categoryName}</td>
              <td className="px-3 py-2">{row.serviceName}</td>
              <td className="px-3 py-2">{row.tierName}</td>
              <td className="px-3 py-2">{row.current ? row.current.actualPrice : '—'}</td>
              <td className="px-3 py-2">{row.current?.endDate ? new Date(row.current.endDate).toLocaleDateString() : '—'}</td>
              <td className="px-3 py-2">{row.upcoming ? row.upcoming.actualPrice : '—'}</td>
              <td className="px-3 py-2">{row.upcoming?.startDate ? new Date(row.upcoming.startDate).toLocaleDateString() : '—'}</td>
              <td className="px-3 py-2">
                <button className="px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded" onClick={() => open(row.id)}>
                  <Pencil className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow w-full max-w-xl p-4 space-y-4">
            <h2 className="text-lg font-semibold">Edit Price History</h2>
            <form onSubmit={save} className="space-y-2">
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
                placeholder="Offer price (optional)"
                value={form.offerPrice ?? ''}
                onChange={e => setForm({ ...form, offerPrice: e.target.value ? parseFloat(e.target.value) : null })}
              />
              <input
                type="date"
                className="w-full p-2 rounded border"
                value={form.startDate || ''}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">Start date when this price becomes effective</p>
              <input
                type="date"
                className="w-full p-2 rounded border"
                value={form.endDate || ''}
                onChange={e => setForm({ ...form, endDate: e.target.value || null })}
              />
              <p className="text-xs text-gray-500">Leave blank if this price has no planned end date</p>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="px-3 py-1 rounded border" onClick={() => { setSelected(''); setEntries([]) }}>
                  Close
                </button>
                <button type="submit" className="px-3 py-1 rounded bg-green-600 text-white">
                  {editing ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
            {entries.length > 0 && (
              <table className="w-full text-sm mt-4 border-t">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-1">Actual</th>
                    <th className="px-2 py-1">Offer</th>
                    <th className="px-2 py-1">Start</th>
                    <th className="px-2 py-1">End</th>
                    <th className="px-2 py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <tr key={e.id} className="border-t">
                      <td className="px-2 py-1">{e.actualPrice}</td>
                      <td className="px-2 py-1">{e.offerPrice ?? '—'}</td>
                      <td className="px-2 py-1">{new Date(e.startDate).toLocaleDateString()}</td>
                      <td className="px-2 py-1">{e.endDate ? new Date(e.endDate).toLocaleDateString() : '—'}</td>
                      <td className="flex gap-1 px-2 py-1">
                        <button className="p-1 text-blue-600" onClick={() => edit(e)}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-red-600" onClick={() => del(e.id)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
