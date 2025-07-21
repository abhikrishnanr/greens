'use client'
import { useEffect, useState } from 'react'
import { format, addMinutes, differenceInMinutes } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Branch { id:string; name:string }
interface Staff { id:string; name:string }
interface Service { id:string; name:string }
interface Tier { id:string; name:string; duration?:number|null; currentPrice?:{actualPrice:number; offerPrice?:number|null}|null }
interface BookingItem { serviceTierId:string; serviceTier:Tier }
interface Booking { id:string; customerName:string; scheduledAt:string; duration:number; staffId?:string; staff?:Staff; items:BookingItem[] }

export default function WalkInPage(){
  const [branches,setBranches]=useState<Branch[]>([])
  const [branch,setBranch]=useState('')
  const [staff,setStaff]=useState<Staff[]>([])
  const [services,setServices]=useState<Service[]>([])
  const [staffId,setStaffId]=useState('')
  const [serviceId,setServiceId]=useState('')
  const [tiers,setTiers]=useState<Tier[]>([])
  const [tierId,setTierId]=useState('')
  const [date,setDate]=useState(format(new Date(),'yyyy-MM-dd'))
  const [time,setTime]=useState('09:00')
  const [customerName,setCustomerName]=useState('')
  const [phone,setPhone]=useState('')
  const [bookings,setBookings]=useState<Booking[]>([])
  const [duration,setDuration]=useState(0)
  const [amount,setAmount]=useState(0)

  useEffect(()=>{
    fetch('/api/branch').then(r=>r.json()).then(d=>{if(d.success) setBranches(d.branches)})
  },[])

  useEffect(()=>{
    if(!branch) return
    fetch(`/api/branch/${branch}/data`).then(r=>r.json()).then(d=>{
      if(d.success){ setStaff(d.staff); setServices(d.services) }
    })
  },[branch])

  useEffect(()=>{ loadBookings() },[branch,date])

  const loadBookings=()=>{
    if(!branch) return
    fetch(`/api/bookings?branchId=${branch}&date=${date}`).then(r=>r.json()).then(d=>{if(d.success) setBookings(d.bookings)})
  }

  const selectService=async(id:string)=>{
    setServiceId(id); setTierId('')
    const res=await fetch(`/api/admin/service-tiers/${id}`)
    const data=await res.json() as Tier[]
    setTiers(data)
  }

  useEffect(()=>{
    const tier=tiers.find(t=>t.id===tierId)
    if(tier){
      setDuration(tier.duration||0)
      const price=tier.currentPrice?.offerPrice ?? tier.currentPrice?.actualPrice ?? 0
      setAmount(price)
    }
  },[tierId,tiers])

  const create=async()=>{
    if(!branch||!tierId) return
    const scheduledAt=new Date(`${date}T${time}:00`)
    await fetch('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      customerName,phone,branchId:branch,staffId:staffId||null,scheduledAt,duration,estimatedAmount:amount,items:[{serviceTierId:tierId}]})})
    setCustomerName('');setPhone('');setServiceId('');setTierId('');
    loadBookings()
  }

  const slots:Array<{time:Date,label:string}>=[]
  const start=new Date(`${date}T09:00:00`)
  for(let i=0;i<48;i++){ const t=addMinutes(start,i*15); slots.push({time:t,label:format(t,'HH:mm')}) }

  function bookingColor(id:string){ return '#'+id.replace(/-/g,'').slice(0,6) }
  function renderCell(s:Staff,slot:Date){
    const b=bookings.filter(bk=>bk.staffId===s.id && new Date(bk.scheduledAt)<=slot && addMinutes(new Date(bk.scheduledAt),bk.duration)>slot)
    if(b.length===0) return null
    return b.map(bk=>(
      <div key={bk.id} title={`${bk.customerName} - ${bk.items.map(i=>i.serviceTier.name).join(', ')}`}
        style={{background:bookingColor(bk.id)}} className="w-full h-4 mb-0.5 rounded" />
    ))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-700">Walk-In Booking</h1>
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded shadow">
        <div>
          <label>Branch</label>
          <select className="border p-2" value={branch} onChange={e=>setBranch(e.target.value)}>
            <option value="">Select</option>
            {branches.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label>Date</label>
          <Input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow space-y-4">
        <div className="flex flex-wrap gap-4">
          <Input placeholder="Customer Name" value={customerName} onChange={e=>setCustomerName(e.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
          <select className="border p-2" value={serviceId} onChange={e=>selectService(e.target.value)}>
            <option value="">Service</option>
            {services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="border p-2" value={tierId} onChange={e=>setTierId(e.target.value)}>
            <option value="">Tier</option>
            {tiers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select className="border p-2" value={staffId} onChange={e=>setStaffId(e.target.value)}>
            <option value="">Staff</option>
            {staff.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <Input type="time" value={time} step="900" onChange={e=>setTime(e.target.value)} />
          <Button onClick={create}>Create</Button>
        </div>
        <div className="text-sm text-gray-600">Duration: {duration} mins | Amount: ₹{amount}</div>
      </div>
      {staff.length>0 && (
      <div className="overflow-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-2 border" />
              {staff.map(s=> <th key={s.id} className="p-2 border text-left">{s.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {slots.map(sl=> (
              <tr key={sl.label} className="h-6">
                <td className="border px-2 whitespace-nowrap">{sl.label}</td>
                {staff.map(st=> (
                  <td key={st.id+sl.label} className="border w-32">
                    {renderCell(st,sl.time)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>) }
    </div>
  )
}
