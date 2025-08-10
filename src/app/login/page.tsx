'use client'

import Link from 'next/link'
import { User, Users } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-6">
      <div className="bg-white/70 backdrop-blur-xl shadow-xl rounded-2xl p-10 text-center space-y-6 max-w-lg w-full">
        <h1 className="text-4xl font-extrabold text-emerald-900 mb-2">Login</h1>
        <p className="text-emerald-700">Choose how you want to access Greens Salon</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-6">
          <Link
            href="/auth/signin?type=staff"
            className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition-colors"
          >
            <Users /> Staff Login
          </Link>
          <Link
            href="/auth/signin?type=customer"
            className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-green-100 text-emerald-800 font-semibold shadow hover:bg-green-200 transition-colors"
          >
            <User /> Customer Login
          </Link>
        </div>
      </div>
    </div>
  )
}
