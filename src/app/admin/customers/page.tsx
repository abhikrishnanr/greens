'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Branch { id: string; name: string }
interface Customer {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  gender: string | null
  removed: boolean
  branch?: Branch | null
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL'|'ACTIVE'|'REMOVED'>('ALL')

  const load = async () => {
    const res = await fetch('/api/customers')
    const data = await res.json()
    if (data.success) setCustomers(data.customers)
  }

  useEffect(() => { load() }, [])

  const filtered = customers
    .filter(c => {
      if (filter === 'ALL') return true
      return filter === 'REMOVED' ? c.removed : !c.removed
    })
    .filter(c => {
      const q = search.toLowerCase()
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q)
      )
    })

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-200 border border-gray-300"
        />
        <div className="space-x-2">
          {['ALL','ACTIVE','REMOVED'].map(val => (
            <button
              key={val}
              onClick={() => setFilter(val as any)}
              className={`px-3 py-1 rounded ${filter===val ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
        {filtered.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-xl border border-gray-300 shadow-lg hover:shadow-xl">
            <h2 className="text-xl font-semibold mb-2">{c.name}</h2>
            <p className="text-sm text-gray-600">{c.phone}</p>
            {c.email && <p className="text-sm text-gray-600">{c.email}</p>}
            <p className="text-sm text-gray-600">{c.gender}</p>
            {c.branch && <p className="text-sm text-gray-600">{c.branch.name}</p>}
            <Link href={`/admin/customers/${c.id}`} className="mt-4 inline-block text-green-700 underline">View Profile</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
