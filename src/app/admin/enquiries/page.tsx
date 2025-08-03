'use client'

import { useEffect, useState } from 'react'
import WysiwygEditor from '@/app/components/WysiwygEditor'
import Select from 'react-select'

interface VariantOption {
  id: string
  variantName: string
  serviceName: string
  categoryName: string
}

interface Enquiry {
  id: string
  enquiry: string | null
  variantIds: string[]
  createdAt: string
  customer: { name: string | null; phone: string | null; gender: string | null }
}

export default function EnquiriesPage() {
  const empty = { name: '', phone: '', gender: '', enquiry: '', variantIds: [] as string[] }
  const [form, setForm] = useState(empty)
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [variants, setVariants] = useState<VariantOption[]>([])

  const load = async () => {
    const res = await fetch('/api/admin/enquiries')
    if (res.ok) {
      const data = await res.json()
      setEnquiries(data)
    }
  }

  const loadVariants = async () => {
    const res = await fetch('/api/admin/service-variants/all')
    if (res.ok) {
      const data = await res.json()
      setVariants(data)
    }
  }

  useEffect(() => {
    load()
    loadVariants()
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm(empty)
    load()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Enquiries</h1>
      <form onSubmit={save} className="space-y-4 bg-white p-6 rounded shadow border mb-6">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            className="w-full p-2 rounded border"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Mobile</label>
          <input
            className="w-full p-2 rounded border"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Gender</label>
          <select
            className="w-full p-2 rounded border"
            value={form.gender}
            onChange={e => setForm({ ...form, gender: e.target.value })}
            required
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Enquiry</label>
          <WysiwygEditor value={form.enquiry} onChange={val => setForm({ ...form, enquiry: val })} />
        </div>
        <div>
          <label className="block font-medium mb-1">Services</label>
          <Select
            isMulti
            classNamePrefix="select"
            options={variants.map(v => ({
              value: v.id,
              label: `${v.categoryName} - ${v.serviceName} (${v.variantName})`,
            }))}
            value={variants
              .filter(v => form.variantIds.includes(v.id))
              .map(v => ({
                value: v.id,
                label: `${v.categoryName} - ${v.serviceName} (${v.variantName})`,
              }))}
            onChange={(vals: any) => setForm({ ...form, variantIds: vals.map((v: any) => v.value) })}
          />
        </div>
        <button className="bg-green-600 px-4 py-2 rounded text-white" type="submit">
          Save Enquiry
        </button>
      </form>
      <table className="w-full text-left text-sm bg-white rounded shadow border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2">Customer</th>
            <th className="px-3 py-2">Phone</th>
            <th className="px-3 py-2">Services</th>
            <th className="px-3 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map(e => (
            <tr key={e.id} className="border-t">
              <td className="px-3 py-2">{e.customer?.name || '-'}</td>
              <td className="px-3 py-2">{e.customer?.phone || '-'}</td>
              <td className="px-3 py-2">{e.variantIds.length}</td>
              <td className="px-3 py-2">{new Date(e.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
