'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import {
  getProviders,
  signIn,
  LiteralUnion,
  ClientSafeProvider
} from 'next-auth/react'
import { BuiltInProviderType } from 'next-auth/providers'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string,ClientSafeProvider>>({})
  const [method, setMethod]       = useState<'google' | 'email' | 'otp'>('google')

  const [email, setEmail] = useState('')
  const [otp, setOtp]     = useState('')
  const [error, setError] = useState('')

  const router      = useRouter()
  const params      = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/customer/dashboard'

  useEffect(() => {
    getProviders().then((provs:any) => setProviders(provs))
  }, [])

  // Email magic-link
  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return setError('Enter your email')
    await signIn('email', { email, callbackUrl })
  }

  // Dummy OTP sign-in
  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !otp) return setError('Enter email & OTP')
    const res = await signIn('credentials', {
      redirect: false,
      email,
      otp,
      callbackUrl
    })
    if (res?.error) setError('Invalid OTP (must be 123456)')
    else router.push(callbackUrl)
  }

  return (
    <div className="min-h-screen bg-[#052b1e] flex items-center justify-center p-4">
      <div className="bg-black bg-opacity-80 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">
          Sign In
        </h1>

        {/* Method toggle */}
        <div className="flex mb-6">
          {['google','email','otp'].map(m => (
            <button
              key={m}
              onClick={() => { setMethod(m as any); setError('') }}
              className={`flex-1 py-2 font-medium ${
                method === m
                  ? 'bg-primary text-black'
                  : 'bg-transparent text-primary border border-primary'
              }`}
            >
              {m === 'google' ? 'Google' : m === 'email' ? 'Email' : 'OTP'}
            </button>
          ))}
        </div>

        {/* Google */}
        {method === 'google' && (
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded transition mb-4"
          >
            <i className="ri-google-line text-xl" />
            Sign in with Google
          </button>
        )}

        {/* Email */}
        {method === 'email' && (
          <form onSubmit={handleEmail} className="space-y-4 mb-4">
            <label className="text-primary">Your Email</label>
            <input
              type="email"
              className="w-full"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-primary text-black py-2 rounded font-semibold"
            >
              Send Magic Link
            </button>
          </form>
        )}

        {/* OTP */}
        {method === 'otp' && (
          <form onSubmit={handleOtp} className="space-y-4 mb-4">
            <label className="text-primary">Your Email</label>
            <input
              type="email"
              className="w-full"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label className="text-primary">Enter OTP</label>
            <input
              type="text"
              className="w-full"
              placeholder="123456"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-primary text-black py-2 rounded font-semibold"
            >
              Sign in with OTP
            </button>
          </form>
        )}

        {error && (
          <p className="text-red-400 text-center mt-2">{error}</p>
        )}
      </div>
    </div>
  )
}
