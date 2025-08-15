'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, X } from 'lucide-react'

interface ServiceOption {
  id: string
  label: string
  currentPrice: number
  offerPrice?: number | null
}

interface PlanItem {
  id: string
  serviceTierId: string
  name: string
  currentPrice: number
  offerPrice?: number | null
}

interface Plan {
  id: string
  title: string
  imageUrl?: string
  items: PlanItem[]
}

export default function PremiumServicesAdmin() {
  const emptyPlan: Plan = { id: '', title: '', imageUrl: '', items: [] }
  const [plans, setPlans] = useState<Plan[]>([])
  const [form, setForm] = useState<Plan>(emptyPlan)
  const [editing, setEditing] = useState(false)
  const [options, setOptions] = useState<ServiceOption[]>([])

  const load = async () => {
    const [planRes, variantRes] = await Promise.all([
      fetch('/api/admin/premium-services'),
      fetch('/api/admin/service-variants/all'),
    ])
    const planData = await planRes.json()
    const variantData = await variantRes.json()
    setPlans(planData)
    const opts: ServiceOption[] = variantData.map((v: any) => ({
      id: v.id,
      label: `${v.serviceName} - ${v.variantName}`,
      currentPrice: v.current?.actualPrice ?? 0,
      offerPrice: v.current?.offerPrice ?? null,
    }))
    setOptions(opts)
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

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { id: crypto.randomUUID(), serviceTierId: '', name: '', currentPrice: 0, offerPrice: null }],
    })
  }

  const updateItem = (idx: number, tierId: string) => {
    const variant = options.find((o) => o.id === tierId)
    const items = [...form.items]
    items[idx] = {
      id: items[idx].id,
      serviceTierId: tierId,
      name: variant?.label || '',
      currentPrice: variant?.currentPrice || 0,
      offerPrice: variant?.offerPrice ?? null,
    }
    setForm({ ...form, items })
  }

  const removeItem = (idx: number) => {
    const items = [...form.items]
    items.splice(idx, 1)
    setForm({ ...form, items })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    await fetch('/api/admin/premium-services', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: form.id,
        title: form.title,
        imageUrl: form.imageUrl,
        items: form.items.map((i) => ({ serviceTierId: i.serviceTierId })),
      }),
    })
    setForm(emptyPlan)
    setEditing(false)
    load()
  }

  const edit = (p: Plan) => {
    setForm(p)
    setEditing(true)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this plan?')) return
    await fetch('/api/admin/premium-services', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Premium Services</h1>
      <form onSubmit={save} className="space-y-4 bg-white p-6 rounded shadow border">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            className="w-full p-2 rounded border"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Image</label>
          <input type="file" accept="image/*" onChange={handleImage} className="w-full p-2 rounded border" />
          {form.imageUrl && <img src={form.imageUrl} alt="preview" className="h-32 object-cover mt-2" />}
        </div>
        <div>
          <label className="block font-medium mb-2">Services</label>
          <div className="space-y-2">
            {form.items.map((item, idx) => (
              <div key={item.id} className="flex gap-2 items-center">
                <select
                  className="flex-1 p-2 rounded border"
                  value={item.serviceTierId}
                  onChange={(e) => updateItem(idx, e.target.value)}
                  required
                >
                  <option value="">Select service</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <div className="w-32 text-right">
                  {item.offerPrice && item.offerPrice < item.currentPrice ? (
                    <>
                      <span className="line-through mr-1">₹{item.currentPrice}</span>
                      <span>₹{item.offerPrice}</span>
                    </>
                  ) : (
                    <span>₹{item.currentPrice}</span>
                  )}
                </div>
                <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-green-700">
              <Plus className="h-4 w-4" /> Add Service
            </button>
          </div>
        </div>
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          {editing ? 'Update' : 'Add'} Plan
        </button>
      </form>

      <table className="w-full text-left text-sm bg-white rounded shadow border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-3 py-2">{p.title}</td>
              <td className="flex gap-2 px-3 py-2">
                <button
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                  onClick={() => edit(p)}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                  onClick={() => del(p.id)}
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
