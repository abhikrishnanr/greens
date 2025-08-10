'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'

interface Bill {
  id: string
  service: string
  amountAfter: number
  createdAt: string
}

export default function BillPage() {
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const [bill, setBill] = useState<Bill | null>(null)

  useEffect(() => {
    fetch(`/api/customer/bills/${params.id}`)
      .then((r) => r.json())
      .then((d) => setBill(d.bill))
  }, [params.id])

  useEffect(() => {
    if (search.get('download') && bill) {
      window.print()
    }
  }, [search, bill])

  if (!bill) return <div className="p-8">Loading...</div>

  const date = bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('en-IN') : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <Header />
      <div className="max-w-xl mx-auto bg-white p-8 mt-8 shadow rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Bill Details</h1>
        <p className="mb-2">Date: {date}</p>
        <p className="mb-2">Service: {bill.service}</p>
        <p className="mb-4">Amount Paid: ₹{bill.amountAfter}</p>
        <button
          onClick={() => window.print()}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded"
        >
          Print / Download
        </button>
      </div>
    </div>
  )
}
