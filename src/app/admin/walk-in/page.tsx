'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface Category {
  id: string
  name: string
}

interface Tier {
  id: string
  name: string
  duration?: number | null
  currentPrice?: { actualPrice: number; offerPrice?: number | null } | null
}

interface Service {
  id: string
  name: string
  tiers: Tier[]
}

interface Staff {
  id: string
  name: string
}
interface StaffApi extends Staff { removed: boolean }

interface Selected {
  serviceId: string
  tierId: string
  name: string
  duration: number
  price: number
}

interface Booking {
  id: string
  customer: string
  phone: string
  services: Selected[]
  staffId: string
  date: string
  start: string
  color: string
}

const COLORS = ['#f87171','#60a5fa','#34d399','#fbbf24','#c084fc','#f472b6']

export default function WalkIn() {
  const [categories,setCategories] = useState<Category[]>([])
  const [category,setCategory] = useState('')
  const [services,setServices] = useState<Service[]>([])
  const [selectedSvc,setSelectedSvc] = useState('')
  const [tiers,setTiers] = useState<Tier[]>([])
  const [selectedTier,setSelectedTier] = useState('')
  const [items,setItems] = useState<Selected[]>([])

  const [staff,setStaff] = useState<Staff[]>([])
  const [staffId,setStaffId] = useState('')
  const [customer,setCustomer] = useState('')
  const [phone,setPhone] = useState('')
  const [date,setDate] = useState(() => format(new Date(),'yyyy-MM-dd'))
  const [start,setStart] = useState('')

  const [bookings,setBookings] = useState<Booking[]>([])

  const loadCategories = async() => {
    const res = await fetch('/api/admin/service-categories')
    const data = await res.json()
    setCategories(data)
  }

  const loadServices = async() => {
    if(!category) return
    const res = await fetch(`/api/admin/services-new/${category}`)
    const data = await res.json()
    setServices(data)
  }

  const loadStaff = async() => {
    const res = await fetch('/api/staff')
    const { staff: staffData } = await res.json()
    setStaff((staffData as StaffApi[]).filter(s=>!s.removed))
  }

  useEffect(()=>{ loadCategories(); loadStaff();
    const stored = localStorage.getItem('walkin-bookings')
    if(stored) {
      try {
        const parsed: Booking[] = JSON.parse(stored)
        setBookings(parsed.map(b => ({ date: b.date ?? format(new Date(),'yyyy-MM-dd'), ...b })))
      } catch {}
    }
  },[])
  useEffect(()=>{ loadServices(); setSelectedSvc(''); setTiers([]); },[category])
  useEffect(()=>{
    if(!selectedSvc) return
    const svc = services.find(s=>s.id===selectedSvc)
    setTiers(svc?.tiers||[])
  },[selectedSvc])
  useEffect(()=>{ localStorage.setItem('walkin-bookings',JSON.stringify(bookings)) },[bookings])

  const addItem = () => {
    const tier = tiers.find(t=>t.id===selectedTier)
    if(!tier) return
    const price = tier.currentPrice?.offerPrice ?? tier.currentPrice?.actualPrice ?? 0
    const duration = tier.duration || 0
    setItems([...items,{ serviceId:selectedSvc,tierId:tier.id,name:`${services.find(s=>s.id===selectedSvc)?.name} - ${tier.name}`,duration,price }])
    setSelectedTier('')
  }

  const totalDuration = items.reduce((acc,i)=>acc+i.duration,0)
  const totalAmount = items.reduce((acc,i)=>acc+i.price,0)

  const times = [] as string[]
  const base = new Date(date)
  base.setHours(9,0,0,0)
  for(let i=0;i<48;i++) {
    times.push(format(new Date(base.getTime()+i*15*60000),'HH:mm'))
  }

  const saveBooking = () => {
    if(!customer||!phone||!items.length||!staffId||!start) return
    const color = COLORS[bookings.length % COLORS.length]
    const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`
    setBookings(b => [...b,{ id, customer, phone, services:items, staffId, date, start, color }])
    setCustomer(''); setPhone(''); setItems([]); setStaffId(''); setStart('')
  }

  const bookingsFor = (id:string, time:string) => bookings.filter(b=>b.staffId===id && b.date===date && b.start===time)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Walk-in Booking</h1>
      <div className="grid md:grid-cols-2 gap-4 bg-white p-4 rounded shadow">
        <div className="space-y-2">
          <input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Customer name" className="w-full p-2 border rounded"/>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" className="w-full p-2 border rounded"/>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-2 border rounded">
            <option value=''>Select category</option>
            {categories.map(c=>(<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          {services.length>0 && (
            <select value={selectedSvc} onChange={e=>setSelectedSvc(e.target.value)} className="w-full p-2 border rounded">
              <option value=''>Select service</option>
              {services.map(s=>(<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          )}
          {tiers.length>0 && (
            <div className="flex gap-2">
              <select value={selectedTier} onChange={e=>setSelectedTier(e.target.value)} className="flex-1 p-2 border rounded">
                <option value=''>Select tier</option>
                {tiers.map(t=> (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button onClick={addItem} className="bg-green-600 text-white px-3 rounded">Add</button>
            </div>
          )}
          {items.length>0 && (
            <ul className="space-y-1 text-sm">
              {items.map(i=> (
                <li key={i.tierId} className="flex justify-between"><span>{i.name}</span><span>{i.duration}m ₹{i.price}</span></li>
              ))}
            </ul>
          )}
          {items.length>0 && (
            <div className="text-sm font-medium">Total: {totalDuration}m ₹{totalAmount}</div>
          )}
        </div>
        <div className="space-y-2">
          <select value={staffId} onChange={e=>setStaffId(e.target.value)} className="w-full p-2 border rounded">
            <option value=''>Select staff</option>
            {staff.map(s=>(<option key={s.id} value={s.id}>{s.name}</option>))}
          </select>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full p-2 border rounded" />
          <select value={start} onChange={e=>setStart(e.target.value)} className="w-full p-2 border rounded">
            <option value=''>Select time</option>
            {times.map(t=> (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button onClick={saveBooking} className="bg-green-700 text-white px-4 py-2 rounded">Confirm Booking</button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="table-fixed border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-20">Time</th>
              {staff.map(s=>(<th key={s.id} className="w-40 text-left">{s.name}</th>))}
            </tr>
          </thead>
          <tbody>
            {times.map(time=> (
              <tr key={time}>
                <td className="border px-1 whitespace-nowrap">{time}</td>
                {staff.map(st=> (
                  <td key={st.id+time} className="border h-8 relative">
                    {bookingsFor(st.id,time).map((b,i,arr)=>(
                      <div
                        key={b.id}
                        className="absolute inset-y-0 text-white flex items-center justify-center text-xs"
                        style={{
                          background: b.color,
                          width: `${100/arr.length}%`,
                          left: `${(i*100)/arr.length}%`,
                        }}
                        title={`${b.customer} - ₹${b.services.reduce((a,i)=>a+i.price,0)}`}
                      ></div>
                    ))}
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
