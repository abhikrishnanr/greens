'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      router.push('/admin')
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleSubmit} className="bg-white shadow-md p-8 rounded-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-center text-green-700">Admin Login</h1>
        <input type="text" placeholder="Username" className="w-full border border-gray-300 p-2 rounded" required />
        <input type="password" placeholder="Password" className="w-full border border-gray-300 p-2 rounded" required />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
