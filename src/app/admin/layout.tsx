'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const sections = [
  {
    heading: 'Dashboard',
    items: [{ href: '/admin/dashboard', label: 'Dashboard' }],
  },
  {
    heading: 'Salon Management',
    items: [
      { href: '/admin/appointments', label: 'Appointments' },
      { href: '/admin/scheduling', label: 'Scheduling' },
      { href: '/admin/staff', label: 'Staff' },
      { href: '/admin/branches', label: 'Branches' },
      { href: '/admin/service-categories', label: 'Service Categories' },
      { href: '/admin/services', label: 'Services' },
      { href: '/admin/price-history', label: 'Price History' },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen flex">
      <nav className="w-60 bg-gray-900 text-gray-200 p-4 space-y-4 overflow-y-auto">
        {sections.map(sec => (
          <div key={sec.heading}>
            <div className="uppercase text-xs text-gray-400 mb-1">{sec.heading}</div>
            <div className="space-y-1">
              {sec.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded hover:bg-gray-800 ${pathname === item.href ? 'bg-gray-800 font-semibold' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <main className="flex-1 p-6 overflow-x-auto">{children}</main>
    </div>
  )
}
