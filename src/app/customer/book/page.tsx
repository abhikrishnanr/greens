// File: app/customer/book/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

// ─── Configuration ────────────────────────────────────────────────────────────
const SLOT_START = 9;
const SLOT_END   = 18;
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const ALL_SLOTS = Array.from(
  { length: SLOT_END - SLOT_START },
  (_, i) => `${pad(i + SLOT_START)}:00`
);

// ─── Shared Input Styling ──────────────────────────────────────────────────────
const inputClass =
  'w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary';

// ─── Helpers & Types ───────────────────────────────────────────────────────────
function getToday() {
  return new Date().toISOString().slice(0, 10);
}

// Safely pick the active price from history (or 0 if none)
function getCurrentPrice(
  history: { price: number; startDate: string; endDate: string | null }[] | unknown,
  date: string
): number {
  const histArray = Array.isArray(history) ? history : [];
  const d = new Date(date);
  // sort descending by startDate
  const sorted = [...histArray].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  for (let rec of sorted) {
    const start = new Date(rec.startDate);
    const end = rec.endDate ? new Date(rec.endDate) : null;
    if (d >= start && (!end || d < end)) {
      return rec.price;
    }
  }
  return 0;
}

interface Branch { id: string; name: string }
interface Service {
  id: string;
  name: string;
  duration: number;
  priceHistory: { price: number; startDate: string; endDate: string | null }[];
}
interface StaffMember { id: string; name: string }

