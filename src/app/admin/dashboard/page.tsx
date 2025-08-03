'use client'
import { useEffect, useState } from 'react'
import {
  Banknote,
  CalendarDays,
  IndianRupee,
  MessageSquare,
  PhoneCall,
  Scissors,

} from 'lucide-react'

interface DashboardData {
  services: number
  bookings: {
    today: number
    upcoming: {
      id: string
      customer: string
      date: string
      start: string
      staff: { name: string }
    }[]
  }
  billing: {
    billedToday: number
    pending: number
  }
  enquiries: {
    today: number
    open: number
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/dashboard')
        if (!res.ok) throw new Error('failed to fetch')
        const json: DashboardData = await res.json()
        setData(json)
      } catch (err) {
        console.error('dashboard fetch error', err)
        setError(true)
      }
    }
    load()
  }, [])

  if (error) return <p className="p-4">Failed to load dashboard data</p>
  if (!data) return <p className="p-4">Loading...</p>

  const {
    services,
    bookings = { today: 0, upcoming: [] },
    billing = { billedToday: 0, pending: 0 },
    enquiries = { today: 0, open: 0 },
  } = data

  const stats = [
    { label: 'Active Services', value: services, icon: Scissors, color: 'bg-rose-500' },
    { label: 'Appointments Today', value: bookings.today, icon: CalendarDays, color: 'bg-indigo-500' },
    { label: 'Billed Today', value: billing.billedToday, icon: IndianRupee, color: 'bg-green-500' },
    { label: 'Enquiries Today', value: enquiries.today, icon: PhoneCall, color: 'bg-purple-500' },
    { label: 'Open Enquiries', value: enquiries.open, icon: MessageSquare, color: 'bg-orange-500' },
    { label: 'Pending Billing', value: billing.pending, icon: Banknote, color: 'bg-yellow-500' },

  ]

  return (
    <div className="space-y-10 p-6">
      <section className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-8 shadow">
        <h1 className="text-4xl font-bold mb-2">Salon Dashboard</h1>
        <p className="text-green-100">Overview of your salon performance</p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-6 rounded-lg shadow flex items-center">
            <div className={`${s.color} p-3 rounded-full text-white`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <CalendarDays className="h-5 w-5 text-green-600 mr-2" /> Upcoming Appointments
        </h2>
        {bookings.upcoming.length > 0 ? (
          <ul className="divide-y">
            {bookings.upcoming.map(b => (
              <li key={b.id} className="py-3 flex justify-between">
                <div>
                  <p className="font-medium">{b.customer || 'Walk-in'}</p>
                  <p className="text-sm text-gray-500">{b.date} at {b.start}</p>
                </div>
                <span className="text-sm text-gray-600">with {b.staff.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No upcoming appointments</p>
        )}
      </section>
    </div>
  )
}
