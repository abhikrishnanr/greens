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
  staffId: string
  start: string
}

interface Booking {
  id: string
  customer: string
  phone: string
  items: Selected[]
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
  const [customer,setCustomer] = useState('')
  const [phone,setPhone] = useState('')
  const [date,setDate] = useState(() => format(new Date(),'yyyy-MM-dd'))

  const [bookings,setBookings] = useState<Booking[]>([])
  const [result,setResult] = useState<{success:boolean,message:string}|null>(null)
  const [edit,setEdit] = useState<Booking|null>(null)
  const [editStaffId,setEditStaffId] = useState('')
  const [editStart,setEditStart] = useState('')

  const loadCategories = async() => {
    const res = await fetch('/api/admin/service-categories')
    const data = await res.json()
    setCategories(data)
  }

  const loadServices = async() => {
    if(!category) return
    const res = await fetch(`/api/admin/services-new/${category}`)
    const data: Service[] = await res.json()
    const enriched: Service[] = []
    for(const svc of data){
      const tRes = await fetch(`/api/admin/service-tiers/${svc.id}`)
      const tiers: Tier[] = await tRes.json()
      if(tiers.some(t=>t.currentPrice)){
        enriched.push({...svc, tiers})
      }
    }
    setServices(enriched)
  }

  const loadStaff = async() => {
    const res = await fetch('/api/staff')
    const { staff: staffData } = await res.json()
    setStaff((staffData as StaffApi[]).filter(s=>!s.removed))
  }

  const loadBookings = async() => {

    const res = await fetch(`/api/bookings?date=${date}`)
    if(res.ok) {
      const data = await res.json()
      setBookings(data)
    } else {
      console.error('Failed loading bookings')

    }
  }

  useEffect(()=>{ loadCategories(); loadStaff(); },[])
  useEffect(()=>{ loadBookings() },[date])
  useEffect(()=>{ loadServices(); setSelectedSvc(''); setTiers([]); },[category])
  useEffect(()=>{
    if(!selectedSvc) return
    const svc = services.find(s=>s.id===selectedSvc)
    setTiers(svc?.tiers||[])
  },[selectedSvc])
  useEffect(()=>{ localStorage.setItem('walkin-bookings', JSON.stringify(bookings)) },[bookings])
  useEffect(()=>{ if(edit){ setEditStaffId(edit.staffId); setEditStart(edit.start) } },[edit])

  const addItem = () => {
    const tier = tiers.find(t=>t.id===selectedTier)
    if(!tier) return
    const price = tier.currentPrice?.offerPrice ?? tier.currentPrice?.actualPrice ?? 0
    const duration = tier.duration || 0
    setItems([...items,{ serviceId:selectedSvc,tierId:tier.id,name:`${services.find(s=>s.id===selectedSvc)?.name} - ${tier.name}`,duration,price,staffId:'',start:'' }])
    setSelectedTier('')
  }

  const totalDuration = items.reduce((acc,i)=>acc+i.duration,0)
  const totalAmount = items.reduce((acc,i)=>acc+i.price,0)

  const allTimes = [] as string[]
  const base = new Date(date)
  base.setHours(9,0,0,0)
  for(let i=0;i<48;i++) {
    allTimes.push(format(new Date(base.getTime()+i*15*60000),'HH:mm'))
  }

  const timeOptionsFor = (duration:number) => {
    const slots:string[] = []
    const startBase = new Date(date)
    startBase.setHours(9,0,0,0)
    const endBase = new Date(date)
    endBase.setHours(21,0,0,0)
    const todayStr = format(new Date(),'yyyy-MM-dd')
    const now = new Date()
    for(let t=new Date(startBase); t.getTime()+duration*60000<=endBase.getTime(); t=new Date(t.getTime()+15*60000)) {
      if(date===todayStr && t<now) continue
      slots.push(format(t,'HH:mm'))
    }
    return slots
  }

  const toMin = (s:string) => {
    const [h,m] = s.split(':').map(Number)
    return h*60+m
  }

  const hasConflict = (staffId:string,start:string,duration:number,idx:number) => {
    if(!staffId) return false
    const st = toMin(start)
    const en = st + duration
    for(const b of bookings) {
      if(b.staffId!==staffId || b.date!==date) continue
      const bst = toMin(b.start)
      const ben = bst + b.items.reduce((a,i)=>a+i.duration,0)
      if(st < ben && en > bst) return true
    }
    for(let i=0;i<items.length;i++) {
      if(i===idx) continue
      const it = items[i]
      if(it.staffId!==staffId || !it.start) continue
      const ist = toMin(it.start)
      const ien = ist + it.duration
      if(st < ien && en > ist) return true
    }
    return false
  }

