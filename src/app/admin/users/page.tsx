'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Shield,
  UserCog,
  KeyRound,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  role: string
  designation: string | null
  imageUrl: string | null
  removed: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data.users))
  }, [])

  const updateUser = async (
    id: string,
    updates: Partial<Pick<User, 'role' | 'removed'>> & {
      password?: string
    },
  ) => {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))
  }

  const adminCount = users.filter((u) => u.role === 'admin').length
  const staffCount = users.filter((u) => u.role === 'staff').length

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
        <Users className="w-9 h-9 mr-3 text-green-700" /> Users
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center p-5 rounded-xl shadow bg-gradient-to-br from-green-200 to-green-400 text-green-900">
          <div className="p-3 bg-white rounded-full mr-4">
            <Users className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <p className="text-sm">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
        </div>
        <div className="flex items-center p-5 rounded-xl shadow bg-gradient-to-br from-yellow-200 to-yellow-400 text-yellow-900">
          <div className="p-3 bg-white rounded-full mr-4">
            <Shield className="w-6 h-6 text-yellow-700" />
          </div>
          <div>
            <p className="text-sm">Admins</p>
            <p className="text-2xl font-bold">{adminCount}</p>
          </div>
        </div>
        <div className="flex items-center p-5 rounded-xl shadow bg-gradient-to-br from-blue-200 to-blue-400 text-blue-900">
          <div className="p-3 bg-white rounded-full mr-4">
            <UserCog className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <p className="text-sm">Staff</p>
            <p className="text-2xl font-bold">{staffCount}</p>
          </div>
        </div>
      </div>

      <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <thead className="bg-green-600 text-white">
          <tr className="text-left">
            <th className="p-3">Photo</th>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Mobile</th>
            <th className="p-3">Designation</th>
            <th className="p-3">Role</th>
            <th className="p-3 text-center">Active</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-t last:border-b-0 odd:bg-green-50 hover:bg-green-100 transition-colors"
            >
              <td className="p-3">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.name ?? ''}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  '—'
                )}
              </td>
              <td className="p-3">{user.name ?? '—'}</td>
              <td className="p-3">{user.email ?? '—'}</td>
              <td className="p-3">{user.phone ?? '—'}</td>
              <td className="p-3">{user.designation ?? '—'}</td>
              <td className="p-3">
                <select
                  value={user.role}
                  onChange={(e) => updateUser(user.id, { role: e.target.value })}
                  className="border border-green-300 p-1 rounded bg-green-50"
                >
                  <option value="admin">admin</option>
                  <option value="staff">staff</option>
                </select>
              </td>
              <td className="p-3 text-center">
                <button
                  onClick={() => updateUser(user.id, { removed: !user.removed })}
                  className={
                    user.removed
                      ? 'text-red-600 hover:text-red-800'
                      : 'text-green-600 hover:text-green-800'
                  }
                  title={user.removed ? 'Activate user' : 'Deactivate user'}
                >
                  {user.removed ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                </button>
              </td>
              <td className="p-3 text-center">
                <button
                  onClick={() => {
                    const pwd = prompt('Enter new password')
                    if (pwd) updateUser(user.id, { password: pwd })
                  }}
                  className="text-blue-600 hover:text-blue-800"
                  title="Change password"
                >
                  <KeyRound className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

