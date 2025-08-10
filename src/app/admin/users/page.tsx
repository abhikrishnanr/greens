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
      .then((data) => setUsers(data.users))
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Roles</h1>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Modules</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-b-0">
              <td className="p-2">{user.name ?? '—'}</td>
              <td className="p-2">{user.email ?? '—'}</td>
              <td className="p-2">
                <select
                  value={user.role}
                  onChange={(e) =>
                    updateUser(user.id, e.target.value, user.modules ?? [])
                  }
                  className="border p-1 rounded"
                >
                  <option value="admin">admin</option>
                  <option value="manager">manager</option>
                  <option value="staff">staff</option>
                  <option value="customer">customer</option>
                </select>
              </td>
              <td className="p-2">
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

