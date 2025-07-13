'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percent' | 'amount';
  discountValue: number;
  startDate: string;
  endDate:   string;
  minAmount?: number;
  maxRedemptions?: number;
  timesUsed: number;
}

export default function MyCouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') return signIn();
    if (status === 'authenticated') {
      fetch('/api/customer/coupons')
        .then(r => r.json())
        .then(data => {
          if (data.success) setCoupons(data.coupons);
          else toast.error(data.error);
        })
        .catch(() => toast.error('Failed to load coupons'))
        .finally(() => setLoading(false));
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-[#052b1e] flex">
      <Toaster richColors position="top-center" />

      {/* reuse same Sidebar component as other pages */}
      {/* …sidebar omitted for brevity… */}

      <main className="flex-1 px-4 pt-12 pb-12">
        <div className="max-w-3xl mx-auto bg-black bg-opacity-80 rounded-xl shadow p-6">
          <h1 className="text-3xl font-bold text-primary mb-6 text-center">My Coupons</h1>
          {loading ? (
            <p className="text-primary text-center">Loading…</p>
          ) : coupons.length === 0 ? (
            <p className="text-secondary text-center">No active coupons available.</p>
          ) : (
            <ul className="space-y-4">
              {coupons.map(c => (
                <li key={c.id} className="border border-primary rounded-xl p-4 bg-[#031a13]">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-primary">{c.code}</span>
                    <span className="text-sm text-secondary">
                      {new Date(c.startDate).toLocaleDateString()} –{' '}
                      {new Date(c.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  {c.description && <p className="mt-1 text-secondary">{c.description}</p>}
                  <p className="mt-2 text-white">
                    Discount:{' '}
                    {c.discountType === 'percent'
                      ? `${c.discountValue}%`
                      : `₹${c.discountValue}`}
                  </p>
                  {c.minAmount && (
                    <p className="text-sm text-secondary">Min. spend ₹{c.minAmount}</p>
                  )}
                  <p className="text-sm text-secondary">
                    Used {c.timesUsed}/{c.maxRedemptions ?? '∞'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
