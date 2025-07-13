// File: src/app/customer/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

// Sidebar menu items
const MENU = [
  { label: 'My Profile',  icon: 'ri-user-3-line',       path: '/customer/profile' },
  { label: 'Appointments', icon: 'ri-calendar-check-line', path: '/customer/dashboard' },
  { label: 'My Coupons',   icon: 'ri-gift-line',          path: '/customer/coupons' },
];

function statusLabel(status: string, cancelReason?: string) {
  switch (status) {
    case 'pending':
      return <span className="inline-block bg-yellow-200 text-yellow-900 text-xs px-3 py-1 rounded-full font-bold">Pending</span>;
    case 'confirmed':
      return <span className="inline-block bg-green-300 text-green-900 text-xs px-3 py-1 rounded-full font-bold">Confirmed</span>;
    case 'completed':
      return <span className="inline-block bg-gray-300 text-gray-800 text-xs px-3 py-1 rounded-full font-bold">Completed</span>;
    case 'cancelled':
      return (
        <span className="inline-block bg-red-300 text-red-900 text-xs px-3 py-1 rounded-full font-bold">
          Cancelled
          {cancelReason && <small className="ml-1 text-[10px] text-red-700">({cancelReason})</small>}
        </span>
      );
    default:
      return null;
  }
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Ensure auth
  useEffect(() => {
    if (status === 'unauthenticated') signIn();
  }, [status]);

  const [bookings, setBookings] = useState<any[]>([]);
  const [activeMenu, setActiveMenu] = useState(1);
  const [showUpcoming, setShowUpcoming] = useState(true);

  // Fetch bookings
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;
    fetch(`/api/bookings?userId=${session.user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setBookings(data.bookings);
        else toast.error(data.error || 'Failed to load bookings');
      })
      .catch(() => toast.error('Failed to load bookings'));
  }, [status, session]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter(b =>
    b.date.slice(0, 10) >= today && ['pending', 'confirmed'].includes(b.status)
  );
  const past = bookings.filter(b =>
    b.date.slice(0, 10) < today || ['completed', 'cancelled'].includes(b.status)
  );

  return (
    <div className="min-h-screen bg-[#052b1e] flex">
      <Toaster richColors position="top-center" />

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col bg-black bg-opacity-80 border-r border-primary border-opacity-20 w-60 py-8 px-4 sticky top-0">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Greens Beauty" className="w-32 mb-4" draggable={false} />
          <span className="text-primary font-bold text-lg mb-1">{session?.user?.name || 'Guest'}</span>
          <span className="text-secondary text-xs">Customer</span>
        </div>
        <nav className="flex flex-col gap-2 mb-8">
          {MENU.map((item, idx) => (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium text-base transition-all ${
                activeMenu === idx
                  ? 'bg-primary text-black shadow'
                  : 'bg-transparent text-primary hover:bg-primary hover:text-black'
              }`}
              onClick={() => {
                setActiveMenu(idx);
                router.push(item.path);
              }}
            >
              <i className={`${item.icon} text-lg`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button
          className="mt-auto flex items-center gap-2 px-4 py-3 rounded-lg bg-[#133d28] text-primary hover:bg-red-500 hover:text-white font-bold transition-all"
          onClick={() => {/* implement logout */}}
        >
          <i className="ri-logout-box-r-line"></i>
          Logout
        </button>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-black bg-opacity-90 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Greens Beauty" className="w-24" />
          <span className="text-primary font-bold text-lg">{session?.user?.name || 'Guest'}</span>
        </div>
        <button
          className="bg-primary text-black font-bold rounded px-3 py-2"
          onClick={() => {/* mobile menu */}}
        >
          <i className="ri-menu-line text-lg"></i>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-4 md:pt-12 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="hidden md:flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-primary">My Appointments</h1>
            <button
              className="bg-primary text-black font-semibold px-6 py-2 rounded hover:bg-opacity-90 transition-all"
              onClick={() => router.push('/customer/book')}
            >
              <i className="ri-add-line mr-1"></i> New Booking
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 md:gap-6 mb-6">
            <button
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                showUpcoming ? 'bg-primary text-black' : 'bg-[#02180e] text-primary border border-primary'
              }`}
              onClick={() => setShowUpcoming(true)}
            >
              Upcoming Appointments
            </button>
            <button
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                !showUpcoming ? 'bg-primary text-black' : 'bg-[#02180e] text-primary border border-primary'
              }`}
              onClick={() => setShowUpcoming(false)}
            >
              Past & Completed
            </button>
          </div>

          {/* Booking Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {(showUpcoming ? upcoming : past).length === 0 ? (
              <div className="col-span-full text-center text-secondary text-lg py-20">
                No appointments found.
              </div>
            ) : (
              (showUpcoming ? upcoming : past).map(booking => (
                <div
                  key={booking.id}
                  className="bg-black bg-opacity-80 border border-primary border-opacity-20 rounded-2xl shadow-xl p-6 flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-primary font-bold text-lg">
                      {new Date(booking.date).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </span>
                    {statusLabel(booking.status, (booking as any).cancelReason)}
                  </div>

                  {/* Service & Branch */}
                  <div className="mb-2">
                    <p className="text-lg font-semibold text-primary">{booking.service.name}</p>
                    <p className="text-sm text-secondary">At {booking.branch.name}</p>
                  </div>

                  {/* Staff */}
                  {booking.staff && (
                    <p className="text-sm text-secondary">Staff: {booking.staff.name}</p>
                  )}

                  {/* Payment Status */}
                  <p className="text-sm mt-2">
                    Payment: <span className={booking.paid ? 'text-green-400' : 'text-red-400'}>
                      {booking.paid ? 'Paid' : 'Pending'}
                    </span>
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    {booking.status === 'pending' && (
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold"
                        onClick={() => toast.info('Cancel feature coming soon.')}
                      >
                        Cancel
                      </button>
                    )}
                    {booking.status === 'completed' && booking.invoiceUrl && (
                      <a
                        href={booking.invoiceUrl}
                        download
                        className="bg-primary text-black px-3 py-1 rounded text-sm font-semibold"
                      >
                        Download Invoice
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
