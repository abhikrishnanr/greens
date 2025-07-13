'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

export default function MyBookings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') signIn();
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/customer/my-bookings')
        .then(res => res.json())
        .then(data => {
          if (data.success) setBookings(data.bookings);
          else toast.error(data.error || 'Failed to load bookings');
        })
        .catch(err => {
          toast.error('Error loading bookings');
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-[#052b1e] flex">
      <Toaster richColors position="top-center" />

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col bg-black bg-opacity-80 border-r border-primary border-opacity-20 w-60 min-h-screen py-8 px-4 sticky top-0">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Greens Beauty" className="w-32 mb-4" draggable={false} />
          <span className="text-primary font-bold text-lg mb-1">{session?.user?.name}</span>
          <span className="text-secondary text-xs">Customer</span>
        </div>
        <nav className="flex flex-col gap-2 mb-8">
          <button onClick={() => router.push('/customer/profile')} className="text-left px-4 py-2 text-primary hover:bg-primary hover:text-black rounded">
            <i className="ri-user-line mr-2"></i> Profile
          </button>
          <button onClick={() => router.push('/customer/my-bookings')} className="text-left px-4 py-2 bg-primary text-black rounded font-bold">
            <i className="ri-calendar-check-line mr-2"></i> My Bookings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <i className="ri-calendar-check-line"></i> My Bookings
            </h1>
            <button onClick={() => router.push('/customer/book')} className="bg-primary text-black px-4 py-2 rounded font-semibold hover:bg-opacity-90">
              Book New Appointment
            </button>
          </div>

          {loading ? (
            <p className="text-white">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-400">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <div key={booking.id} className="bg-black bg-opacity-30 rounded p-4 text-white border border-primary">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-lg font-bold text-primary">{booking.service.name}</p>
                      <p className="text-sm text-gray-300">{booking.branch.name}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p>{new Date(booking.date).toLocaleString()}</p>
                      <p className={`font-semibold ${booking.status === 'cancelled' ? 'text-red-400' : booking.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>{booking.status}</p>
                    </div>
                  </div>
                  {booking.staff && (
                    <p className="text-sm text-gray-400">Staff: {booking.staff.name}</p>
                  )}
                  {booking.coupon && (
                    <p className="text-sm text-green-300">Coupon: {booking.coupon.code}</p>
                  )}
                  <p className="text-sm mt-2">Payment: <span className={booking.paid ? 'text-green-400' : 'text-red-400'}>{booking.paid ? 'Paid' : 'Pending'}</span></p>

                  <div className="mt-3 flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button className="bg-yellow-400 text-black px-3 py-1 rounded text-sm font-semibold" onClick={() => toast.info('Reschedule feature coming soon.')}>
                          Reschedule
                        </button>
                        <button className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold" onClick={() => toast.info('Cancel feature coming soon.')}>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
