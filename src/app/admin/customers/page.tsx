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

interface TopCustomer {
  id: string
  name: string | null
  phone: string | null
  count?: number
  total?: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'REMOVED'>('ALL')
  const [branchFilter, setBranchFilter] = useState('')
  const [branches, setBranches] = useState<Branch[]>([])
  const [topServices, setTopServices] = useState<TopCustomer[]>([])
  const [topBills, setTopBills] = useState<TopCustomer[]>([])

  const load = async () => {
    const url = branchFilter ? `/api/customers?branchId=${branchFilter}` : '/api/customers'
    const res = await fetch(url)
    const data = await res.json()
    if (data.success) setCustomers(data.customers)
  }

  const loadBranches = async () => {
    const res = await fetch('/api/branch')
    const data = await res.json()
    if (data.success) setBranches(data.branches)
  }

  const loadStats = async () => {
    const res = await fetch('/api/customers/stats')
    const data = await res.json()
    if (data.success) {
      setTopServices(data.topServices)
      setTopBills(data.topBills)
    }
  }

  useEffect(() => {
    loadBranches()
    loadStats()
  }, [])

  useEffect(() => { load() }, [branchFilter])

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

  const total = customers.length
  const active = customers.filter(c => !c.removed).length
  const removed = customers.filter(c => c.removed).length

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold">{active}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-sm text-gray-500">Removed</div>
          <div className="text-2xl font-bold">{removed}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-stretch">
        <div className="bg-white p-4 rounded shadow flex flex-col">
          <h2 className="font-semibold mb-2">Top by Services</h2>
          <ol className="space-y-1 flex-1">
            {topServices.map((c, idx) => (
              <li key={c.id}>
                {idx + 1}.{' '}
                <Link href={`/admin/customers/${c.id}`} className="text-green-700 underline">
                  {c.name || c.phone}
                </Link>{' '}
                ({c.count})
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-white p-4 rounded shadow flex flex-col">
          <h2 className="font-semibold mb-2">Top by Billing</h2>
          <ol className="space-y-1 flex-1">
            {topBills.map((c, idx) => (
              <li key={c.id}>
                {idx + 1}.{' '}
                <Link href={`/admin/customers/${c.id}`} className="text-green-700 underline">
                  {c.name || c.phone}
                </Link>{' '}
                (₹{(c.total || 0).toFixed(2)})
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-200 border border-gray-300"
        />
        <select
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
          className="p-2 rounded bg-gray-200 border border-gray-300"
        >
          <option value="">All Branches</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <div className="space-x-2">
          {['ALL', 'ACTIVE', 'REMOVED'].map(val => (
            <button
              key={val}
              onClick={() => setFilter(val as 'ALL' | 'ACTIVE' | 'REMOVED')}
              className={`px-3 py-1 rounded ${filter === val ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-3 py-2 border-b">#</th>
              <th className="px-3 py-2 border-b text-left">Name</th>
              <th className="px-3 py-2 border-b text-left">Phone</th>
              <th className="px-3 py-2 border-b text-left">Branch</th>
              <th className="px-3 py-2 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, idx) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b text-center">{idx + 1}</td>
                <td className="px-3 py-2 border-b">
                  <Link href={`/admin/customers/${c.id}`} className="text-green-700 underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-3 py-2 border-b">{c.phone}</td>
                <td className="px-3 py-2 border-b">{c.branch?.name}</td>
                <td className="px-3 py-2 border-b text-center">{c.removed ? 'Removed' : 'Active'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
