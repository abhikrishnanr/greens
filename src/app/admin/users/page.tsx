'use client'

import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
  modules: string[] | null
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
      .then((data) =>
        setUsers(
          data.users.filter(
            (u: User) => u.role === 'admin' || u.role === 'staff'
          )
        )
      )
  }, [])

  const updateUser = async (id: string, role: string, modules: string[]) => {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role, modules }),
    })
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role, modules } : u)),
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-green-800">User Management</h1>
      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-green-100">
          <tr className="text-left">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Modules</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t last:border-b-0">
              <td className="p-3">{user.name ?? '—'}</td>
              <td className="p-3">{user.email ?? '—'}</td>
              <td className="p-3">
                <select
                  value={user.role}
                  onChange={(e) =>
                    updateUser(user.id, e.target.value, user.modules ?? [])
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
                            updateUser(user.id, user.role, modules)
                          }}
                        />
                        {m}
                      </label>
                    )
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

