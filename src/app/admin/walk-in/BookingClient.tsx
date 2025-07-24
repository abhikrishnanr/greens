"use client"

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import {
  Calendar,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  User,
  Scissors,
  Clock,
  DollarSign,
  ListChecks,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface Category {
  id: string
  name: string
}
interface Variant {
  id: string
  name: string
  duration?: number | null
  currentPrice?: { actualPrice: number; offerPrice?: number | null } | null
}
interface Service {
  id: string
  name: string
  variants: Variant[]
}
interface StaffApi {
  id: string
  name: string
  phone: string | null
  removed: boolean
  branchId: string | null
}
interface Staff {
  id: string
  name: string
}
interface Selected {
  id: string
  serviceId: string
  name: string
  duration: number
  price: number
  staffId: string
  date: string
  start: string
  color: string
}
interface Booking {
  id: string
  staffId: string
  date: string
  start: string
  color: string
}

const COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#c084fc", "#f472b6"]

export default function BookingClient() {
  const [categories, setCategories] = useState<Category[]>([])
  const [category, setCategory] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [selectedSvc, setSelectedSvc] = useState("")
  const [variants, setVariants] = useState<Variant[]>([])
  const [selectedTier, setSelectedTier] = useState("")
  const [items, setItems] = useState<Selected[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [customer, setCustomer] = useState("")
  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState("")
  const [age, setAge] = useState("")
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [edit, setEdit] = useState<Booking | null>(null)
  const [editStaffId, setEditStaffId] = useState("")
  const [editStart, setEditStart] = useState("")
  const formRef = useRef<HTMLFormElement>(null)
  const [attemptSubmit, setAttemptSubmit] = useState(false)

  const searchParams = useSearchParams()

  useEffect(() => {
    const n = searchParams.get('name')
    const p = searchParams.get('phone')
    const g = searchParams.get('gender')
    if (n) setCustomer(n)
    if (p) setPhone(p)
    if (g) setGender(g)
  }, [searchParams])

  // Original load functions - no dummy data here
  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/service-categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
      setResult({ success: false, message: 'Failed to load service categories.' })
    }
  }

  const loadServices = async () => {
    if (!category) {
      setServices([])
      setVariants([])
      setSelectedSvc('')
      return
    }
    try {
      const res = await fetch(`/api/admin/services-walkin/${category}`)
      if (!res.ok) throw new Error('Failed to fetch services')
      const data: Service[] = await res.json()
      setServices(data.filter((s) => s.variants.some((v) => v.currentPrice)))
    } catch (error) {
      console.error('Error loading services:', error)
      setResult({ success: false, message: 'Failed to load services for this category.' })
    }
  }

  const loadStaff = async () => {
    try {
      const res = await fetch('/api/staff')
      if (!res.ok) throw new Error('Failed to fetch staff')
      const { staff: staffData } = await res.json()
      setStaff((staffData as StaffApi[]).filter((s) => !s.removed))
    } catch (error) {
      console.error('Error loading staff:', error)
      setResult({ success: false, message: 'Failed to load staff members.' })
    }
  }

  const loadBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings/' + date)
      if (!res.ok) throw new Error('Failed to fetch bookings')
      const data: Booking[] = await res.json()
      setBookings(data)
    } catch (error) {
      console.error('Error loading bookings:', error)
      setResult({ success: false, message: 'Failed to load bookings for this date.' })
    }
  }

  useEffect(() => {
    loadCategories()
    loadServices()
    loadStaff()
  }, [])

  useEffect(() => {
    loadServices()
  }, [category])

  useEffect(() => {
    loadBookings()
  }, [date])

  const addService = (id: string, name: string, duration: number, price: number) => {
    const color = COLORS[items.length % COLORS.length]
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        serviceId: id,
        name,
        duration,
        price,
        staffId: '',
        date,
        start: '',
        color,
      },
    ])
    setSelectedTier('')
  }

  const totalDuration = items.reduce((acc, i) => acc + i.duration, 0)
  const totalAmount = items.reduce((acc, i) => acc + i.price, 0)

  const allTimes: string[] = []
  const base = new Date(date)
  base.setHours(9, 0, 0, 0)
  for (let i = 0; i < 48; i++) {
    allTimes.push(format(new Date(base.getTime() + i * 15 * 60000), 'HH:mm'))
  }

  const timeOptionsFor = (duration: number) => {
    const slots: string[] = []
    const startBase = new Date(date)
    startBase.setHours(9, 0, 0, 0)
    const endBase = new Date(date)
    endBase.setHours(21, 0, 0, 0)
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const now = new Date()
    for (let t of allTimes) {
      const start = new Date(`${date}T${t}:00`)
      const end = new Date(start.getTime() + duration * 60000)
      if (start < startBase || end > endBase) continue
      if (date === todayStr && end <= now) continue
      if (bookings.some((b) => b.start === t && b.staffId === editStaffId && b.date === date)) continue
      slots.push(t)
    }
    return slots
  }

  const saveBooking = async () => {
    if (!formRef.current) return
    const formData = new FormData(formRef.current)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    })
    const data = await res.json()
    setResult(data)
    if (data.success) {
      formRef.current.reset()
      setItems([])
      loadBookings()
    }
  }

  const cancelBooking = async () => {
    if (!edit) return
    const res = await fetch(`/api/bookings/${edit.id}`, { method: 'DELETE' })
    const data = await res.json()
    setResult(data)
    if (data.success) {
      setEdit(null)
      loadBookings()
    }
  }

  const updateBooking = async () => {
    if (!edit) return
    const res = await fetch(`/api/bookings/${edit.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId: editStaffId, start: editStart }),
    })
    const data = await res.json()
    setResult(data)
    if (data.success) {
      setEdit(null)
      loadBookings()
    }
  }

  const bookingsFor = (id: string, time: string) =>
    bookings.filter((b) => b.staffId === id && b.date === date && b.start === time)

  const isPhoneInvalid = phone.length > 0 && phone.length !== 10

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Greens Salon Admin: Walk-in Booking</h1>
        <div className="flex items-center gap-3">
          <Label htmlFor="booking-date" className="sr-only">
            Booking Date
          </Label>
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="booking-date"
              type="date"
              min={format(new Date(), 'yyyy-MM-dd')}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-8 w-40 text-sm"
            />
          </div>
        </div>
      </div>

      {result && (
        <div
          className={`rounded-md p-4 mb-4 ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {result.message}
        </div>
      )}

      <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={customer} onChange={(e) => setCustomer(e.target.value)} name="customer" required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} name="phone" />
              {isPhoneInvalid && <p className="text-sm text-red-600">Phone must be 10 digits</p>}
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender} name="gender">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input value={age} onChange={(e) => setAge(e.target.value)} name="age" type="number" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Service Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {services.length > 0 && (
              <div className="space-y-2">
                <Label>Service</Label>
                <Select value={selectedSvc} onValueChange={setSelectedSvc}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {variants.length > 0 && (
              <div className="space-y-2">
                <Label>Variant</Label>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {variants.map((v) => (
                      <SelectItem key={v.id} value={`${v.id}:${v.duration}:${v.currentPrice?.actualPrice}`}> {v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedTier && (
              <Button
                type="button"
                onClick={() => {
                  const [id, dur, price] = selectedTier.split(':')
                  addService(
                    id,
                    services.find((s) => s.id === selectedSvc)?.name || '',
                    Number(dur),
                    Number(price)
                  )
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Service
              </Button>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <Card key={item.id} className="border-l-8" style={{ borderColor: item.color }}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.duration} mins</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Staff</Label>
                      <Select
                        value={item.staffId}
                        onValueChange={(val) =>
                          setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, staffId: val } : it)))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Select
                        value={item.start}
                        onValueChange={(val) =>
                          setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, start: val } : it)))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptionsFor(item.duration).map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setItems((prev) => prev.filter((it) => it.id !== item.id))}
                    className="mt-2"
                  >
                    <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end items-center gap-4">
              <p className="font-medium">
                Total Duration: {totalDuration} mins / Amount: ₹{totalAmount}
              </p>
              <Button type="submit" onClick={() => setAttemptSubmit(true)}>
                <Scissors className="w-4 h-4 mr-1" /> Book
              </Button>
            </div>
          </div>
        )}
      </form>

      {bookings.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Bookings for {date}</h2>
          {bookings.map((b) => (
            <Card key={b.id} className="border-l-8" style={{ borderColor: b.color }}>
              <CardContent className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{staff.find((s) => s.id === b.staffId)?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{b.start}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-gray-500" />
                  <span>{items.find((i) => i.staffId === b.staffId && i.start === b.start)?.name || 'Service'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span>
                    ₹{items.reduce((acc, i) => (i.staffId === b.staffId && i.start === b.start ? acc + i.price : acc), 0)}
                  </span>
                </div>
                <Button onClick={() => setEdit(b)} size="icon" variant="ghost">
                  <Edit className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Edit Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Staff</Label>
                <Select value={editStaffId} onValueChange={setEditStaffId}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Time</Label>
                <Select value={editStart} onValueChange={setEditStart}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allTimes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={cancelBooking} variant="destructive" size="sm" className="flex-1">
                  <Trash2 className="w-4 h-4 mr-1" /> Cancel Booking
                </Button>
                <Button onClick={updateBooking} size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" /> Save Changes
                </Button>
                <Button onClick={() => setEdit(null)} variant="outline" size="sm">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
