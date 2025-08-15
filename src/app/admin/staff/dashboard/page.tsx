'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarCheck, IndianRupee, Users } from 'lucide-react'

interface DashboardData {
  totalBookings: number
  todayBookings: number
  revenue: { total: number; today: number }
  upcoming: { id: string; customer: string | null; date: string; start: string }[]
}

export default function StaffDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/staff/dashboard')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData({ totalBookings: 0, todayBookings: 0, revenue: { total: 0, today: 0 }, upcoming: [] }))
  }, [])

  if (!data) return <div>Loading...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-green-700">Staff Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-green-600" /> {data.totalBookings}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-green-600" /> {data.todayBookings}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-green-600" /> {data.revenue.total.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-green-600" /> {data.revenue.today.toFixed(2)}
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Upcoming Appointments</h2>
        <div className="bg-white rounded shadow">
          <ul className="divide-y">
            {data.upcoming.map((b) => (
              <li key={b.id} className="p-2 flex justify-between">
                <span>
                  {b.date} {b.start}
                </span>
                <span>{b.customer ?? 'Walk-in'}</span>
              </li>
            ))}
            {data.upcoming.length === 0 && <li className="p-2">No upcoming appointments</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
