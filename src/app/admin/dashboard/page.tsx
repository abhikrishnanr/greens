'use client'
import { useEffect, useState } from 'react'

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

  if (!data) return <p>Loading...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-green-700">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow border">
          <div className="text-sm text-gray-500">Bookings</div>
          <div className="text-2xl font-bold">{data.bookings}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <div className="text-sm text-gray-500">Services</div>
          <div className="text-2xl font-bold">{data.services}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <div className="text-sm text-gray-500">Staff</div>
          <div className="text-2xl font-bold">{data.staff}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <div className="text-sm text-gray-500">Branches</div>
          <div className="text-2xl font-bold">{data.branches}</div>
        </div>
      </div>
    </div>
  )
}
