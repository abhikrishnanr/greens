'use client';

import React, { useEffect, useState } from 'react';

interface Service {
  id: string;
  name: string;
  mainCategory: string;
  mainCategoryId: string;
  mainCategoryDescription: string;
  subCategory: string;
  costCategory: string;
  applicableTo: string;
  description: string;
  imageUrl: string;
  mrp: number;
  offerPrice?: number | null;
  duration: number;
}
interface Staff { id: string; name: string; }
interface CartItem {
  id: string;
  service: Service;
  slot?: string;
  staff?: string;
  date?: string;
}

const getToday = () => new Date().toISOString().slice(0, 10);

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [costCategories, setCostCategories] = useState<string[]>([]);
  const [mainCategories, setMainCategories] = useState<{ id: string, name: string, description: string, imageUrl: string }[]>([]);
  const [selectedCostCategory, setSelectedCostCategory] = useState<string>('All');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [genderTab, setGenderTab] = useState<'WOMEN' | 'MEN'>('WOMEN');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [modalService, setModalService] = useState<Service | null>(null);
  const [modalSlot, setModalSlot] = useState('');
  const [modalStaff, setModalStaff] = useState('');
  const [modalDate, setModalDate] = useState(getToday());

  // Cart drawer form state
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerGender, setCustomerGender] = useState('');
  const [customerExists, setCustomerExists] = useState<boolean | null>(null);
  const [coupon, setCoupon] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cartError, setCartError] = useState('');

  // Icon maps
  const genderTabs = [
    { label: 'WOMEN', icon: <i className="ri-women-line mr-1"></i> },
    { label: 'MEN', icon: <i className="ri-men-line mr-1"></i> },
  ];
  const costTabs = [
    { label: 'All', icon: <i className="ri-apps-line mr-1"></i> },
    { label: 'Deluxe', icon: <i className="ri-vip-crown-2-line mr-1"></i> },
    { label: 'Premium', icon: <i className="ri-star-line mr-1"></i> },
    { label: 'Ordinary', icon: <i className="ri-checkbox-blank-circle-line mr-1"></i> },
  ];

  useEffect(() => {
    fetch('/api/services?branchId=main-branch-001')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setServices(data.services);

          // Unique cost categories (deluxe, premium, ordinary, etc.)
          const costCats = Array.from(new Set(data.services.map((s: Service) => s.costCategory))).filter(Boolean);
          setCostCategories(costCats);

          // Unique main categories, with id/desc/img
          const mainCats = Array.from(
            new Map(data.services.map((s: Service) =>
              [s.mainCategory, {
                id: s.mainCategoryId,
                name: s.mainCategory,
                description: s.mainCategoryDescription,
                imageUrl: `/images/main-categories/${s.mainCategoryId}.jpg`,
              }]
            )).values()
          );
          setMainCategories(mainCats);
          setSelectedMainCategory(mainCats[0]?.name || '');
        }
      });
    fetch('/api/staff?branchId=main-branch-001')
      .then(r => r.json())
      .then(data => { if (data.success) setStaff(data.staff); });
  }, []);

  // Gender and cost category filtering
  const filteredByGender = services.filter(s =>
    genderTab === 'WOMEN'
      ? (s.applicableTo === 'Female' || s.applicableTo === 'Unisex')
      : (s.applicableTo === 'Male' || s.applicableTo === 'Unisex')
  );
  const filteredByCost = selectedCostCategory === "All"
    ? filteredByGender
    : filteredByGender.filter(s => s.costCategory === selectedCostCategory);

  // Main categories for selected costCat and gender
  const filteredMainCats = mainCategories.filter(mc =>
    filteredByCost.some(s => s.mainCategory === mc.name)
  );

  // Filtered services for main cat + cost cat + gender
  const filteredServices = filteredByCost.filter(
    s => s.mainCategory === selectedMainCategory
  );

  // Cart logic: only one per service+slot+staff+date
  const addToCart = (service: Service, slot: string, staff: string, date: string) => {
    const id = `${service.id}-${slot}-${staff || 'any'}-${date}`;
    if (!cart.find(c => c.id === id)) {
      setCart(prev => [...prev, { id, service, slot, staff, date }]);
    }
    setShowServiceModal(false);
    setModalService(null); setModalSlot(''); setModalStaff(''); setModalDate(getToday());
  };
  const removeFromCart = (id: string) => setCart(cart.filter(item => item.id !== id));

  // Customer check by mobile
  const checkCustomer = async () => {
    if (!/^\d{10}$/.test(customerMobile)) {
      setCartError("Enter valid 10-digit mobile"); setCustomerExists(null);
      return;
    }
    const res = await fetch(`/api/users/check?phone=${customerMobile}`);
    const data = await res.json();
    if (data.user) {
      setCustomerName(data.user.name); setCustomerGender(data.user.gender || '');
      setCustomerExists(true); setCartError('');
    } else {
      setCustomerName(''); setCustomerGender('');
      setCustomerExists(false); setCartError('New customer: Please enter details');
    }
  };

  const slotList = Array.from({ length: 9 }, (_, i) => `${(9 + i).toString().padStart(2, '0')}:00`);
  const total = cart.reduce((sum, item) => sum + (item.service.offerPrice ?? item.service.mrp), 0);

  // Booking confirm
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(customerMobile)) {
      setCartError('Valid 10-digit mobile required'); return;
    }
    if (!customerName) { setCartError('Name required'); return; }
    if (!customerGender) { setCartError('Gender required'); return; }
    setSubmitting(true); setCartError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName, customerPhone: customerMobile, customerGender, coupon,
          items: cart.map(item => ({
            serviceId: item.service.id,
            staffId: item.staff || undefined,
            slot: item.slot, date: item.date,
          })),
        })
      });
      const data = await res.json();
      if (data.success) {
        setCart([]); setShowCart(false);
        setCustomerMobile(''); setCustomerName(''); setCustomerGender(''); setCoupon('');
        alert('Booking confirmed!');
      } else setCartError(data.error || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="bg-[#0a3622] min-h-screen font-sans pb-12">
      {/* Header */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <span className="font-bold text-3xl tracking-wide" style={{ fontFamily: 'Pacifico, cursive' }}>Greens Salon</span>
        <button
          className="relative bg-yellow-400 text-black px-6 py-2 rounded-full flex items-center font-bold shadow-lg hover:brightness-105"
          onClick={() => setShowCart(true)}
        >
          <i className="ri-shopping-cart-line mr-2 text-xl"></i> Cart
          {cart.length > 0 &&
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {cart.length}
            </span>}
        </button>
      </div>

      <div className="container mx-auto px-4">
        {/* Gender tabs */}
        <div className="flex gap-2 mb-4">
          {genderTabs.map(tab => (
            <button
              key={tab.label}
              className={`px-4 py-2 rounded-full font-bold flex items-center text-lg shadow ${genderTab === tab.label ? 'bg-primary text-black' : 'bg-black/40 text-primary'}`}
              onClick={() => setGenderTab(tab.label as any)}
            >{tab.icon} {tab.label}</button>
          ))}
        </div>
        {/* Cost Category Tabs */}
        <div className="flex gap-2 mb-6">
          {costTabs.map(tab => (
            <button
              key={tab.label}
              className={`px-4 py-2 rounded-full font-bold flex items-center text-base border-2 ${selectedCostCategory === tab.label ? 'bg-yellow-400 text-black border-yellow-300 shadow' : 'bg-black/20 text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black'}`}
              onClick={() => {
                setSelectedCostCategory(tab.label);
                // Reset mainCategory if not present for this costCat
                if (!filteredMainCats.some(mc => mc.name === selectedMainCategory)) setSelectedMainCategory(filteredMainCats[0]?.name || '');
              }}
            >{tab.icon} {tab.label}</button>
          ))}
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Main Categories as Cards */}
          <div className="w-full lg:w-5/12 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredMainCats.map(mc => (
                <div
                  key={mc.id}
                  className={`bg-white/10 rounded-xl shadow-lg overflow-hidden flex flex-col cursor-pointer border-2 ${selectedMainCategory === mc.name ? 'border-yellow-400' : 'border-transparent'} hover:border-yellow-400`}
                  onClick={() => setSelectedMainCategory(mc.name)}
                >
                  <img
                    src={mc.imageUrl}
                    alt={mc.name}
                    className="w-full h-36 object-cover object-center"
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-yellow-300 mb-1">{mc.name}</h3>
                    <p className="text-sm text-gray-100 mb-2 flex-1">{mc.description || 'Professional beauty and wellness services.'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Service Menu Table */}
          <div className="w-full lg:w-7/12">
            <div className="bg-black/20 rounded-xl p-4 shadow-lg">
              <div className="grid grid-cols-12 mb-4 font-bold text-yellow-300 text-base">
                <div className="col-span-4">Service Name</div>
                <div className="col-span-2 text-center">Subcategory</div>
                <div className="col-span-2 text-center">Cost Cat.</div>
                <div className="col-span-2 text-center">MRP</div>
                <div className="col-span-1 text-center">Offer</div>
                <div className="col-span-1"></div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 540 }}>
                {filteredServices.length === 0 && (
                  <div className="text-yellow-100 text-center py-8">No services found for selected options.</div>
                )}
                {filteredServices.map(service => (
                  <div key={service.id} className="menu-item py-3 grid grid-cols-12 items-center hover:bg-yellow-400/10 transition rounded">
                    <div className="col-span-4 font-medium text-white">{service.name}</div>
                    <div className="col-span-2 text-center text-yellow-100">{service.subCategory}</div>
                    <div className="col-span-2 text-center text-yellow-100">{service.costCategory}</div>
                    <div className="col-span-2 text-center text-gray-200">₹{service.mrp}</div>
                    <div className="col-span-1 text-center text-yellow-400 font-bold">{service.offerPrice ? <>₹{service.offerPrice}</> : <span>—</span>}</div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-black rounded-full add-button shadow"
                        onClick={() => { setModalService(service); setShowServiceModal(true); }}
                        title="Add to cart"
                      ><i className="ri-add-line"></i></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <button
                  className="bg-yellow-400 text-black px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:brightness-105"
                  onClick={() => setShowCart(true)}
                >Proceed to Checkout</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Add Modal */}
      {showServiceModal && modalService && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0a3622] rounded-lg p-6 w-full max-w-md mx-4 shadow-lg border-2 border-yellow-400">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">{modalService.name}</h3>
            <div className="mb-2">
              <label className="block text-primary mb-1">Date</label>
              <input
                type="date"
                className="w-full bg-gray-900 text-yellow-300 px-3 py-2 rounded border border-yellow-300"
                value={modalDate}
                min={getToday()}
                onChange={e => setModalDate(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block text-primary mb-1">Staff</label>
              <select
                className="w-full bg-gray-900 text-yellow-300 px-3 py-2 rounded border border-yellow-300"
                value={modalStaff}
                onChange={e => setModalStaff(e.target.value)}
              >
                <option value="">Any Staff</option>
                {staff.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-primary mb-1">Slot</label>
              <div className="flex flex-wrap gap-2">
                {slotList.map(slot => (
                  <button
                    key={slot}
                    className={`rounded px-3 py-1 mb-1 ${modalSlot === slot ? 'bg-yellow-400 text-black font-bold' : 'bg-gray-900 text-yellow-200 border border-yellow-400'}`}
                    onClick={() => setModalSlot(slot)}
                  >{slot}</button>
                ))}
              </div>
            </div>
            <button className="mt-4 w-full bg-yellow-400 text-black py-2 rounded font-bold shadow"
              onClick={() => {
                if (!modalSlot) return;
                addToCart(modalService, modalSlot, modalStaff, modalDate);
              }}
              disabled={!modalSlot}
            >Add to Cart</button>
            <button className="mt-2 w-full bg-gray-900 text-yellow-400 py-2 rounded font-bold" onClick={() => setShowServiceModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Cart Drawer/Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
          <form className="bg-[#0a3622] h-full w-full max-w-md p-8 border-l-4 border-yellow-400 flex flex-col"
            onSubmit={handleBooking}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">Your Cart</h2>
              <button type="button" onClick={() => setShowCart(false)} className="text-yellow-400 text-3xl font-bold">×</button>
            </div>
            <div className="flex-1 overflow-auto mb-4" style={{ maxHeight: 320 }}>
              {cart.length === 0
                ? <div className="text-yellow-100 text-center">Cart is empty</div>
                : cart.map(item => (
                  <div key={item.id} className="bg-black/20 rounded-lg p-4 mb-2 shadow flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-white">{item.service.name}</span>
                      <button type="button" className="text-red-400 hover:text-red-300" onClick={() => removeFromCart(item.id)}>
                        <i className="ri-delete-bin-line text-xl"></i>
                      </button>
                    </div>
                    <div className="text-xs text-yellow-300">{item.service.subCategory} | {item.service.costCategory}</div>
                    <div className="text-xs text-yellow-200">
                      {item.date} · {item.slot} · {item.staff ? staff.find(s => s.id === item.staff)?.name : 'Any Staff'}
                    </div>
                    <div className="font-bold text-yellow-400 mt-1">₹{item.service.offerPrice ?? item.service.mrp}</div>
                  </div>
                ))}
              {cart.length > 0 && (
                <div className="mt-2 font-bold text-yellow-400">
                  Total: ₹{total}
                </div>
              )}
            </div>
            {/* Customer info and coupon */}
            <div className="mb-2 flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-yellow-200 mb-1">Mobile</label>
                <input
                  className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-yellow-400"
                  value={customerMobile}
                  onChange={e => setCustomerMobile(e.target.value)}
                  maxLength={10}
                  required
                />
              </div>
              <button
                className="bg-yellow-400 text-black font-bold px-4 py-2 rounded shadow"
                type="button"
                onClick={checkCustomer}
              >Check</button>
            </div>
            <div className="mb-2">
              <label className="block text-yellow-200 mb-1">Name</label>
              <input
                className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-yellow-400"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                required
                disabled={customerExists === true}
              />
            </div>
            <div className="mb-2">
              <label className="block text-yellow-200 mb-1">Gender</label>
              <select
                className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-yellow-400"
                value={customerGender}
                onChange={e => setCustomerGender(e.target.value)}
                required
                disabled={customerExists === true}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-yellow-200 mb-1">Coupon</label>
              <input
                className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-yellow-400"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
              />
            </div>
            {cartError && <div className="text-red-400 mb-2 text-center">{cartError}</div>}
            <button className="w-full bg-yellow-400 text-black py-2 rounded-full font-bold text-lg shadow"
              type="submit" disabled={submitting || cart.length === 0}>
              {submitting ? "Booking..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
