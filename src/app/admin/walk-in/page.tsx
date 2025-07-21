'use client'
import { useEffect, useState, FormEvent } from 'react'

interface Tier {
  id: string
  tierName: string
  serviceName: string
  categoryName: string
  duration?: number | null
  price?: number | null
}

interface Staff { id: string; name: string }

interface Booking {
  id: string
  customerName: string
  customerPhone: string
  startTime: string
  duration: number
  services: string
  totalAmount: number
  staffId?: string | null
  staff?: Staff | null
}

const COLORS = ['bg-red-300','bg-blue-300','bg-green-300','bg-yellow-300','bg-purple-300','bg-pink-300']

export default function WalkInAdmin() {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [time, setTime] = useState('09:00')
  const [assign, setAssign] = useState('')

  const loadTiers = async () => {
    const res = await fetch('/api/admin/service-tiers/all')
    const data = await res.json()
    setTiers(data)
  }
  const loadStaff = async () => {
    const res = await fetch('/api/staff')
    const { staff } = await res.json()
    setStaff(staff)
  }
  const loadBookings = async () => {
    const res = await fetch(`/api/walkin-bookings?date=${date}`)
    const data = await res.json()
    setBookings(data)
  }

  useEffect(() => { loadTiers(); loadStaff(); }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadBookings() }, [date])

  const tiersSelected = tiers.filter(t => selected.includes(t.id))
  const amount = tiersSelected.reduce((s,t)=> s + (t.price || 0),0)
  const duration = tiersSelected.reduce((s,t)=> s + (t.duration || 0),0)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const body = {
      customerName: name,
      customerPhone: phone,
      services: tiersSelected,
      startTime: `${date}T${time}:00`,
      staffId: assign || null
    }
    await fetch('/api/walkin-bookings',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    })
    setName(''); setPhone(''); setSelected([]); setTime('09:00'); setAssign('');
    loadBookings()
  }

  const startOfDay = new Date(`${date}T09:00:00`)
  const slots = Array.from({length:48},(_,i)=>{
    const d = new Date(startOfDay.getTime()+i*15*60000)
    return d.toTimeString().slice(0,5)
  })
  const colorMap = (id:string)=> COLORS[id.split('-')[0].charCodeAt(0)%COLORS.length]

  const bookingsFor = (sid:string|null,slot:number)=>
    bookings.filter(b=> (sid?b.staffId===sid:!b.staffId) &&
      slot>=Math.floor((new Date(b.startTime).getTime()-startOfDay.getTime())/900000) &&
      slot<Math.floor((new Date(b.startTime).getTime()-startOfDay.getTime())/900000)+Math.ceil(b.duration/15))

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-green-700">Walk-in Bookings</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
        <div className="flex gap-4 flex-wrap">
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border p-2 rounded" />
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Customer Name" className="border p-2 rounded" required />
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" className="border p-2 rounded" required />
          <select multiple value={selected} onChange={e=> setSelected(Array.from(e.target.selectedOptions).map(o=>o.value))} className="border p-2 rounded flex-1 min-w-48" size={4}>
            {tiers.map(t=> <option key={t.id} value={t.id}>{t.categoryName} - {t.serviceName} - {t.tierName}</option>)}
          </select>
          <input type="time" step="900" min="09:00" max="20:45" value={time} onChange={e=>setTime(e.target.value)} className="border p-2 rounded" />
          <select value={assign} onChange={e=>setAssign(e.target.value)} className="border p-2 rounded">
            <option value="">Unassigned</option>
            {staff.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex items-center font-semibold">Amount: ₹{amount} | Duration: {duration}m</div>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">Add Booking</button>
      </form>

      <div className="overflow-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr>
              <th className="border px-2">Time</th>
              <th className="border px-2">Unassigned</th>
              {staff.map(s=> <th key={s.id} className="border px-2">{s.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {slots.map((t,i)=>(
              <tr key={t}>
                <td className="border px-2 whitespace-nowrap">{t}</td>
                <td className="border h-6 w-32">
                  <div className="flex gap-0.5 h-full">
                    {bookingsFor(null,i).map(b=> (
                      <div key={b.id} className={`flex-1 ${colorMap(b.id)}`} title={`${b.customerName} ₹${b.totalAmount}`}></div>
                    ))}
                  </div>
                </td>
                {staff.map(s=> (
                  <td key={s.id} className="border h-6 w-32">
                    <div className="flex gap-0.5 h-full">
                      {bookingsFor(s.id,i).map(b=> (
                        <div key={b.id} className={`flex-1 ${colorMap(b.id)}`} title={`${b.customerName} ₹${b.totalAmount}`}></div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