type SelectedService = {
  id: string;
  service: Service;
  price: number;
  duration: number;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [branches, setBranches]           = useState<Branch[]>([]);
  const [services, setServices]           = useState<Service[]>([]);
  const [staff, setStaff]                 = useState<StaffMember[]>([]);
  const [branchId, setBranchId]           = useState('');
  const [date, setDate]                   = useState('');
  const [serviceQuery, setServiceQuery]   = useState('');
  const [selServiceId, setSelServiceId]   = useState('');
  const [selected, setSelected]           = useState<SelectedService[]>([]);

  // Coupon state
  const [couponCode, setCouponCode]       = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discountType: 'percent'|'amount';
    discountValue: number;
    minAmount?: number;
  } | null>(null);
  const [couponError, setCouponError]     = useState('');
  const [notes, setNotes]                 = useState('');

  // Require login
  useEffect(() => {
    if (status === 'unauthenticated') signIn();
  }, [status]);

  // Load branches
  useEffect(() => {
    fetch('/api/branch')
      .then(r => r.json())
      .then(d => d.success && setBranches(d.branches));
  }, []);

  // When branch changes: load services+staff
  useEffect(() => {
    if (!branchId) return;
    Promise.all([
      fetch(`/api/services?branchId=${branchId}&includePriceHistory=true`).then(r => r.json()),
      fetch(`/api/staff?branchId=${branchId}`).then(r => r.json())
    ]).then(([srv, stf]) => {
      if (srv.success) setServices(srv.services);
      if (stf.success) setStaff(stf.staff);
    });
    setDate('');
    setSelected([]);
  }, [branchId]);

  // When date/service/staff change: load availability
  useEffect(() => {
    if (!branchId || !date || !selServiceId) {
      setAvailableSlots([]);
      return;
    }
    const fetchSlots = async (staffId?: string) => {
      const params = new URLSearchParams({ branchId, date, serviceId: selServiceId, staffId: staffId||'' });
      const res = await fetch(`/api/availability?${params}`);
      const d = await res.json();
      return d.success ? d.slots : [];
    };
    (async () => {
      if (selStaff) {
        const slots = await fetchSlots(selStaff);
        setAvailableSlots(slots);
      } else {
        const all = await Promise.all(staff.map(s => fetchSlots(s.id)));
        setAvailableSlots(ALL_SLOTS.map(time => ({
          time,
          available: all.some(arr => arr.find(x => x.time === time && x.available))
        })));
      }
    })();
  }, [branchId, date, selServiceId, selStaff, staff]);

  // Filter services
  const selectableServices = useMemo(() =>
    services
      .filter(svc => !selected.some(s => s.service.id === svc.id))
      .filter(svc => svc.name.toLowerCase().includes(serviceQuery.toLowerCase())),
    [services, selected, serviceQuery]
  );

  // Add service
  const handleAdd = () => {
    if (!selServiceId) return;
    const svc = services.find(s => s.id === selServiceId)!;
    const price = getCurrentPrice(svc.priceHistory, date||getToday());
    setSelected(prev => [
      ...prev,
      { id: crypto.randomUUID(), service: svc, price, duration: svc.duration }
    ]);
    setServiceQuery(''); setSelServiceId('');
  };

  // Compute totals
  const subtotal      = useMemo(() => selected.reduce((sum,s)=>sum+s.price,0), [selected]);
  const totalDuration = useMemo(() => selected.reduce((sum,s)=>sum+s.duration,0), [selected]);
  const discountAmount= useMemo(() => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discountType==='percent'
      ? Math.round(subtotal * appliedCoupon.discountValue / 100)
      : appliedCoupon.discountValue;
  }, [subtotal,appliedCoupon]);
  const total         = subtotal - discountAmount;

  // Apply coupon
  const applyCoupon = async () => {
    setCouponError('');
    const res = await fetch(
      `/api/customer/coupons/validate?code=${encodeURIComponent(couponCode)}&total=${subtotal}`
    );
    const d = await res.json();
    if (d.success) setAppliedCoupon(d.coupon);
    else {
      setAppliedCoupon(null);
      setCouponError(d.error);
    }
  };

  // Confirm booking
  const handleConfirm = async () => {
    const res = await fetch('/api/customer/bookings', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        branchId,
        preferredDate: date,
        items: selected.map(s=>({
          serviceId: s.service.id
        })),
        couponCode: appliedCoupon?.code,
        notes
      })
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Booking Confirmed!');
      setTimeout(() => router.push('/customer/dashboard'), 2000);
    } else {
      toast.error(d.error || 'Booking failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#052b1e] flex">
      <Toaster richColors position="top-center" />

      {/* Sidebar… same as before */}

      <main className="flex-1 px-4 pt-12 pb-12">
        <div className="max-w-3xl mx-auto bg-black bg-opacity-80 rounded-xl shadow p-6">
          <h1 className="text-3xl text-primary font-bold mb-6 text-center">Book Appointment</h1>

          {/* Branch */}
          <label className="text-primary">Branch</label>
          <select className={inputClass} value={branchId} onChange={e=>setBranchId(e.target.value)}>
            <option value="">— choose —</option>
            {branches.map(b=>(
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {branchId && (
            <>
              {/* Date */}
              <div className="mt-4">
                <label className="text-primary">Date</label>
                <input
                  type="date"
                  className={inputClass}
                  min={getToday()}
                  value={date}
                  onChange={e=>setDate(e.target.value)}
                />
              </div>

              {/* Add Service */}
              <div className="mt-6 p-4 bg-[#031a13] rounded-xl border border-primary">
                <h2 className="text-lg text-primary font-semibold mb-3">Add Service</h2>
                <input
                  type="text"
                  placeholder="Search service…"
                  className={inputClass + ' mb-2'}
                  value={serviceQuery}
                  onChange={e=>setServiceQuery(e.target.value)}
                />
                <div className="max-h-32 overflow-auto mb-2 border border-primary rounded">
                  {selectableServices.map(svc=>(
                    <div
                      key={svc.id}
                      className="p-2 cursor-pointer hover:bg-primary hover:text-black flex justify-between"
                      onClick={()=>{
                        setSelServiceId(svc.id);
                        setServiceQuery(svc.name);
                      }}
                    >
                      <span>{svc.name}</span>
                      <span>₹{getCurrentPrice(svc.priceHistory,date||getToday())}·{svc.duration}m</span>
                    </div>
                  ))}
                  {selectableServices.length===0 && (
                    <div className="p-2 text-secondary">No services</div>
                  )}
                </div>

                <button
                  className="bg-primary text-black px-4 py-2 rounded font-semibold"
                  onClick={handleAdd}
                  disabled={!selServiceId}
                >
                  Add Service
                </button>
              </div>

              {/* Selected & Summary */}
              <ul className="mt-6 space-y-2 text-white">
                {selected.map(item=>(
                  <li
                    key={item.id}
                    className="flex justify-between items-center border border-primary rounded px-4 py-2"
                  >
                    <div>
                      <div className="font-semibold text-primary">{item.service.name}</div>
                      <div className="text-sm text-secondary">
                        ₹{item.price} · {item.duration} mins
                      </div>
                    </div>
                    <button onClick={()=>setSelected(prev=>prev.filter(x=>x.id!==item.id))}>✕</button>
                  </li>
                ))}
              </ul>

              {selected.length>0 && (
                <>
                  <div className="mt-4 text-primary font-bold text-right">
                    Subtotal: ₹{subtotal}<br/>
                    Discount: ₹{discountAmount}<br/>
                    Total: ₹{total} · {totalDuration} mins
                  </div>

                  {/* Coupon */}
                  <div className="mt-4">
                    <label className="text-primary">Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className={inputClass + ' flex-1'}
                        value={couponCode}
                        onChange={e=>setCouponCode(e.target.value.trim().toUpperCase())}
                        placeholder="Enter code"
                      />
                      <button
                        className="bg-primary text-black px-4 py-2 rounded"
                        onClick={applyCoupon}
                        disabled={!couponCode}
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-400 mt-1">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-green-400 mt-1">
                      Applied {appliedCoupon.code}: −
                      {appliedCoupon.discountType==='percent'
                        ? `${appliedCoupon.discountValue}%`
                        : `₹${appliedCoupon.discountValue}`}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="mt-4">
                  <label className="text-primary">Notes</label>
                  <textarea
                    className={inputClass + ' h-24'}
                    value={notes}
                    onChange={e=>setNotes(e.target.value)}
                    placeholder="Any special requests? (optional)"
                  />
                </div>

                <div className="mt-6 text-right">
                  <button
                    className="bg-primary text-black px-6 py-2 rounded font-semibold"
                    onClick={handleConfirm}
                  >
                      Confirm Booking
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
