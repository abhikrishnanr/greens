'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Phone, Lock } from 'lucide-react'

interface Props {
  type?: string
}

export default function SignInClient({ type }: Props) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
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
    if (user?.role === 'customer') {
      destination = '/customer'
    } else if (user?.role !== 'admin' && modules.length > 0 && !modules.includes('dashboard')) {
      const first = modules[0]
      destination = moduleRoutes[first] || destination
    }

    router.push(destination)
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
            <h1 className="text-3xl font-bold text-primary mb-2">
              {type === 'customer' ? 'Customer Sign In' : 'Staff Sign In'}
            </h1>
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
