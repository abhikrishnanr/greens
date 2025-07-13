'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { signOut } from 'next-auth/react'
import {
  MdDashboard,
  MdEvent,
  MdSchedule,
  MdPeople,
  MdStore,
  MdCategory,
  MdDesignServices,
  MdHistory,
  MdLogout,
} from 'react-icons/md'
import type { IconType } from 'react-icons'

const sections: {
  heading: string
  items: { href: string; label: string; icon: IconType }[]
}[] = [
  {
    heading: 'Dashboard',
    items: [{ href: '/admin/dashboard', label: 'Dashboard', icon: MdDashboard }],
  },
  {
    heading: 'Salon Management',
    items: [
      { href: '/admin/appointments', label: 'Appointments', icon: MdEvent },
      { href: '/admin/scheduling', label: 'Scheduling', icon: MdSchedule },
      { href: '/admin/staff', label: 'Staff', icon: MdPeople },
      { href: '/admin/branches', label: 'Branches', icon: MdStore },
      {
        href: '/admin/service-categories',
        label: 'Service Categories',
        icon: MdCategory,
      },
      { href: '/admin/services', label: 'Services', icon: MdDesignServices },
      { href: '/admin/tier-price-history', label: 'Tier Price History', icon: MdHistory },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen flex flex-col text-gray-900 bg-green-50">
      <header className="flex items-center justify-between bg-green-800 text-green-100 px-6 py-3">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="Greens" className="h-8 w-auto" />
          <span className="font-bold">Admin</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
        >
          <MdLogout className="text-lg" /> Logout
        </button>
      </header>
      <div className="flex flex-1">
        <nav className="w-60 bg-gradient-to-b from-green-900 to-green-700 text-green-100 p-4 space-y-4 overflow-y-auto">
          {sections.map(sec => (
            <div key={sec.heading}>
              <div className="uppercase text-xs text-green-200 mb-1">{sec.heading}</div>
              <div className="space-y-1">
                {sec.items.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-green-600 ${pathname === item.href ? 'bg-green-600 font-semibold text-white' : ''}`}
                  >
                    <item.icon className="text-lg" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <main className="flex-1 p-6 overflow-x-auto">{children}</main>
      </div>
    </div>
  )
}
