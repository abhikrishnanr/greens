'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Download, FileText, PlusCircle } from 'lucide-react'

interface Schedule {
  id: string
  date: string
  service: string
}

interface Bill {
  id: string
  date: string
  amount: number
}

export default function CustomerDashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [bills, setBills] = useState<Bill[]>([])

  useEffect(() => {
    fetch('/api/customer/schedules')
      .then((r) => r.json())
      .then((d) => setSchedules(d.schedules ?? []))
      .catch(() => setSchedules([]))
    fetch('/api/customer/bills')
      .then((r) => r.json())
      .then((d) => setBills(d.bills ?? []))
      .catch(() => setBills([]))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-emerald-900">Your Dashboard</h1>
          <p className="text-emerald-700">Track appointments and billing in style</p>
        </header>
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/70 backdrop-blur rounded-xl shadow-lg p-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-emerald-900 mb-4">
              <Calendar className="text-emerald-600" /> Upcoming Schedules
            </h2>
            <ul className="space-y-3">
              {schedules.length ? (
                schedules.map((s) => (
                  <li key={s.id} className="flex justify-between items-center">
                    <span>
                      {s.date} - {s.service}
                    </span>
                    <Link
                      href={`/customer/schedule/${s.id}`}
                      className="text-emerald-600 hover:underline"
                    >
                      View
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-emerald-700">No schedules yet.</li>
              )}
            </ul>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl shadow-lg p-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-emerald-900 mb-4">
              <FileText className="text-emerald-600" /> Billing History
            </h2>
            <ul className="space-y-3">
              {bills.length ? (
                bills.map((b) => (
                  <li key={b.id} className="flex justify-between items-center">
                    <span>
                      {b.date} - ₹{b.amount}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/api/customer/bills/${b.id}`}
                        className="text-emerald-600 hover:underline"
                      >
                        View
                      </Link>
                      <Link
                        href={`/api/customer/bills/${b.id}?download=1`}
                        className="text-emerald-600 hover:underline flex items-center"
                      >
                        <Download size={16} />
                      </Link>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-emerald-700">No bills yet.</li>
              )}
            </ul>
          </div>
        </section>
        <div className="text-center">
          <Link
            href="/book-appointment"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow hover:bg-emerald-700"
          >
            <PlusCircle /> New Booking
          </Link>
        </div>
      </div>
    </div>
  )
}
