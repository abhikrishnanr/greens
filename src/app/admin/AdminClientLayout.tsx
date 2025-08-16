'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { LoadingProvider } from '@/contexts/LoadingContext'
import Loader from '@/components/Loader'

import {
  MdDashboard,
  MdPeople,
  MdStore,
  MdCategory,
  MdDesignServices,
    MdStar,
    MdHistory,
    MdPayment,
    MdLogout,
    MdEvent,
    MdReceipt,
    MdMenu,
    MdViewCarousel,
    MdQuestionAnswer,
    MdLocalOffer,
    MdWorkspacePremium,
    MdInfo,
    MdWork,
    MdSchool,
    MdPhoto,
  } from 'react-icons/md'
import type { IconType } from 'react-icons'

const adminSections: {
  heading: string
  items: { href: string; label: string; icon: IconType }[]
}[] = [
  {
    heading: 'Dashboard',
    items: [{ href: '/admin/dashboard', label: 'Dashboard', icon: MdDashboard }],
  },
  {
    heading: 'Appointments & Billing',
    items: [
      { href: '/admin/enquiries', label: 'Enquiries', icon: MdQuestionAnswer },
      { href: '/admin/walk-in', label: 'Walk-In Booking', icon: MdEvent },
      { href: '/admin/billing', label: 'New Billing', icon: MdReceipt },
      { href: '/admin/billing-history', label: 'Billing History', icon: MdHistory },
      { href: '/admin/paylater-bills', label: 'Pay Later', icon: MdPayment },
    ],
  },
  {
    heading: 'People',
    items: [
      { href: '/admin/staff', label: 'Staff', icon: MdPeople },
      { href: '/admin/customers', label: 'Customers', icon: MdPeople },
    ],
  },
    {
      heading: 'Location & Setup',
      items: [
        { href: '/admin/branches', label: 'Branches', icon: MdStore },
        { href: '/admin/hero-tabs', label: 'Hero Banners', icon: MdViewCarousel },
      ],
    },
    {
      heading: 'Website',
      items: [
        { href: '/admin/about', label: 'About Greens', icon: MdInfo },
        { href: '/admin/jobs', label: 'Jobs @ Greens', icon: MdWork },
        { href: '/admin/beauty-education', label: 'Beauty Education', icon: MdSchool },
        { href: '/admin/gallery', label: 'Gallery', icon: MdPhoto },
      ],
    },
    {
      heading: 'Services',
      items: [
        { href: '/admin/service-categories', label: 'Categories', icon: MdCategory },
        { href: '/admin/services', label: 'Services', icon: MdDesignServices },
      { href: '/admin/featured-services', label: 'Featured Services', icon: MdStar },
      { href: '/admin/limited-time-offers', label: 'Offers', icon: MdLocalOffer },
      { href: '/admin/premium-services', label: 'Premium Services', icon: MdWorkspacePremium },
      { href: '/admin/variant-price-history', label: 'Price History', icon: MdHistory },
    ],
  },
  {
    heading: 'Settings',
    items: [{ href: '/admin/users', label: 'Staff Roles', icon: MdPeople }],
  },
]

const staffSections: {
  heading: string
  items: { href: string; label: string; icon: IconType }[]
}[] = [
  {
    heading: 'Staff',
    items: [
      { href: '/admin/staff/assignments', label: 'Assignments', icon: MdEvent },
      { href: '/admin/staff/reports', label: 'Reports', icon: MdHistory },
    ],
  },
]

export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const role = session?.user?.role
  const sections = role === 'admin' ? adminSections : staffSections
  const formatRole = (r?: string) =>
    r ? r.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : ''

  const handleLogout = async () => {
    await fetch('/api/auth/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: '' }),
    })
    await signOut({ redirect: false, callbackUrl: '/login' })
    router.push('/login')
  }

  return (
    <LoadingProvider>
      <Loader />
      <div className="min-h-screen flex flex-col text-gray-900 bg-green-50">
        {/* Header */}
        <header className="flex items-center justify-between bg-green-800 text-green-100 px-4 md:px-6 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 -ml-2"
              aria-label="Open menu"
            >
              <MdMenu className="text-2xl" />
            </button>
            <Link href={role === 'admin' ? '/admin/dashboard' : '/admin/staff/assignments'} className="flex items-center gap-2">
              <img src="/logo.png" alt="Greens" className="h-8 w-auto" />
              <span className="font-bold">{role === 'admin' ? 'Admin' : 'Staff'}</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session?.user && (
              <div className="flex items-center gap-2 bg-green-700/40 px-2 py-1 rounded">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'avatar'}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-sm">
                    {session.user.name?.[0] || 'U'}
                  </span>
                )}
                <div className="leading-tight">
                  <div className="font-semibold">{session.user.name}</div>
                  <div className="text-xs text-green-200">{formatRole(session.user.role)}</div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              <MdLogout className="text-lg" /> Logout
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {open && (
            <div
              className="fixed inset-0 bg-black/50 z-20 md:hidden"
              onClick={() => setOpen(false)}
            />
          )}

          {/* Sidebar */}
          <nav
            className={`fixed md:static top-0 left-0 h-full w-60 bg-green-900 text-white p-4 space-y-4 shadow-lg z-30 transform transition-transform ${
              open ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}
          >
            {sections.map((sec) => (
              <div key={sec.heading}>
                <div className="uppercase text-xs text-green-200 mb-1">{sec.heading}</div>
                <div className="space-y-1">
                  {sec.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-green-600 ${
                        pathname === item.href ? 'bg-green-600 font-semibold text-white' : ''
                      }`}
                    >
                      <item.icon className="text-lg" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Main Content */}
          <main
            className={`flex-1 p-4 md:p-6 overflow-x-auto transform transition-transform ${
              open ? 'translate-x-60' : ''
            } md:translate-x-0`}
          >
            {children}
          </main>
        </div>
      </div>
    </LoadingProvider>
  )
}
