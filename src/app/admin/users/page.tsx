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
  role: string
  modules: string[] | null
  removed: boolean
}

const allModules = [
  'dashboard',
  'staff',
  'customers',
  'branches',
  'services',
  'billing',
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data.users))
  }, [])

  const updateUser = async (
    id: string,
    updates: Partial<Pick<User, 'role' | 'modules' | 'removed'>> & {
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
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="flex items-center text-3xl font-bold mb-6 text-green-800">
        <Users className="w-8 h-8 mr-2" /> User Management
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center p-4 bg-green-50 rounded shadow-sm">
          <Users className="text-green-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-xl font-semibold">{users.length}</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-green-50 rounded shadow-sm">
          <Shield className="text-green-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Admins</p>
            <p className="text-xl font-semibold">{adminCount}</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-green-50 rounded shadow-sm">
          <UserCog className="text-green-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Staff</p>
            <p className="text-xl font-semibold">{staffCount}</p>
          </div>
        </div>
      </div>

      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-green-100">
          <tr className="text-left">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Modules</th>
            <th className="p-3 text-center">Active</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-t odd:bg-green-50 last:border-b-0 hover:bg-green-100"
            >
              <td className="p-3">{user.name ?? '—'}</td>
              <td className="p-3">{user.email ?? '—'}</td>
              <td className="p-3">
                <select
                  value={user.role}
                  onChange={(e) =>
                    updateUser(user.id, { role: e.target.value })
                  }
                  className="border p-1 rounded"
                >
                  <option value="admin">admin</option>
                  <option value="staff">staff</option>
                </select>
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  {allModules.map((m) => {
                    const active = user.modules?.includes(m)
                    return (
                      <label key={m} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => {
                            const modules = active
                              ? (user.modules ?? []).filter((x) => x !== m)
                              : [...(user.modules ?? []), m]
                            updateUser(user.id, { modules })
                          }}
                        />
                        {m}
                      </label>
                    )
                  })}
                </div>
              </td>
              <td className="p-3 text-center">
                <button
                  onClick={() =>
                    updateUser(user.id, { removed: !user.removed })
                  }
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

