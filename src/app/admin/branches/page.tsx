'use client'
import { useEffect, useState } from 'react'

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
      <h1 className="text-2xl font-bold mb-4">Branch Management</h1>
      <form onSubmit={save} className="space-y-2 bg-white p-4 rounded shadow border mb-6">
        <input className="w-full p-2 rounded border" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input className="w-full p-2 rounded border" placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
        <input className="w-full p-2 rounded border" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
        <input className="w-full p-2 rounded border" placeholder="UPI ID" value={form.upiId} onChange={e => setForm({ ...form, upiId: e.target.value })} />
        <input className="w-full p-2 rounded border" placeholder="QR URL" value={form.qrUrl} onChange={e => setForm({ ...form, qrUrl: e.target.value })} />
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
              <td className="space-x-2 px-3 py-2">
                <button className="underline" onClick={() => edit(b)}>Edit</button>
                <button className="underline text-red-600" onClick={() => del(b.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
