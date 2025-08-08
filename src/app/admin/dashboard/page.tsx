import React from 'react'
import { getDashboardData } from '@/lib/dashboard'

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded shadow border">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Admin Dashboard</h1>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Services" value={data.services} />
        <StatCard label="Branches" value={data.branches} />
        <StatCard label="Total Staff" value={data.staff.total} />
        <StatCard label="Customers" value={data.customers} />
        <StatCard label="Today's Bookings" value={data.bookings.today} />
        <StatCard label="Revenue" value={`₹${data.revenue.toFixed(2)}`} />
        <StatCard label="Today's Enquiries" value={data.enquiries.today} />
        <StatCard label="Open Enquiries" value={data.enquiries.open} />
      </section>

      <section className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
        <ul className="divide-y">
          {data.bookings.upcoming.map(b => (
            <li key={b.id} className="py-2 flex justify-between">
              <span>{b.date} {b.start}</span>
              <span>{b.customer ?? 'Walk-in'} with {b.staff.name}</span>
            </li>
          ))}
          {data.bookings.upcoming.length === 0 && (
            <li className="py-2">No upcoming appointments</li>
          )}
        </ul>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
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
        <div className="bg-white p-4 rounded shadow space-y-1">
          <h2 className="text-xl font-semibold mb-2">Enquiries</h2>
          <p>Today's Enquiries: {data.enquiries.today}</p>
          <p>Open Enquiries: {data.enquiries.open}</p>
        </div>
      </section>
    </div>
  )
}

