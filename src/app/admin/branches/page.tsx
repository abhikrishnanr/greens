'use client'
import { useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

interface Branch {
  id: string
  name: string
  address: string
  phone: string
  upiId?: string
  qrUrl?: string
}

export default function BranchesAdmin() {
  const emptyForm = { id: '', name: '', address: '', phone: '', upiId: '', qrUrl: '' }
  const [branches, setBranches] = useState<Branch[]>([])
  const [form, setForm] = useState<Branch>(emptyForm)
  const [editing, setEditing] = useState(false)

  const load = async () => {
    const res = await fetch('/api/branch')
    const data = await res.json()
    if (data.success) setBranches(data.branches)
  }

  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    await fetch('/api/branch', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm(emptyForm)
    setEditing(false)
    load()
  }

  const edit = (b: Branch) => {
    setForm(b)
    setEditing(true)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this branch?')) return
    await fetch('/api/branch', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Branch Management</h1>
      <form onSubmit={save} className="space-y-4 bg-white p-6 rounded shadow border mb-6">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input className="w-full p-2 rounded border" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <small className="text-gray-500">Branch name</small>
        </div>
        <div>
          <label className="block font-medium mb-1">Address</label>
          <input className="w-full p-2 rounded border" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
          <small className="text-gray-500">Full address of branch</small>
        </div>
        <div>
          <label className="block font-medium mb-1">Phone</label>
          <input className="w-full p-2 rounded border" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
          <small className="text-gray-500">Contact number</small>
        </div>
        <div>
          <label className="block font-medium mb-1">UPI ID</label>
          <input className="w-full p-2 rounded border" value={form.upiId} onChange={e => setForm({ ...form, upiId: e.target.value })} />
          <small className="text-gray-500">Optional UPI payment ID</small>
        </div>
        <div>
          <label className="block font-medium mb-1">QR URL</label>
          <input className="w-full p-2 rounded border" value={form.qrUrl} onChange={e => setForm({ ...form, qrUrl: e.target.value })} />
          <small className="text-gray-500">Link to payment QR image</small>
        </div>
        <button className="bg-green-600 px-4 py-2 rounded text-white" type="submit">{editing ? 'Update' : 'Add'} Branch</button>
      </form>
      <table className="w-full text-left text-sm bg-white rounded shadow border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Phone</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {branches.map(b => (
            <tr key={b.id} className="border-t">
              <td className="px-3 py-2">{b.name}</td>
              <td className="px-3 py-2">{b.phone}</td>
              <td className="flex gap-2 px-3 py-2">
                <button
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                  onClick={() => edit(b)}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                  onClick={() => del(b.id)}
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
