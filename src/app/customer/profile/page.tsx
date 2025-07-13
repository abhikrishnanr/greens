'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

const MENU = [
  { label: 'My Profile', icon: 'ri-user-3-line', path: '/customer/profile' },
  { label: 'Appointments', icon: 'ri-calendar-check-line', path: '/customer/dashboard' },
  { label: 'My Coupons', icon: 'ri-gift-line', path: '/customer/coupons' },
];

export default function CustomerProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    address: '',
    designation: '',
    experience: '',
    startDate: '',
  });
  const [errors, setErrors] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (status === 'unauthenticated') signIn();
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/user')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const user = data.user;
          setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: user.gender || '',
            dob: user.dob?.split('T')[0] || '',
            address: user.address || '',
            designation: user.designation || '',
            experience: user.experience || '',
            startDate: user.startDate?.split('T')[0] || '',
          });
          setIsStaff(user.role !== 'customer');
        } else {
          console.warn('GET /api/user:', data.error);
        }
      })
      .catch(err => console.error('Fetch /api/user failed', err))
      .finally(() => setLoading(false));
  }, [status]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function validate() {
    let ok = true;
    const errs = { name: '', phone: '' };
    if (!form.name.trim()) {
      errs.name = 'Name is required';
      ok = false;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      errs.phone = 'Phone must be 10 digits';
      ok = false;
    }
    setErrors(errs);
    return ok;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Profile updated successfully');
        setForm({
          ...form,
          dob: data.user.dob?.split('T')[0] || '',
          startDate: data.user.startDate?.split('T')[0] || '',
        });
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#052b1e] flex items-center justify-center">
        <p className="text-primary">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#052b1e] flex">
      <Toaster richColors position="top-center" />

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col bg-black bg-opacity-80 border-r border-primary border-opacity-20 w-60 min-h-screen py-8 px-4 sticky top-0">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Greens Beauty" className="w-32 mb-4" draggable={false} />
          <span className="text-primary font-bold text-lg mb-1">{session.user?.name}</span>
          <span className="text-secondary text-xs">
            {isStaff ? (
              <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">STAFF</span>
            ) : (
              'Customer'
            )}
          </span>
        </div>
        <nav className="flex flex-col gap-2 mb-8">
          {MENU.map(item => (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all
                ${router.pathname === item.path
                  ? 'bg-primary text-black shadow'
                  : 'bg-transparent text-primary hover:bg-primary hover:text-black'}`}
              onClick={() => router.push(item.path)}
            >
              <i className={`${item.icon} text-lg`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button
          className="mt-auto flex items-center gap-2 px-4 py-3 rounded-lg bg-[#133d28] text-primary hover:bg-red-500 hover:text-white font-bold transition-all"
          onClick={() => {/* TODO: sign out */}}
        >
          <i className="ri-logout-box-r-line"></i>
          Logout
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-black bg-opacity-90 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Greens Beauty" className="w-24" />
          <span className="text-primary font-bold text-lg">{session.user?.name}</span>
        </div>
        <button
          className="bg-primary text-black font-bold rounded px-3 py-2"
          onClick={() => { /* mobile menu */ }}
        >
          <i className="ri-menu-line text-lg"></i>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-2 pt-4 md:pt-12 pb-12">
        <div className="max-w-3xl mx-auto">
          <button
            className="text-primary font-semibold mb-6 hover:underline text-sm flex items-center gap-2"
            onClick={() => router.push('/customer/dashboard')}
          >
            <i className="ri-arrow-left-line"></i> Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-primary mb-6 text-center flex items-center gap-2 justify-center">
            <i className="ri-user-3-line"></i> My Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common Fields */}
            <InputField label="Name*" name="name" value={form.name} onChange={handleInput} error={errors.name} />
            <ReadOnlyField label="Email" value={form.email} />
            <InputField label="Mobile Number*" name="phone" value={form.phone} onChange={handleInput} error={errors.phone} />
            <SelectField label="Gender" name="gender" value={form.gender} onChange={handleInput} options={['Male', 'Female', 'Other']} />
            <DateField label="Date of Birth" name="dob" value={form.dob} onChange={handleInput} />
            <TextAreaField label="Address" name="address" value={form.address} onChange={handleInput} />

            {/* Staff Only Fields */}
            {isStaff && (
              <>
                <InputField label="Designation" name="designation" value={form.designation} onChange={handleInput} />
                <InputField label="Experience" name="experience" value={form.experience} onChange={handleInput} />
                <DateField label="Start Date" name="startDate" value={form.startDate} onChange={handleInput} />
              </>
            )}

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="bg-primary text-black px-6 py-2 rounded hover:bg-opacity-90 font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// Reusable Components
function InputField({ label, name, value, onChange, error }: any) {
  return (
    <div>
      <label className="block text-primary mb-1 font-medium">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-black border border-primary text-white rounded px-3 py-2"
      />
      {error && <small className="text-red-400">{error}</small>}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-primary mb-1 font-medium">{label}</label>
      <div className="w-full bg-gray-800 text-white rounded px-3 py-2 opacity-70 cursor-not-allowed">{value}</div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-primary mb-1 font-medium">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-black border border-primary text-white rounded px-3 py-2"
      >
        <option value="">Select</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function DateField({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="block text-primary mb-1 font-medium">{label}</label>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-black border border-primary text-white rounded px-3 py-2"
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="block text-primary mb-1 font-medium">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-black border border-primary text-white rounded px-3 py-2"
        rows={3}
      />
    </div>
  );
}
