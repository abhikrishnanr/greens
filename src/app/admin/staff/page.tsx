'use client'
import { useEffect, useState } from 'react'

interface Staff {
  id: string
  name: string
  phone: string
  designation: string
}
interface Branch { id: string; name: string }

export default function StaffPage() {
  const [branch, setBranch] = useState<string>('')
  const [branches, setBranches] = useState<Branch[]>([])
  const [staff, setStaff] = useState<Staff[]>([])

  useEffect(() => {
    fetch('/api/branch').then(r => r.json()).then(d => { if (d.success) setBranches(d.branches) })
  }, [])

  useEffect(() => {
    if (!branch) return
    fetch(`/api/staff?branchId=${branch}`).then(r => r.json()).then(d => {
      if (d.success) setStaff(d.staff)
    })
  }, [branch])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Staff</h1>
      <select className="bg-gray-800 p-2 rounded mb-4" value={branch} onChange={e => setBranch(e.target.value)}>
        <option value="">Select branch</option>
        {branches.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
      {staff.length > 0 && (
        <table className="w-full text-sm text-left">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Designation</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id} className="border-t border-gray-700">
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.designation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
