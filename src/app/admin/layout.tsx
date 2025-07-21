'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { LoadingProvider } from '@/contexts/LoadingContext'
import Loader from '@/components/Loader'
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
  MdMenu,
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
  const [open, setOpen] = useState(false)
  return (
    <LoadingProvider>
      <Loader />
      <div className="min-h-screen flex flex-col text-gray-900 bg-green-50">
      <header className="flex items-center justify-between bg-green-800 text-green-100 px-4 md:px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 -ml-2"
            aria-label="Open menu"
          >
            <MdMenu className="text-2xl" />
          </button>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Greens" className="h-8 w-auto" />
            <span className="font-bold">Admin</span>
          </Link>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
        >
          <MdLogout className="text-lg" /> Logout
        </button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {open && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
<nav className={`fixed md:static top-0 left-0 h-full w-60 bg-green-900  text-white p-4 space-y-4 shadow-lg z-30 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          {sections.map(sec => (
            <div key={sec.heading}>
              <div className="uppercase text-xs text-green-200 mb-1">{sec.heading}</div>
              <div className="space-y-1">
                {sec.items.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
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
        <main
          className={`flex-1 p-4 md:p-6 overflow-x-auto transform transition-transform ${open ? 'translate-x-60' : ''} md:translate-x-0`}
        >
          {children}
        </main>
      </div>
      </div>
    </LoadingProvider>
  )
}
