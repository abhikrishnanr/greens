'use client'

import { useEffect, useState } from 'react'
import WysiwygEditor from '@/app/components/WysiwygEditor'
import { Pencil, Trash2 } from 'lucide-react'

interface Offer {
  id: string
  title: string
  subTitle?: string
  category?: string
  imageUrl?: string
  description?: string
}

export default function OffersAdminPage() {
  const empty: Offer = { id: '', title: '', subTitle: '', category: '', imageUrl: '', description: '' }
  const [offers, setOffers] = useState<Offer[]>([])
  const [form, setForm] = useState<Offer>(empty)
  const [editing, setEditing] = useState(false)

  const load = async () => {
    const res = await fetch('/api/admin/limited-time-offers')
    const data = await res.json()
    setOffers(data)
  }

  useEffect(() => { load() }, [])

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setForm({ ...form, imageUrl: data.url })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    await fetch('/api/admin/limited-time-offers', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm(empty)
    setEditing(false)
    load()
  }

  const edit = (o: Offer) => {
    setForm(o)
    setEditing(true)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this offer?')) return
    await fetch('/api/admin/limited-time-offers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Limited-Time Offers</h1>
      <form onSubmit={save} className="space-y-4 bg-white p-6 rounded shadow border mb-6">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input className="w-full p-2 rounded border" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Sub Title</label>
          <input className="w-full p-2 rounded border" value={form.subTitle || ''} onChange={e => setForm({ ...form, subTitle: e.target.value })} />
        </div>
        <div>
          <label className="block font-medium mb-1">Category</label>
          <input className="w-full p-2 rounded border" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <label className="block font-medium mb-1">Image</label>
          <input type="file" accept="image/*" onChange={handleImage} />
          {form.imageUrl && <img src={form.imageUrl} className="h-16 mt-2" />}
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <WysiwygEditor value={form.description || ''} onChange={val => setForm({ ...form, description: val })} />
        </div>
        <button className="bg-green-600 px-4 py-2 rounded text-white" type="submit">{editing ? 'Update' : 'Add'} Offer</button>
      </form>
      <table className="w-full text-left text-sm bg-white rounded shadow border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map(o => (
            <tr key={o.id} className="border-t">
              <td className="px-3 py-2">{o.title}</td>
              <td className="px-3 py-2">{o.category}</td>
              <td className="flex gap-2 px-3 py-2">
                <button className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded" onClick={() => edit(o)}>
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button className="flex items-center gap-1 px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded" onClick={() => del(o.id)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
