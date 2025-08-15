'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Phone, Lock, Users, User, CheckCircle2, Sparkles, Loader2, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SignInClient() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [roles, setRoles] = useState<{ admin: boolean; staff: boolean; customer: boolean } | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // --- helpers: digits only + 10 max ---
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(digitsOnly)
  }
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = [
      'Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'
    ]
    if (allowed.includes(e.key)) return
    if (!/^\d$/.test(e.key)) e.preventDefault()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { redirect: false, phone, password })
    if (res?.error) {
      setError('Invalid mobile number or password')
      setLoading(false)
      return
    }
    try {
      const rolesRes = await fetch('/api/auth/role-options', { credentials: 'include' })
      const data = await rolesRes.json()
      const count = (data.admin ? 1 : 0) + (data.staff ? 1 : 0) + (data.customer ? 1 : 0)
      if (count > 1) {
        setRoles(data)
        setLoading(false)
      } else if (data.admin) {
        await selectRole('admin')
      } else if (data.staff) {
        await selectRole('staff')
      } else if (data.customer) {
        await selectRole('customer')
      } else {
        setError('No role access found')
        setLoading(false)
      }
    } catch {
      setError('Unable to check role access')
      setLoading(false)
    }
  }

  const selectRole = async (role: 'staff' | 'customer' | 'admin') => {
    await fetch('/api/auth/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
    })
    if (role === 'customer') {
      router.push('/customer')
      return
    }
    if (role === 'staff') {
      router.push('/admin/staff/dashboard')
      return
    }
    router.push('/admin/dashboard')
  }

  // --- Role chooser (styled) ---
  if (roles) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-950 to-emerald-900 text-emerald-50">
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-emerald-700/40 rounded-2xl p-8 md:p-10 text-center space-y-6 max-w-lg w-full shadow-[0_20px_60px_-20px_rgba(16,185,129,0.25)]"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-100">Choose Role</h1>
            <p className="text-emerald-200/85">Select how you want to continue</p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mt-2">
              {roles.admin && (
                <button
                  onClick={() => selectRole('admin')}
                  className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition-colors"
                >
                  <Shield /> Admin
                </button>
              )}
              {roles.staff && (
                <button
                  onClick={() => selectRole('staff')}
                  className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition-colors"
                >
                  <Users /> Staff
                </button>
              )}
              {roles.customer && (
                <button
                  onClick={() => selectRole('customer')}
                  className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-emerald-50 text-emerald-900 font-semibold shadow hover:bg-emerald-100 transition-colors"
                >
                  <User /> Customer
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // --- Sign-in screen ---
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-950 to-emerald-900 text-emerald-50">
      {/* soft glows */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="grid md:grid-cols-2 min-h-screen">
        {/* Left: hero */}
        <div className="hidden md:flex flex-col items-center justify-center p-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-bold mb-3 text-emerald-50">Welcome Back</h2>
            <p className="text-emerald-200/85 max-w-md text-center">
              Manage your salon operations, staff, and customers — all in one place.
            </p>
            <ul className="mt-6 space-y-2 text-emerald-200/90">
              <li className="flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={18} /> Fast & secure login</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={18} /> Role-based access</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={18} /> Works on any device</li>
            </ul>
          </motion.div>
        </div>

        {/* Right: form card */}
        <div className="flex items-center justify-center p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-6 bg-white/10 backdrop-blur-xl border border-emerald-700/40 rounded-2xl p-6 md:p-8 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.25)]"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
                <Sparkles size={16} /> Greens Beauty Salon
              </div>
              <h1 className="text-3xl font-bold text-emerald-50 mt-3 mb-1">Sign In</h1>
              <p className="text-emerald-200/80">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-emerald-100">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300" size={18} />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="\d{10}"
                    maxLength={10}
                    onKeyDown={handlePhoneKeyDown}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-700 text-emerald-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="9999999999"
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                    aria-describedby="phoneHelp"
                  />
                </div>
                <p id="phoneHelp" className="text-xs text-emerald-200/75">Enter your 10-digit mobile number.</p>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-emerald-100">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300" size={18} />
                  <input
                    type="password"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-700 text-emerald-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-describedby="pwdHelp"
                  />
                </div>
                <p id="pwdHelp" className="text-xs text-emerald-200/75">Use at least 8 characters.</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {error && (
              <div className="text-red-300 bg-red-900/20 border border-red-700/40 rounded-lg p-3 text-sm text-center">
                {error}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
