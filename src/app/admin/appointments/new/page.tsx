'use client'
import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface Service { id: string; name: string }
interface Branch { id: string; name: string }
interface Staff { id: string; name: string }

export default function NewAppointment() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [branch, setBranch] = useState('')

  useEffect(() => {
    fetch('/api/branch')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setBranches(d.branches)
          if (d.branches.length === 1) setBranch(String(d.branches[0].id))
        }
      })
  }, [])

  useEffect(() => {
    if (!branch) return
    fetch(`/api/services?branchId=${branch}`)
      .then(r => r.json())
      .then(d => d.success && setServices(d.services))
    fetch(`/api/staff?branchId=${branch}`)
      .then(r => r.json())
      .then(d => d.success && setStaff(d.staff))
  }, [branch])

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preferredDate: fd.get('date'),
        customerName: fd.get('name'),
        customerPhone: fd.get('phone'),
        customerGender: fd.get('gender'),
        branchId: fd.get('branchId'),
        items: [{ serviceId: fd.get('serviceId'), staffId: fd.get('staffId') || undefined }],
      }),
    })
    const data = await res.json()
    if (data.success) router.push('/admin/appointments')
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4 text-green-700">New Appointment</h1>
      <div>
        <label className="block mb-1">Branch</label>
        <select name="branchId" value={branch} onChange={e => setBranch(e.target.value)} required className="p-2 border rounded w-full">
          <option value="">Select branch</option>
          {branches.map(b => (
            <option key={b.id} value={String(b.id)}>{b.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Service</label>
        <select name="serviceId" required className="p-2 border rounded w-full">
          <option value="">Select service</option>
          {services.map(s => (
            <option key={s.id} value={String(s.id)}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Staff (optional)</label>
        <select name="staffId" className="p-2 border rounded w-full">
          <option value="">Any</option>
          {staff.map(s => (
            <option key={s.id} value={String(s.id)}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Preferred Date</label>
        <input type="date" name="date" required className="p-2 border rounded w-full" />
      </div>
      <div>
        <label className="block mb-1">Customer Name</label>
        <input name="name" required className="p-2 border rounded w-full" />
      </div>
      <div>
        <label className="block mb-1">Customer Phone</label>
        <input name="phone" maxLength={10} required className="p-2 border rounded w-full" />
      </div>
      <div>
        <label className="block mb-1">Gender</label>
        <select name="gender" required className="p-2 border rounded w-full">
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
    </form>
  )
}
