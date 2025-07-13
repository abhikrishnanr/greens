'use client'
import { useEffect, useState } from 'react'
import WysiwygEditor from '@/app/components/WysiwygEditor'

interface Category {
  id: string
  name: string
}

interface Service {
  id: string
  main_service_name: string
  minPrice?: number | null
  active: boolean
  service_description?: string
  duration?: number
}

export default function ServicesAdmin() {
  const [categories, setCategories] = useState<Category[]>([])
  const [category, setCategory] = useState('')
  const [services, setServices] = useState<Service[]>([])
  const empty: Partial<Service> = {
    id: '',
    main_service_name: '',
    service_description: '',
    duration: 0,
    active: true,
  }
  const [form, setForm] = useState<Partial<Service>>(empty)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(false)

  const loadCategories = async () => {
    const res = await fetch('/api/admin/service-categories')
    const data = await res.json()
    setCategories(data)
  }

  const loadServices = async () => {
    if (!category) return
    const res = await fetch(`/api/admin/services/${category}`)
    const data = await res.json()
    setServices(data)
  }

  useEffect(() => { loadCategories() }, [])
  useEffect(() => { loadServices() }, [category])

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/admin/service/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    loadServices()
  }

  const openAdd = () => {
    setForm({ ...empty, id: crypto.randomUUID(), active: true })
    setEditing(false)
    setShowForm(true)
  }

  const openEdit = (s: Service) => {
    setForm({
      id: s.id,
      main_service_name: s.main_service_name,
      service_description: s.service_description || '',
      duration: s.duration || 0,
      active: s.active,
    })
    setEditing(true)
    setShowForm(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = {
      mainServiceName: form.main_service_name,
      serviceDescription: form.service_description,
      duration: Number(form.duration),
      applicableTo: 'unisex',
      subCategory: 'general',
      costCategory: 'standard',
      active: form.active,
    }
    if (editing) {
      await fetch(`/api/admin/service/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(`/api/admin/services/${category}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: form.id, ...body }),
      })
    }
    setShowForm(false)
    setForm(empty)
    loadServices()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Services</h1>
      <div className="flex items-center gap-2 mb-4">
        <select
          className="bg-gray-800 p-2 rounded"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {category && (
          <button className="bg-green-600 px-3 py-2 rounded" onClick={openAdd}>+ Add Service</button>
        )}
      </div>
      {services.length > 0 && (
        <table className="w-full text-sm text-left">
          <thead>
            <tr>
              <th>Name</th>
              <th>Duration</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} className="border-t border-gray-700">
                <td>{s.main_service_name}</td>
                <td>{s.duration ?? '—'}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={s.active}
                    onChange={e => toggle(s.id, e.target.checked)}
                  />
                </td>
                <td className="space-x-2">
                  <button className="underline" onClick={() => openEdit(s)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded w-full max-w-lg">
            <h2 className="text-xl mb-4">{editing ? 'Edit' : 'Add'} Service</h2>
            <form onSubmit={save} className="space-y-2">
              <input
                className="w-full p-2 rounded bg-gray-800"
                placeholder="Name"
                value={form.main_service_name || ''}
                onChange={e => setForm({ ...form, main_service_name: e.target.value })}
                required
              />
              <WysiwygEditor
                value={form.service_description || ''}
                onChange={desc => setForm({ ...form, service_description: desc })}
              />
              <input
                type="number"
                className="w-full p-2 rounded bg-gray-800"
                placeholder="Duration (min)"
                value={form.duration ?? 0}
                onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                />
                Active
              </label>
              <div className="text-right space-x-2 pt-2">
                <button type="button" className="px-3 py-1 bg-gray-600 rounded" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="px-3 py-1 bg-green-600 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
