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
      <form onSubmit={save} className="space-y-2 bg-black p-4 rounded mb-6">
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="UPI ID" value={form.upiId} onChange={e => setForm({ ...form, upiId: e.target.value })} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="QR URL" value={form.qrUrl} onChange={e => setForm({ ...form, qrUrl: e.target.value })} />
        <button className="bg-green-600 px-4 py-2 rounded" type="submit">{editing ? 'Update' : 'Add'} Branch</button>
      </form>
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {branches.map(b => (
            <tr key={b.id} className="border-t border-gray-700">
              <td>{b.name}</td>
              <td>{b.phone}</td>
              <td className="space-x-2">
                <button className="underline" onClick={() => edit(b)}>Edit</button>
                <button className="underline text-red-400" onClick={() => del(b.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
