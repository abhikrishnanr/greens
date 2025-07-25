'use client'
import { useEffect, useState } from 'react'
import WysiwygEditor from '@/app/components/WysiwygEditor'
import { Pencil, Trash2 } from 'lucide-react'

interface HeroTab {
  id: string
  name: string
  iconUrl?: string
  backgroundUrl?: string
  videoSrc?: string
  heroTitle: string
  heroDescription?: string
  buttonLabel?: string
  buttonLink?: string
  order?: number
  variantIds: string[]
}

interface VariantOption {
  id: string
  variantName: string
  serviceName: string
  categoryName: string
}

export default function HeroTabsPage() {
  const empty: HeroTab = {
    id: '',
    name: '',
    iconUrl: '',
    backgroundUrl: '',
    videoSrc: '',
    heroTitle: '',
    heroDescription: '',
    buttonLabel: '',
    buttonLink: '',
    order: 0,
    variantIds: [],
  }
  const [tabs, setTabs] = useState<HeroTab[]>([])
  const [form, setForm] = useState<HeroTab>(empty)
  const [editing, setEditing] = useState(false)
  const [variants, setVariants] = useState<VariantOption[]>([])

  const load = async () => {
    const res = await fetch('/api/admin/hero-tabs')
    const data = await res.json()
    setTabs(data)
  }

  const loadVariants = async () => {
    const res = await fetch('/api/admin/service-variants/all')
    const data = await res.json()
    setVariants(data)
  }

  useEffect(() => {
    load()
    loadVariants()
  }, [])

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setForm({ ...form, [field]: data.url })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    await fetch('/api/admin/hero-tabs', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm(empty)
    setEditing(false)
    load()
  }

  const edit = (t: HeroTab) => {
    setForm({ ...t })
    setEditing(true)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this tab?')) return
    await fetch('/api/admin/hero-tabs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Hero Tabs</h1>
      <form onSubmit={save} className="space-y-4 bg-white p-6 rounded shadow border mb-6">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input className="w-full p-2 rounded border" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Hero Title</label>
          <input className="w-full p-2 rounded border" value={form.heroTitle} onChange={e => setForm({ ...form, heroTitle: e.target.value })} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Hero Description</label>
          <WysiwygEditor value={form.heroDescription || ''} onChange={val => setForm({ ...form, heroDescription: val })} />
        </div>
        <div>
          <label className="block font-medium mb-1">Icon Image</label>
          <input type="file" accept="image/*" onChange={e => handleImage(e, 'iconUrl')} />
          {form.iconUrl && <img src={form.iconUrl} className="h-16 mt-2" />}
        </div>
        <div>
          <label className="block font-medium mb-1">Background Image</label>
          <input type="file" accept="image/*" onChange={e => handleImage(e, 'backgroundUrl')} />
          {form.backgroundUrl && <img src={form.backgroundUrl} className="h-16 mt-2" />}
        </div>
        <div>
          <label className="block font-medium mb-1">Video Source</label>
          <input type="file" accept="video/*" onChange={e => handleImage(e, 'videoSrc')} />
          {form.videoSrc && <video src={form.videoSrc} className="h-16 mt-2" controls />}
        </div>
        <div>
          <label className="block font-medium mb-1">Button Label</label>
          <input className="w-full p-2 rounded border" value={form.buttonLabel || ''} onChange={e => setForm({ ...form, buttonLabel: e.target.value })} />
        </div>
        <div>
          <label className="block font-medium mb-1">Button Link</label>
          <input className="w-full p-2 rounded border" value={form.buttonLink || ''} onChange={e => setForm({ ...form, buttonLink: e.target.value })} />
        </div>
        <div>
          <label className="block font-medium mb-1">Order</label>
          <input type="number" className="w-full p-2 rounded border" value={form.order ?? 0} onChange={e => setForm({ ...form, order: parseInt(e.target.value) })} />
        </div>
        <div>
          <label className="block font-medium mb-1">Service Variants</label>
          <select multiple className="w-full p-2 border rounded" value={form.variantIds} onChange={e => {
            const options = Array.from(e.target.selectedOptions).map(o => o.value)
            setForm({ ...form, variantIds: options })
          }}>
            {variants.map(v => (
              <option key={v.id} value={v.id}>{`${v.categoryName} - ${v.serviceName} (${v.variantName})`}</option>
            ))}
          </select>
        </div>
        <button className="bg-green-600 px-4 py-2 rounded text-white" type="submit">{editing ? 'Update' : 'Add'} Tab</button>
      </form>
      <table className="w-full text-left text-sm bg-white rounded shadow border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Order</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tabs.map(t => (
            <tr key={t.id} className="border-t">
              <td className="px-3 py-2">{t.name}</td>
              <td className="px-3 py-2">{t.order ?? 0}</td>
              <td className="flex gap-2 px-3 py-2">
                <button className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded" onClick={() => edit(t)}>
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button className="flex items-center gap-1 px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded" onClick={() => del(t.id)}>
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
