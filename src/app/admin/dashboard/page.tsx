'use client'
import { useEffect, useState } from 'react'
import LoadingOverlay from '@/components/LoadingOverlay'

interface Metrics {
  bookings: number
  services: number
  staff: number
  branches: number
}

export default function DashboardPage() {
  const [data, setData] = useState<Metrics | null>(null)
  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(setData)
  }, [])

  const metrics = data || { bookings: 0, services: 0, staff: 0, branches: 0 }


  return (
    <div className="space-y-4">
      <LoadingOverlay show={!data} />
      <h1 className="text-2xl font-bold text-green-700">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow border">
      <div className="text-sm text-gray-500">Bookings</div>
      <div className="text-2xl font-bold">{metrics.bookings}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border">
      <div className="text-sm text-gray-500">Services</div>
      <div className="text-2xl font-bold">{metrics.services}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border">
      <div className="text-sm text-gray-500">Staff</div>
      <div className="text-2xl font-bold">{metrics.staff}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border">
      <div className="text-sm text-gray-500">Branches</div>
      <div className="text-2xl font-bold">{metrics.branches}</div>
        </div>
      </div>
    </div>
  )
}
