'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignInClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })
    if (res?.error) {
      setError('Invalid email or password')
      return
    }

    const session = await getSession()
    const modules = (session?.user as { modules?: string[] })?.modules || []
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
    if (!modules.includes('dashboard') && modules.length > 0) {
      const first = modules[0]
      destination = moduleRoutes[first] || destination
    }

    router.push(destination)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-black/70 backdrop-blur-sm p-8 rounded-2xl w-full max-w-md shadow-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Hello!</h1>
          <p className="text-primary">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-primary">Email</label>
            <input
              type="email"
              className="w-full"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-primary">Password</label>
            <input
              type="password"
              className="w-full"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-black py-2 rounded font-semibold"
          >
            Sign In
          </button>
        </form>
        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>
    </div>
  )
}
