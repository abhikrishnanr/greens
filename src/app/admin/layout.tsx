'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/appointments', label: 'Appointments' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/price-history', label: 'Price History' },
  { href: '/admin/staff', label: 'Staff' },
  { href: '/admin/scheduling', label: 'Scheduling' },
  { href: '/admin/branches', label: 'Branches' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen flex">
      <nav className="w-48 bg-gray-900 text-gray-200 p-4 space-y-2">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`block px-3 py-2 rounded hover:bg-gray-800 ${pathname === l.href ? 'bg-gray-800 font-semibold' : ''}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
