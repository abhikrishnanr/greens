'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Calendar, Download, FileText, PlusCircle } from 'lucide-react'
import Header from '@/components/Header'

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
  const { data: session } = useSession()

  useEffect(() => {
    fetch('/api/customer/schedules')
      .then((r) => r.json())
      .then((d) => {
        const today = new Date().toLocaleDateString('en-CA', {
          timeZone: 'Asia/Kolkata',
        })
        const upcoming = (d.schedules ?? []).filter((s: Schedule) => s.date >= today)
        setSchedules(upcoming)
      })
      .catch(() => setSchedules([]))
    fetch('/api/customer/bills')
      .then((r) => r.json())
      .then((d) => setBills(d.bills ?? []))
      .catch(() => setBills([]))
  }, [])

  const totalServices = bills.length
  const totalPaid = bills.reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <Header />
      <div className="max-w-5xl mx-auto space-y-8 p-8">
        <div className="flex flex-col items-center gap-4">
          {session?.user && (
            <>
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'avatar'}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl">
                  {session.user.name?.[0] || 'U'}
                </div>
              )}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-emerald-900">{session.user.name}</h1>
                <p className="text-emerald-700">{session.user.gender}</p>
                <p className="text-emerald-700">{session.user.phone}</p>
              </div>
            </>
          )}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="text-emerald-900 text-2xl font-bold">{totalServices}</p>
              <p className="text-emerald-700">Services Taken</p>
            </div>
            <div className="text-center">
              <p className="text-emerald-900 text-2xl font-bold">₹{totalPaid}</p>
              <p className="text-emerald-700">Total Paid</p>
            </div>
          </div>
        </div>
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
                        href={`/customer/bills/${b.id}`}
                        className="text-emerald-600 hover:underline"
                      >
                        View
                      </Link>
                      <Link
                        href={`/customer/bills/${b.id}?download=1`}
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
