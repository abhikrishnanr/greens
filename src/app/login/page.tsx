
'use client'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-md p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">Login to Greens Salon</h1>

        <button
          onClick={() => login({ name: 'Guest User', role: 'customer' })}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Mock Login
        </button>

        <p className="text-sm text-center mt-6 text-gray-500">This is a temporary mock login.</p>
      </div>
    </div>
  )
}
