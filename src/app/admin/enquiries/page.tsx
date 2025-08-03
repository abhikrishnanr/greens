'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import WysiwygEditor from '@/app/components/WysiwygEditor'
import Select, { MultiValue } from 'react-select'
import {
  Phone,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  Edit3,
  Search,
  Save,
  User,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface VariantOption {
  id: string
  serviceId: string
  variantName: string
  serviceName: string
  categoryName: string
  duration?: number | null
  current?: { actualPrice: number; offerPrice?: number | null } | null
}

interface Enquiry {
  id: string
  enquiry: string | null
  variantIds: string[]
  createdAt: string
  status: string
  remark?: string | null
  customer?: { id: string; name: string | null; phone: string | null; gender: string | null }
}

interface Stats {
  today: number
  new: number
  processing: number
  closed: number
}

export default function EnquiriesPage() {
  const empty = { name: '', phone: '', gender: '', enquiry: '', variantIds: [] as string[] }
  const [phone, setPhone] = useState('')
  const [form, setForm] = useState(empty)
  const [prevEnquiries, setPrevEnquiries] = useState<Enquiry[]>([])
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [variants, setVariants] = useState<VariantOption[]>([])
  const [stats, setStats] = useState<Stats>({ today: 0, new: 0, processing: 0, closed: 0 })
  const [selected, setSelected] = useState<Enquiry | null>(null)
  const [modalStatus, setModalStatus] = useState('')
  const [modalRemark, setModalRemark] = useState('')
  const [filter, setFilter] = useState<string | null>(null)

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-green-100 text-green-800',
  }

  const bookServices = () => {
    if (!selected) return
    const params = new URLSearchParams()
    if (selected.customer?.name) params.set('name', selected.customer.name)
    if (selected.customer?.phone) params.set('phone', selected.customer.phone)
    if (selected.customer?.gender) params.set('gender', selected.customer.gender)
    if (selected.variantIds?.length) params.set('variants', selected.variantIds.join(','))
    window.location.href = `/admin/walk-in?${params.toString()}`
  }

  const loadEnquiries = async () => {
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

  const loadStats = async () => {
    const res = await fetch('/api/admin/enquiries/stats')
    if (res.ok) {
      const data = await res.json()
      setStats(data)
    }
  }

  useEffect(() => {
    loadEnquiries()
    loadVariants()
    loadStats()
  }, [])

  const search = async () => {
    if (!phone) return
    const res = await fetch(`/api/admin/enquiries?phone=${phone}`)
    if (res.ok) {
      const data = await res.json()
      setPrevEnquiries(data.enquiries || [])
      setForm({
        ...empty,
        phone,
        name: data.customer?.name || '',
        gender: data.customer?.gender || '',
      })
    }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm(empty)
    setPrevEnquiries([])
    setPhone('')
    loadEnquiries()
    loadStats()
  }

  const openModal = (e: Enquiry) => {
    setSelected(e)
    setModalStatus(e.status)
    setModalRemark(e.remark || '')
  }

  const updateStatus = async () => {
    if (!selected) return
    if (modalStatus === 'closed' && !modalRemark) return
    await fetch(`/api/admin/enquiries/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: modalStatus, remark: modalRemark }),
    })
    setSelected(null)
    loadEnquiries()
    loadStats()
  }

  const filteredEnquiries = filter
    ? enquiries.filter(e => {
        if (filter === 'today') {
          return new Date(e.createdAt).toDateString() === new Date().toDateString()
        }
        return e.status === filter
      })
    : enquiries

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Phone className="h-6 w-6 text-green-700" />
        <h1 className="text-2xl font-bold text-green-700">Enquiries</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-lg shadow cursor-pointer text-white flex items-center justify-between"
          style={{ backgroundColor: '#3b82f6' }}
          onClick={() => setFilter('today')}
        >
          <div>
            <div className="text-sm">Today</div>
            <div className="text-2xl font-bold">{stats.today}</div>
          </div>
          <Calendar className="h-6 w-6" />
        </div>
        <div
          className="p-4 rounded-lg shadow cursor-pointer text-white flex items-center justify-between"
          style={{ backgroundColor: '#10b981' }}
          onClick={() => setFilter('new')}
        >
          <div>
            <div className="text-sm">New</div>
            <div className="text-2xl font-bold">{stats.new}</div>
          </div>
          <Sparkles className="h-6 w-6" />
        </div>
        <div
          className="p-4 rounded-lg shadow cursor-pointer text-white flex items-center justify-between"
          style={{ backgroundColor: '#f59e0b' }}
          onClick={() => setFilter('processing')}
        >
          <div>
            <div className="text-sm">Under Processing</div>
            <div className="text-2xl font-bold">{stats.processing}</div>
          </div>
          <Clock className="h-6 w-6" />
        </div>
        <div
          className="p-4 rounded-lg shadow cursor-pointer text-white flex items-center justify-between"
          style={{ backgroundColor: '#6b7280' }}
          onClick={() => setFilter('closed')}
        >
          <div>
            <div className="text-sm">Closed</div>
            <div className="text-2xl font-bold">{stats.closed}</div>
          </div>
          <CheckCircle2 className="h-6 w-6" />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-4">
        <div className="flex gap-2">
          <input
            className="border p-2 flex-1 rounded"
            placeholder="Mobile number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <Button
            onClick={search}
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Search className="h-4 w-4 mr-1" /> Go
          </Button>
        </div>

        {form.phone && (
          <form onSubmit={save} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  className="w-full p-2 rounded border"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Gender</label>
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
                onChange={(vals: MultiValue<{ value: string; label: string }>) =>
                  setForm({ ...form, variantIds: vals.map(v => v.value) })
                }
              />
            </div>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white w-fit"
            >
              <Save className="h-4 w-4 mr-2" /> Save Enquiry
            </Button>
          </form>
        )}

        {prevEnquiries.length > 0 && (
          <div>
            <h2 className="font-semibold mb-2">Previous Enquiries</h2>
            <table className="w-full text-sm border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Remark</th>
                </tr>
              </thead>
              <tbody>
                {prevEnquiries.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      <Badge
                        variant="secondary"
                        className={`${statusColors[p.status] || ''} capitalize`}
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{p.remark || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <table className="w-full text-left text-sm bg-white rounded shadow border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2">Customer</th>
            <th className="px-3 py-2">Phone</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredEnquiries.map(e => (
            <tr key={e.id} className="border-t">
              <td className="px-3 py-2">
                {e.customer ? (
                  <Link
                    href={`/admin/customers/${e.customer.id}`}
                    className="text-green-700 hover:underline inline-flex items-center"
                  >
                    {e.customer.name || 'Unnamed'}
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-3 py-2">{e.customer?.phone || '-'}</td>
              <td className="px-3 py-2">
                <Badge
                  variant="secondary"
                  className={`${statusColors[e.status] || ''} capitalize`}
                >
                  {e.status}
                </Badge>
              </td>
              <td className="px-3 py-2">{new Date(e.createdAt).toLocaleDateString()}</td>
              <td className="px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openModal(e)}
                  className="text-green-700 hover:text-green-800"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow w-96 space-y-4 text-sm">
            <h2 className="font-semibold text-base">Update Enquiry</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Name: </span>
                {selected.customer?.name || '-'}
              </div>
              <div>
                <span className="font-medium">Phone: </span>
                {selected.customer?.phone || '-'}
              </div>
              <div>
                <span className="font-medium">Enquiry:</span>
                <div
                  className="mt-1 border p-2 rounded bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: selected.enquiry || '' }}
                />
              </div>
              <div>
                <span className="font-medium">Services:</span>
                <ul className="list-disc ml-5 mt-1">
                  {selected.variantIds.map(id => {
                    const v = variants.find(t => t.id === id)
                    return (
                      <li key={id}>
                        {v ? `${v.categoryName} - ${v.serviceName} (${v.variantName})` : id}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <select
                className="w-full p-2 rounded border"
                value={modalStatus}
                onChange={e => setModalStatus(e.target.value)}
              >
                <option value="new">New</option>
                <option value="processing">In Process</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Remark</label>
              <textarea
                className="w-full p-2 rounded border"
                value={modalRemark}
                onChange={e => setModalRemark(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {selected.customer && (
                  <Link
                    href={`/admin/customers/${selected.customer.id}`}
                    className="inline-flex items-center px-3 py-1 text-sm text-green-700 border border-green-600 rounded hover:bg-green-50"
                  >
                    <User className="h-4 w-4 mr-1" /> Profile
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bookServices}
                  className="border-green-600 text-green-700 hover:bg-green-50"
                >
                  <BookOpen className="h-4 w-4 mr-1" /> Book Services
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={updateStatus}
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
