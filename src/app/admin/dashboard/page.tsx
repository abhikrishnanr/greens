import React from 'react'
import Link from 'next/link'
import { getDashboardData } from '@/lib/dashboard'
import {
  Scissors,
  MapPin,
  Users,
  User,
  CalendarCheck,
  IndianRupee,
  MessageCircle,
} from 'lucide-react'

interface StatCardProps {
  label: string
  value: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
  href?: string
  subtext?: string
}

function StatCard({ label, value, icon: Icon, color, bg, href, subtext }: StatCardProps) {
  const content = (
    <div className="bg-white p-4 rounded shadow border flex items-center space-x-4 hover:shadow-md transition">
      <div className={`p-2 rounded-full ${bg}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold leading-tight">{value}</div>
        {subtext && <div className="text-xs text-gray-400">{subtext}</div>}
      </div>
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Admin Dashboard</h1>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Services"
          value={data.services}
          icon={Scissors}
          color="text-blue-600"
          bg="bg-blue-100"
          href="/admin/services"
        />
        <StatCard
          label="Branches"
          value={data.branches}
          icon={MapPin}
          color="text-purple-600"
          bg="bg-purple-100"
          href="/admin/branches"
        />
        <StatCard
          label="Total Staff"
          value={data.staff.total}
          icon={Users}
          color="text-amber-600"
          bg="bg-amber-100"
          href="/admin/staff"
        />
        <StatCard
          label="Customers"
          value={data.customers}
          icon={User}
          color="text-green-600"
          bg="bg-green-100"
          href="/admin/customers"
        />
        <StatCard
          label="Total Bookings"
          value={data.bookings.total}
          icon={CalendarCheck}
          color="text-pink-600"
          bg="bg-pink-100"
          href="/admin/billing-history"
        />
        <StatCard
          label="Today's Bookings"
          value={data.bookings.today}
          icon={CalendarCheck}
          color="text-pink-600"
          bg="bg-pink-100"
          href="/admin/billing-history"
        />
        <StatCard
          label="Total Revenue"
          value={`₹${data.revenue.total.toFixed(2)}`}
          subtext={`GST ₹${data.revenue.gstTotal.toFixed(2)}`}
          icon={IndianRupee}
          color="text-teal-600"
          bg="bg-teal-100"
          href="/admin/billing-history"
        />
        <StatCard
          label="Today's Revenue"
          value={`₹${data.revenue.today.toFixed(2)}`}
          subtext={`GST ₹${data.revenue.gstToday.toFixed(2)}`}
          icon={IndianRupee}
          color="text-teal-600"
          bg="bg-teal-100"
          href="/admin/billing-history"
        />
        <StatCard
          label="Today's Enquiries"
          value={data.enquiries.today}
          icon={MessageCircle}
          color="text-red-600"
          bg="bg-red-100"
          href="/admin/enquiries"
        />
        <StatCard
          label="Open Enquiries"
          value={data.enquiries.open}
          icon={MessageCircle}
          color="text-red-600"
          bg="bg-red-100"
          href="/admin/enquiries"
        />
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

