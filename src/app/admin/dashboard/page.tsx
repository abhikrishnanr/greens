'use client'
import { useEffect, useState } from 'react'

interface DashboardData {
  services: number
  branches: number
  staff: {
    total: number
    active: number
    removed: number
  }
  bookings: {
    total: number
    today: number
    upcoming: {
      id: string
      customer: string
      date: string
      start: string
      staff: { name: string }
    }[]
  }
  pricing: {
    avgActualPrice: number
    avgOfferPrice: number | null
    activeOffers: number
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <p>Loading...</p>

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Admin Dashboard</h1>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow border">
          <div className="text-sm text-gray-500">Services</div>
          <div className="text-2xl font-bold">{data.services}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <div className="text-sm text-gray-500">Branches</div>
          <div className="text-2xl font-bold">{data.branches}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <div className="text-sm text-gray-500">Total Staff</div>
          <div className="text-2xl font-bold">{data.staff.total}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <div className="text-sm text-gray-500">Today's Bookings</div>
          <div className="text-2xl font-bold">{data.bookings.today}</div>
        </div>
      </section>

      <section className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
        <ul className="divide-y">
          {data.bookings.upcoming.map(b => (
            <li key={b.id} className="py-2 flex justify-between">
              <span>{b.date} {b.start}</span>
              <span>{b.customer} with {b.staff.name}</span>
            </li>
          ))}
          {data.bookings.upcoming.length === 0 && (
            <li className="py-2">No upcoming appointments</li>
          )}
        </ul>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow space-y-1">
          <h2 className="text-xl font-semibold mb-2">Staff Statistics</h2>
          <p>Total Staff: {data.staff.total}</p>
          <p>Active: {data.staff.active}</p>
          <p>Removed: {data.staff.removed}</p>
        </div>
        <div className="bg-white p-4 rounded shadow space-y-1">
          <h2 className="text-xl font-semibold mb-2">Pricing &amp; Offers</h2>
          <p>Average Price: ₹{data.pricing.avgActualPrice.toFixed(2)}</p>
          {data.pricing.avgOfferPrice !== null && (
            <p>Average Offer: ₹{data.pricing.avgOfferPrice.toFixed(2)}</p>
          )}
          <p>Active Offers: {data.pricing.activeOffers}</p>
        </div>
      </section>
    </div>
  )
}