  const saveBooking = async() => {
    if(!customer||!phone||!items.length) return
    if(items.some(i=>!i.staffId || !i.start)) return
    if(!window.confirm(`Total amount ₹${totalAmount}. Confirm booking?`)) return
    const color = COLORS[bookings.length % COLORS.length]
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, phone, date, color, items })
      })
      if(res.ok) {
        const booking: Booking = await res.json()
        setBookings(b => [...b, booking])

        setResult({success:true, message:'Booking saved successfully'})

      } else {
        throw new Error('Request failed')
      }
    } catch(err) {

      console.error('Failed saving booking', err)
      setResult({success:false, message:'Failed to save booking'})

    } finally {
      setCustomer(''); setPhone(''); setItems([])
    }
  }

  const updateBooking = async() => {
    if(!edit) return
    const res = await fetch('/api/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: edit.id, staffId: editStaffId, start: editStart })
    })
    if(res.ok){
      const updated = await res.json()
      setBookings(bs=>bs.map(b=>b.id===updated.id?updated:b))
      setEdit(null)
    }
  }

  const cancelBooking = async() => {
    if(!edit) return
    if(!window.confirm('Cancel this booking?')) return
    const res = await fetch(`/api/bookings?id=${edit.id}`, { method: 'DELETE' })
    if(res.ok){
      setBookings(bs=>bs.filter(b=>b.id!==edit.id))
      setEdit(null)
    }
  }

  const bookingsFor = (id:string, time:string) => bookings.filter(b=>b.staffId===id && b.date===date && b.start===time)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Walk-in Booking</h1>
      <div className="grid md:grid-cols-2 gap-4 bg-white p-4 rounded shadow">
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Customer Name</label>
            <input value={customer} onChange={e=>setCustomer(e.target.value)} className="w-full p-2 border rounded"/>
            <p className="text-xs text-gray-500">Enter customer name</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone</label>
            <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-2 border rounded"/>
            <p className="text-xs text-gray-500">Enter phone number</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Category</label>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-2 border rounded">
              <option value=''>Select category</option>
              {categories.map(c=>(<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <p className="text-xs text-gray-500">Choose service category</p>
          </div>
          {services.length>0 && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Service</label>
              <select value={selectedSvc} onChange={e=>setSelectedSvc(e.target.value)} className="w-full p-2 border rounded">
                <option value=''>Select service</option>
                {services.map(s=>(<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
              <p className="text-xs text-gray-500">Choose a service</p>
            </div>
          )}
          {tiers.length>0 && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Tier</label>
              <div className="flex gap-2">
                <select value={selectedTier} onChange={e=>setSelectedTier(e.target.value)} className="flex-1 p-2 border rounded">
                  <option value=''>Select tier</option>
                  {tiers.map(t=> (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <button onClick={addItem} className="bg-green-600 text-white px-3 rounded">Add</button>
              </div>
              <p className="text-xs text-gray-500">Select tier and add</p>
            </div>
          )}
          {items.length>0 && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Items</label>
              <ul className="space-y-2 text-sm">
                {items.map((i,idx)=> (
                  <li key={i.tierId} className="grid grid-cols-6 gap-2 items-center">
                    <span className="col-span-2 truncate" title={i.name}>{i.name}</span>
                    <select
                      value={i.staffId}
                      onChange={e=>setItems(itms=>itms.map((it,j)=> j===idx?{...it,staffId:e.target.value,start:''}:it))}
                      className="border rounded p-1"
                    >
                      <option value=''>Staff</option>
                      {staff.map(s=>(<option key={s.id} value={s.id}>{s.name}</option>))}
                    </select>
                    <select
                      value={i.start}
                      onChange={e=>setItems(itms=>itms.map((it,j)=> j===idx?{...it,start:e.target.value}:it))}
                      className="border rounded p-1"
                    >
                      <option value=''>Time</option>
                      {timeOptionsFor(i.duration).map(t=> (
                        <option key={t} value={t} style={{backgroundColor: i.staffId && hasConflict(i.staffId,t,i.duration,idx)?'#fef08a':undefined}}>{t}</option>
                      ))}
                    </select>
                    <span>{i.duration}m ₹{i.price}</span>
                    <button onClick={()=>setItems(itms=>itms.filter((_,j)=>j!==idx))} className="text-red-600">✕</button>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500">Assign staff and time for each service</p>
            </div>
          )}
          {items.length>0 && (
            <div className="text-sm font-medium">Total: {totalDuration}m ₹{totalAmount}</div>
          )}
        </div>
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Date</label>
            <input type="date" min={format(new Date(),'yyyy-MM-dd')} value={date} onChange={e=>setDate(e.target.value)} className="w-full p-2 border rounded" />
            <p className="text-xs text-gray-500">Booking date</p>
          </div>
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
            {allTimes.map(time=> (
              <tr key={time}>
                <td className="border px-1 whitespace-nowrap">{time}</td>
                {staff.map(st=> (
                  <td key={st.id+time} className="border h-8 relative">
                    {bookingsFor(st.id,time).map((b,i,arr)=>(
                      <div
                        key={b.id}
                        className="absolute inset-y-0 text-white flex items-center justify-center text-[10px] cursor-pointer px-1"
                        style={{
                          background: b.color,
                          width: `${100/arr.length}%`,
                          left: `${(i*100)/arr.length}%`,
                        }}
                        title={`${b.customer} - ₹${b.items.reduce((a,i)=>a+i.price,0)}`}
                        onClick={()=>setEdit(b)}
                      >
                        {b.items.map(it=>it.name).join(', ')}
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded shadow space-y-2">
            <p>{result.message}</p>
            <button onClick={() => setResult(null)} className="bg-green-700 text-white px-4 py-2 rounded">Close</button>
          </div>
        </div>
      )}
      {edit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded shadow space-y-3 w-72">
            <h2 className="font-medium">Booking Details</h2>
            <p className="text-sm">Customer: {edit.customer}</p>
            <p className="text-sm">Services: {edit.items.map(i=>i.name).join(', ')}</p>
            <div className="space-y-1">
              <label className="text-sm font-medium">Staff</label>
              <select value={editStaffId} onChange={e=>setEditStaffId(e.target.value)} className="w-full p-2 border rounded">
                {staff.map(s=>(<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Time</label>
              <select value={editStart} onChange={e=>setEditStart(e.target.value)} className="w-full p-2 border rounded">
                {allTimes.map(t=>(<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={cancelBooking} className="text-red-600 px-3 py-1 border rounded">Cancel</button>
              <button onClick={updateBooking} className="bg-green-700 text-white px-3 py-1 rounded">Save</button>
              <button onClick={()=>setEdit(null)} className="px-3 py-1 border rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
