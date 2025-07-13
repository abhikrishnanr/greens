'use client'
import { useEffect, useState } from 'react'
import WysiwygEditor from '@/app/components/WysiwygEditor'

interface Category {
  id: string
  name: string
  description?: string
  order?: number
}

export default function ServiceCategoriesPage() {
  const empty: Category = { id: '', name: '', description: '', order: 0 }
  const [cats, setCats] = useState<Category[]>([])
  const [form, setForm] = useState<Category>(empty)
  const [editing, setEditing] = useState(false)

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
    setForm(c)
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
      <h1 className="text-2xl font-bold mb-4">Service Categories</h1>
      <form onSubmit={save} className="space-y-2 bg-black p-4 rounded mb-6">
        <input
          className="w-full p-2 rounded bg-gray-800"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <WysiwygEditor
          value={form.description || ''}
          onChange={desc => setForm({ ...form, description: desc })}
        />
        <input
          type="number"
          className="w-full p-2 rounded bg-gray-800"
          placeholder="Order"
          value={form.order ?? 0}
          onChange={e => setForm({ ...form, order: parseInt(e.target.value) })}
        />
        <button className="bg-green-600 px-4 py-2 rounded" type="submit">
          {editing ? 'Update' : 'Add'} Category
        </button>
      </form>
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cats.map(c => (
            <tr key={c.id} className="border-t border-gray-700">
              <td>{c.name}</td>
              <td className="space-x-2">
                <button className="underline" onClick={() => edit(c)}>Edit</button>
                <button className="underline text-red-400" onClick={() => del(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
