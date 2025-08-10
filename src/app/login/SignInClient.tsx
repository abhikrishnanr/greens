'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Phone, Lock, Users, User } from 'lucide-react'

export default function SignInClient() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [roles, setRoles] = useState<{ staff: boolean; customer: boolean } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await signIn('credentials', {
      redirect: false,
      phone,
      password,
    })
    if (res?.error) {
      setError('Invalid mobile number or password')
      return
    }

    const rolesRes = await fetch('/api/auth/role-options')
    const data = await rolesRes.json()
    if (data.staff && data.customer) {
      setRoles(data)
    } else if (data.staff) {
      await selectRole('staff')
    } else if (data.customer) {
      await selectRole('customer')
    } else {
      setError('No role access found')
    }
  }

  const selectRole = async (role: 'staff' | 'customer') => {
    await fetch('/api/auth/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (role === 'customer') {
      router.push('/customer')
      return
    }
    const sessionRes = await fetch('/api/auth/session')
    const session = await sessionRes.json()
    const user = session?.user as { role?: string; modules?: string[] }
    const modules = user?.modules ?? []
    const moduleRoutes: Record<string, string> = {
      dashboard: '/admin/dashboard',
      staff: '/admin/staff',
      customers: '/admin/customers',
      branches: '/admin/branches',
      services: '/admin/services',
      billing: '/admin/billing',
      'staff-roles': '/admin/users',
    }
    let destination = '/admin/dashboard'
    if (user?.role !== 'admin' && modules.length > 0 && !modules.includes('dashboard')) {
      const first = modules[0]
      destination = moduleRoutes[first] || destination
    }
    router.push(destination)
  }

  if (roles && roles.staff && roles.customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-6">
        <div className="bg-white/70 backdrop-blur-xl shadow-xl rounded-2xl p-10 text-center space-y-6 max-w-lg w-full">
          <h1 className="text-4xl font-extrabold text-emerald-900 mb-2">Choose Role</h1>
          <p className="text-emerald-700">Select how you want to continue</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-6">
            <button
              onClick={() => selectRole('staff')}
              className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition-colors"
            >
              <Users /> Staff
            </button>
            <button
              onClick={() => selectRole('customer')}
              className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-green-100 text-emerald-800 font-semibold shadow hover:bg-green-200 transition-colors"
            >
              <User /> Customer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-green-600 to-green-900 text-white p-10">
        <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
        <p className="text-center max-w-sm">
          Manage your salon operations, staff, and customers all in one place.
        </p>
      </div>
      <div className="flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Sign In</h1>
            <p className="text-gray-500">Enter your credentials to access your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="9999999999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">We&apos;ll never share your mobile number.</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Use at least 8 characters.</p>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-black py-2 rounded-lg font-semibold hover:bg-green-400 transition-colors"
            >
              Sign In
            </button>
          </form>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </div>
      </div>
    </div>
  )
}
