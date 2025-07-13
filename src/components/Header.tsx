"use client";
import Link from "next/link";
import { useState } from "react";
import { FiShoppingCart, FiPhone, FiMenu } from "react-icons/fi";

export default function Header({ cartCount = 0 }: { cartCount?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-[#03150d] text-green-100 shadow flex items-center justify-between px-4 py-3">
      <Link href="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="Greens Beauty Salon Logo" className="h-10 w-auto" />
        <span className="font-bold text-xl text-primary hidden sm:block">Greens</span>
      </Link>
      <nav className="hidden md:flex items-center gap-6 text-sm">
        <Link href="/" className="hover:text-primary">Home</Link>
        <Link href="/booking" className="hover:text-primary">Booking</Link>
        <Link href="/cart" className="hover:text-primary flex items-center gap-1">
          <FiShoppingCart /> Cart{cartCount > 0 && (
            <span className="ml-1 bg-yellow-400 text-black rounded-full px-1 text-xs font-bold">{cartCount}</span>
          )}
        </Link>
        <div className="relative group">
          <span className="cursor-pointer group-hover:text-primary">Customer ▾</span>
          <div className="absolute left-0 mt-2 hidden group-hover:block bg-[#03150d] border border-[#24432a] rounded shadow p-2 w-40 text-sm">
            <Link href="/customer/dashboard" className="block px-2 py-1 hover:text-primary">Dashboard</Link>
            <Link href="/customer/profile" className="block px-2 py-1 hover:text-primary">Profile</Link>
            <Link href="/customer/my-bookings" className="block px-2 py-1 hover:text-primary">My Bookings</Link>
          </div>
        </div>
        <div className="relative group">
          <span className="cursor-pointer group-hover:text-primary">Admin ▾</span>
          <div className="absolute left-0 mt-2 hidden group-hover:block bg-[#03150d] border border-[#24432a] rounded shadow p-2 w-40 text-sm">
            <Link href="/admin" className="block px-2 py-1 hover:text-primary">Dashboard</Link>
            <Link href="/admin/service-categories" className="block px-2 py-1 hover:text-primary">Categories</Link>
          </div>
        </div>
      </nav>
      <div className="flex items-center gap-3">
        <a
          href="tel:+918891467678"
          className="hidden sm:flex items-center gap-1 bg-[#052b1e] hover:bg-primary/10 px-3 py-2 rounded-full text-green-100 font-medium shadow transition"
        >
          <FiPhone className="text-lg" /> Call
        </a>
        <Link href="/login" className="bg-primary text-black font-semibold px-4 py-2 rounded-full hover:bg-green-400 transition">Login</Link>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2">
          <FiMenu />
        </button>
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 bg-[#03150d] border-t border-[#24432a] flex flex-col items-start p-4 md:hidden text-sm">
          <Link href="/" className="py-1" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/booking" className="py-1" onClick={() => setOpen(false)}>Booking</Link>
          <Link href="/cart" className="py-1 flex items-center gap-1" onClick={() => setOpen(false)}>
            <FiShoppingCart /> Cart{cartCount > 0 && (
              <span className="ml-1 bg-yellow-400 text-black rounded-full px-1 text-xs font-bold">{cartCount}</span>
            )}
          </Link>
          <div className="mt-2 font-semibold">Customer</div>
          <Link href="/customer/dashboard" className="py-1 pl-3" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link href="/customer/profile" className="py-1 pl-3" onClick={() => setOpen(false)}>Profile</Link>
          <Link href="/customer/my-bookings" className="py-1 pl-3" onClick={() => setOpen(false)}>My Bookings</Link>
          <div className="mt-2 font-semibold">Admin</div>
          <Link href="/admin" className="py-1 pl-3" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link href="/admin/service-categories" className="py-1 pl-3" onClick={() => setOpen(false)}>Categories</Link>
        </div>
      )}
    </header>
  );
}
