'use client'
import { useEffect, useState } from 'react'
import WysiwygEditor from '@/app/components/WysiwygEditor'
import { Pencil, Trash2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
  imageUrl?: string
  caption?: string
  order?: number
}

export default function ServiceCategoriesPage() {
  const empty: Category = { id: '', name: '', description: '', imageUrl: '', caption: '', order: 0 }
  const [cats, setCats] = useState<Category[]>([])
  const [form, setForm] = useState<Category>(empty)
  const [editing, setEditing] = useState(false)

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setForm({ ...form, imageUrl: data.url })
  }

  const load = async () => {
    const res = await fetch('/api/admin/service-categories')
    const data = await res.json()
    setCats(data)
  }

  useEffect(() => {
    load()
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    await fetch('/api/admin/service-categories', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm(empty)
    setEditing(false)
    load()
  }

  const edit = (c: Category) => {
    setForm({
      id: c.id,
      name: c.name,
      description: c.description || '',
      imageUrl: c.imageUrl || '',
      caption: c.caption || '',
      order: c.order ?? 0,
    })
    setEditing(true)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await fetch('/api/admin/service-categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Service Categories</h1>
      <form onSubmit={save} className="space-y-4 bg-white p-6 rounded shadow border mb-6">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            className="w-full p-2 rounded border"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <small className="text-gray-500">Service category name</small>
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <WysiwygEditor
            value={form.description || ''}
            onChange={desc => setForm({ ...form, description: desc })}
          />
          <small className="text-gray-500">Detailed info about this category</small>
        </div>
        <div>
          <label className="block font-medium mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="w-full p-2 rounded border"
          />
          {form.imageUrl && (
            <img src={form.imageUrl} alt="preview" className="h-32 object-cover mt-2" />
          )}
          <small className="text-gray-500">Upload category thumbnail</small>
        </div>
        <div>
          <label className="block font-medium mb-1">Caption</label>
          <input
            className="w-full p-2 rounded border"
            value={form.caption || ''}
            onChange={e => setForm({ ...form, caption: e.target.value })}
          />
          <small className="text-gray-500">Short tagline for this category</small>
        </div>
        <div>
          <label className="block font-medium mb-1">Order</label>
          <input
            type="number"
            className="w-full p-2 rounded border"
            value={form.order ?? 0}
            onChange={e => setForm({ ...form, order: parseInt(e.target.value) })}
          />
          <small className="text-gray-500">Display order in lists</small>
        </div>
        <button className="bg-green-600 px-4 py-2 rounded text-white" type="submit">
          {editing ? 'Update' : 'Add'} Category
        </button>
      </form>
      <table className="w-full text-left text-sm bg-white rounded shadow border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Caption</th>
            <th className="px-3 py-2">Image</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cats.map(c => (
            <tr key={c.id} className="border-t">
              <td className="px-3 py-2">{c.name}</td>
              <td className="px-3 py-2">{c.caption ?? '—'}</td>
              <td className="px-3 py-2">{c.imageUrl ? <img src={c.imageUrl} className="h-10"/> : '—'}</td>
              <td className="flex gap-2 px-3 py-2">
                <button
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                  onClick={() => edit(c)}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                  onClick={() => del(c.id)}
                >
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
