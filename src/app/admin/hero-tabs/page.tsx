'use client'
import { useEffect, useMemo, useState } from 'react'
import WysiwygEditor from '@/app/components/WysiwygEditor'
import { ArrowDown, ArrowUp, Pencil, Trash2, X } from 'lucide-react'
import Select, { MultiValue } from 'react-select'

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

type VariantSelectOption = {
  value: string
  label: string
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

  const handleImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
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

  const variantLabel = (variant: VariantOption) =>
    `${variant.categoryName} - ${variant.serviceName} (${variant.variantName})`

  const selectedVariantOptions = useMemo(() => {
    return form.variantIds
      .map(id => {
        const variant = variants.find(v => v.id === id)
        if (!variant) return null
        return {
          value: variant.id,
          label: variantLabel(variant),
        }
      })
      .filter(Boolean) as VariantSelectOption[]
  }, [form.variantIds, variants])

  const handleVariantChange = (vals: MultiValue<VariantSelectOption>) => {
    setForm(prev => ({ ...prev, variantIds: vals.map(v => v.value) }))
  }

  const moveVariant = (id: string, direction: 'up' | 'down') => {
    setForm(prev => {
      const currentIndex = prev.variantIds.indexOf(id)
      if (currentIndex === -1) return prev
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (targetIndex < 0 || targetIndex >= prev.variantIds.length) return prev
      const updated = [...prev.variantIds]
      ;[updated[currentIndex], updated[targetIndex]] = [
        updated[targetIndex],
        updated[currentIndex],
      ]
      return { ...prev, variantIds: updated }
    })
  }

  const removeVariant = (id: string) => {
    setForm(prev => ({
      ...prev,
      variantIds: prev.variantIds.filter(vId => vId !== id),
    }))
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
          {form.iconUrl && <img src={form.iconUrl} alt="Selected icon preview" className="h-16 mt-2" />}
        </div>
        <div>
          <label className="block font-medium mb-1">Background Image</label>
          <input type="file" accept="image/*" onChange={e => handleImage(e, 'backgroundUrl')} />
          {form.backgroundUrl && (
            <img src={form.backgroundUrl} alt="Selected background preview" className="h-16 mt-2" />
          )}
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
          <label className="block font-medium mb-1">Order</label>
          <input type="number" className="w-full p-2 rounded border" value={form.order ?? 0} onChange={e => setForm({ ...form, order: parseInt(e.target.value) })} />
        </div>
        <div>
          <label className="block font-medium mb-1">Service Variants</label>
          <Select
            isMulti
            className="basic-multi-select"
            classNamePrefix="select"
            options={variants.map(v => ({
              value: v.id,
              label: variantLabel(v),
            }))}
            value={selectedVariantOptions}
            onChange={handleVariantChange}
          />
        </div>
        {form.variantIds.length > 0 && (
          <div>
            <label className="block font-medium mb-2">Selected Service Order</label>
            <ul className="space-y-2">
              {form.variantIds.map((id, index) => {
                const variant = variants.find(v => v.id === id)
                if (!variant) return null
                const label = variantLabel(variant)
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between gap-3 rounded border border-gray-200 bg-gray-50 px-3 py-2"
                  >
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold mr-2">#{index + 1}</span>
                      <span>{label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="rounded p-1.5 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => moveVariant(id, 'up')}
                        disabled={index === 0}
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => moveVariant(id, 'down')}
                        disabled={index === form.variantIds.length - 1}
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-red-600 transition hover:bg-red-100"
                        onClick={() => removeVariant(id)}
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        <button className="bg-green-600 px-4 py-2 rounded text-white" type="submit">{editing ? 'Update' : 'Add'} Tab</button>
      </form>
      <table className="w-full text-left text-sm bg-white rounded shadow border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Icon</th>
            <th className="px-3 py-2">Order</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tabs.map(t => (
            <tr key={t.id} className="border-t">
              <td className="px-3 py-2">{t.name}</td>
              <td className="px-3 py-2">{t.iconUrl ? <img src={t.iconUrl} alt={`${t.name} icon`} className="h-10" /> : '—'}</td>
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
