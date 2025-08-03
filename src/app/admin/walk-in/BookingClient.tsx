"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"

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
  IndianRupee,
  ListChecks,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import ReactSelect from "react-select"

interface Variant {
  id: string
  name: string
  duration?: number | null
  currentPrice?: { actualPrice: number; offerPrice?: number | null } | null
}

interface ServiceOption {
  id: string
  name: string
  categoryId: string
  categoryName: string
  variants: Variant[]
}

interface ServiceSelectOption {
  value: string
  label: string
}

interface Staff {
  id: string
  name: string
}

interface StaffApi extends Staff {
  removed: boolean
}

interface VariantFull {
  id: string
  serviceId: string
  variantName: string
  serviceName: string
  categoryName: string
  duration?: number | null
  current?: { actualPrice: number; offerPrice?: number | null } | null
}

interface Selected {
  serviceId: string
  variantId: string
  name: string
  duration: number
  price: number
  staffId: string
  start: string
  billed?: boolean
  customer?: string | null
  phone?: string | null
  gender?: string
  age?: number | null
}

interface Booking {
  id: string
  customer: string | null
  phone: string | null
  gender: string
  age: number | null
  items: Selected[]
  staffId: string
  date: string
  start: string
  color: string
}

const COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#c084fc", "#f472b6"]

export default function AdminBooking() {
  const [services, setServices] = useState<ServiceOption[]>([])
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
  const [editItem, setEditItem] = useState<(Selected & { bookingId: string }) | null>(null)
  const [editItemStaffId, setEditItemStaffId] = useState("")
  const [editItemStart, setEditItemStart] = useState("")
  const [editCustomer, setEditCustomer] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editGender, setEditGender] = useState("")
  const [editAge, setEditAge] = useState("")
  const formRef = useRef<HTMLFormElement>(null)
  const [attemptSubmit, setAttemptSubmit] = useState(false)
  const [customerStats, setCustomerStats] = useState<{ totalAmount: number; billCount: number } | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const n = searchParams.get('name')
    const p = searchParams.get('phone')
    const g = searchParams.get('gender')
    const v = searchParams.get('variants')
    if (n) setCustomer(n)
    if (p) setPhone(p)
    if (g) setGender(g)
    if (v) {
      const ids = v.split(',')
      fetch('/api/admin/service-variants/all')
        .then(res => res.json())
        .then((all: VariantFull[]) => {
          const pre = all
            .filter(t => ids.includes(t.id))
            .map(t => ({
              serviceId: t.serviceId,
              variantId: t.id,
              name: `${t.serviceName} - ${t.variantName}`,
              duration: t.duration || 0,
              price: t.current?.offerPrice ?? t.current?.actualPrice ?? 0,
              staffId: '',
              start: '',
            }))
          setItems(pre)
        })
        .catch(err => console.error('prefill variants failed', err))
    }
  }, [searchParams])

  const loadServices = async () => {
    try {
      const res = await fetch("/api/admin/services-walkin")
      if (!res.ok) throw new Error("Failed to fetch services")
      const data: ServiceOption[] = await res.json()
      setServices(data.filter((s) => s.variants.some((v) => v.currentPrice)))
    } catch (error) {
      console.error("Error loading services:", error)
      setResult({ success: false, message: "Failed to load services." })
    }
  }

  const loadStaff = async () => {
    try {
      const res = await fetch("/api/staff")
      if (!res.ok) throw new Error("Failed to fetch staff")
      const { staff: staffData } = await res.json()
      setStaff((staffData as StaffApi[]).filter((s) => !s.removed))
    } catch (error) {
      console.error("Error loading staff:", error)
      setResult({ success: false, message: "Failed to load staff members." })
    }
  }

  const loadBookings = async () => {
    try {
      const res = await fetch(`/api/bookings?date=${date}`)
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      } else {
        throw new Error("Failed loading bookings")
      }
    } catch (err) {
      console.error("Failed loading bookings", err)
      setResult({ success: false, message: "Failed to load bookings for the selected date." })

    }
  }

  useEffect(() => {
    loadServices()
    loadStaff()
  }, [])
  useEffect(() => {
    loadBookings()
  }, [date])
  useEffect(() => {
    if (!selectedSvc) return
    const svc = services.find((s) => s.id === selectedSvc)
    setVariants(svc?.variants || [])
  }, [selectedSvc, services])
  useEffect(() => {
    localStorage.setItem("walkin-bookings", JSON.stringify(bookings))
  }, [bookings])
  useEffect(() => {
    if (edit) {
      setEditStaffId(edit.staffId)
      setEditStart(edit.start)
    }
  }, [edit])
  useEffect(() => {
    if (editItem) {
      setEditItemStaffId(editItem.staffId)
      setEditItemStart(editItem.start)
      setEditCustomer(editItem.customer || "")
      setEditPhone(editItem.phone || "")
      setEditGender(editItem.gender || "")
      setEditAge(editItem.age ? String(editItem.age) : "")
    }
  }, [editItem])

  useEffect(() => {
    setCustomerStats(null)
    setCustomer("")
    setGender("")
  }, [phone])

  const addItem = () => {
    const variant = variants.find((t) => t.id === selectedTier)
    if (!variant) {
      setResult({ success: false, message: "Please select a variant first." })
      return
    }

    const price = variant.currentPrice?.offerPrice ?? variant.currentPrice?.actualPrice ?? 0
    const duration = variant.duration || 0
    const serviceName = services.find((s) => s.id === selectedSvc)?.name || ""

    setItems([
      ...items,
      {
        serviceId: selectedSvc,
        variantId: variant.id,
        name: `${serviceName} - ${variant.name}`,
        duration,
        price,
        staffId: "",
        start: "",
      },
    ])
    setSelectedTier("")
  }

  const totalDuration = items.reduce((acc, i) => acc + i.duration, 0)
  const totalAmount = items.reduce((acc, i) => acc + i.price, 0)

  const allTimes = [] as string[]
  const base = new Date(date)
  base.setHours(9, 0, 0, 0)
  for (let i = 0; i < 48; i++) {
    allTimes.push(format(new Date(base.getTime() + i * 15 * 60000), "HH:mm"))
  }

  const timeOptionsFor = (duration: number) => {
    const slots: string[] = []
    const startBase = new Date(date)
    startBase.setHours(9, 0, 0, 0)
    const endBase = new Date(date)
    endBase.setHours(21, 0, 0, 0)
    const todayStr = format(new Date(), "yyyy-MM-dd")
    const now = new Date()

    for (
      let t = new Date(startBase);
      t.getTime() + duration * 60000 <= endBase.getTime();
      t = new Date(t.getTime() + 15 * 60000)
    ) {
      if (date === todayStr && t < now) continue
      slots.push(format(t, "HH:mm"))
    }
    return slots
  }

  const toMin = (s: string) => {
    const [h, m] = s.split(":").map(Number)
    return h * 60 + m
  }


  const busySlots = (staffId: string, idx?: number, itemId?: string) => {
    const slots = new Set<string>()
    const mark = (start: string, dur: number) => {
      let minutes = toMin(start)
      for (let m = 0; m < dur; m += 15) {
        const d = new Date(date)
        d.setHours(0, 0, 0, 0)
        slots.add(format(new Date(d.getTime() + minutes * 60000), "HH:mm"))
        minutes += 15
      }
    }
    for (const b of bookings) {
      for (const it of b.items) {
        if (itemId && it.id === itemId) continue
        if (it.staffId !== staffId) continue
        mark(it.start, it.duration)
      }
    }
    for (let i = 0; i < items.length; i++) {
      if (idx !== undefined && i === idx) continue
      const it = items[i]
      if (it.staffId !== staffId || !it.start) continue
      mark(it.start, it.duration)
    }
    return slots
  }

  const hasBusyRange = (
    busy: Set<string>,
    start: string,
    duration: number,
  ) => {
    let minutes = toMin(start)
    for (let m = 0; m < duration; m += 15) {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      if (busy.has(format(new Date(d.getTime() + minutes * 60000), "HH:mm"))) {
        return true
      }
      minutes += 15
    }
    return false
  }

  const lookupCustomer = async () => {
    if (phone.length !== 10) {
      setResult({ success: false, message: "Phone number must be exactly 10 digits." })
      return
    }
    try {
      const res = await fetch(`/api/customer?phone=${phone}`)
      if (res.ok) {
        const data = await res.json()
        if (data.customer) {
          setCustomer(data.customer.name || "")
          setGender(data.customer.gender || "")
          setCustomerStats({ totalAmount: data.totalAmount, billCount: data.billCount })
        } else {
          setCustomer("")
          setGender("")
          setCustomerStats(null)
        }
      }
    } catch (err) {
      console.error("customer lookup failed", err)
    }
  }

  const saveBooking = async () => {
    if (!gender || items.length === 0) {
      setResult({ success: false, message: "Please select gender and add at least one service." })
      return
    }
    if (phone && (phone.length !== 10 || !/^\d{10}$/.test(phone))) {
      setResult({ success: false, message: "Phone number must be exactly 10 digits." })
      return
    }
    if (items.some((i) => !i.staffId || !i.start)) {
      setResult({ success: false, message: "Please assign staff and time for all services." })
      return
    }
    if (!window.confirm(`Total amount ₹${totalAmount}. Confirm booking?`)) return

    try {
      const color = COLORS[bookings.length % COLORS.length]

      const formattedItems = items.map(({ variantId, ...rest }) => ({
        ...rest,
        tierId: variantId,
      }))

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customer || null,
          phone: phone || null,
          gender,
          age: age ? Number(age) : null,
          date,
          color,
          items: formattedItems,
        }),
      })
      if (res.ok) {
        const booking: Booking = await res.json()
        setBookings((b) => [...b, booking])
        setResult({ success: true, message: "Booking saved successfully" })
      } else {
        throw new Error("Request failed")
      }
    } catch (err) {
      console.error("Failed saving booking", err)
      setResult({ success: false, message: "Failed to save booking" })
    } finally {
      setCustomer("")
      setPhone("")
      setGender("")
      setAge("")
      setItems([])
      setCustomerStats(null)
    }
  }

  const updateBooking = async () => {
    if (!edit) return

    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: edit.id, staffId: editStaffId, start: editStart }),
      })
      if (res.ok) {
        const updated = await res.json()
        setBookings((bs) => bs.map((b) => (b.id === updated.id ? updated : b)))
        setEdit(null)
        setResult({ success: true, message: "Booking updated successfully!" })
      } else {
        throw new Error("Request failed")
      }
    } catch (err) {
      console.error("Failed updating booking", err)
      setResult({ success: false, message: "Failed to update booking." })

    }
  }

  const cancelBooking = async () => {
    if (!edit) return
    if (!window.confirm("Cancel this booking?")) return

    try {
      const res = await fetch(`/api/bookings?id=${edit.id}`, { method: "DELETE" })
      if (res.ok) {
        setBookings((bs) => bs.filter((b) => b.id !== edit.id))
        setEdit(null)
        setResult({ success: true, message: "Booking cancelled successfully!" })
      } else {
        throw new Error("Request failed")
      }
    } catch (err) {
      console.error("Failed cancelling booking", err)
      setResult({ success: false, message: "Failed to cancel booking." })
    }
  }

  const updateBookingItem = async () => {
    if (!editItem) return
    try {
      const res = await fetch('/api/booking-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editItem.id,
          staffId: editItemStaffId,
          start: editItemStart,
          customer: editCustomer,
          phone: editPhone,
          gender: editGender,
          age: editAge ? Number(editAge) : null,
        }),
      })
      if (res.ok) {
        const { booking } = await res.json()
        setBookings(bs => bs.map(b => (b.id === booking.id ? booking : b)))
        setEditItem(null)
        setResult({ success: true, message: 'Booking updated successfully!' })
      } else {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Request failed')
      }
    } catch (err) {
      console.error('Failed updating booking item', err)
      setResult({ success: false, message: 'Failed to update booking.' })
    }
  }

  const cancelBookingItem = async () => {
    if (!editItem) return
    if (!window.confirm('Cancel this booking?')) return
    try {
      const res = await fetch(`/api/booking-items?id=${editItem.id}`, { method: 'DELETE' })
      if (res.ok || res.status === 204) {
        setBookings(bs =>
          bs
            .map(b =>
              b.id === editItem.bookingId ? { ...b, items: b.items.filter(it => it.id !== editItem.id) } : b,
            )
            .filter(b => b.items.length > 0),
        )
        setEditItem(null)
        setResult({ success: true, message: 'Booking cancelled successfully!' })
      } else {
        throw new Error('Request failed')
      }
    } catch (err) {
      console.error('Failed cancelling booking item', err)
      setResult({ success: false, message: 'Failed to cancel booking.' })
    }
  }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleItemClick = (it: any) => {
      if (it.billed) {
        setResult({ success: false, message: 'This booking has already been billed and cannot be edited.' })
        return
      }
      setEditItem(it)
    }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAttemptSubmit(true)
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity()
      return

    }
    saveBooking()
  }

  const bookingItems = bookings.flatMap((b) =>
    b.items.map((it) => ({
      ...it,
      bookingId: b.id,
      color: b.color,
      customer: b.customer,
      phone: b.phone,
      gender: b.gender,
      age: b.age,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      billed: (it as any).billed,
    }))
  )

  const itemsFor = (id: string, time: string) =>
    bookingItems.filter((it) => it.staffId === id && it.start === time)

  const isPhoneInvalid = phone.length > 0 && phone.length !== 10

  const staffSummary = staff.map((s) => ({
    id: s.id,
    name: s.name,
    count:
      bookings.reduce((acc, b) => acc + b.items.filter((it) => it.staffId === s.id).length, 0) +
      items.filter((it) => it.staffId === s.id).length,
  }))
  const maxCount = Math.max(1, ...staffSummary.map((s) => s.count))

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
              min={format(new Date(), "yyyy-MM-dd")}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-8 w-40 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Form - Left Side */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card className="border-l-4 border-blue-500 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <User className="h-5 w-5 text-blue-600" /> Customer Details
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Enter the customer&apos;s name and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="e.g., 5551234567"
                    className={`h-9 flex-1 ${isPhoneInvalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    maxLength={10}
                  />
                  <Button type="button" onClick={lookupCustomer} className="h-9 px-4">
                    Go
                  </Button>
                </div>
                {isPhoneInvalid && <p className="text-xs text-red-500">Phone number must be exactly 10 digits.</p>}
              </div>

              {customerStats && (
                <div className="flex items-center gap-4 p-2 bg-green-50 border rounded">
                  <span className="text-sm font-medium">Existing customer</span>
                  <span className="flex items-center gap-1 text-sm"><IndianRupee className="h-4 w-4 text-green-600" />₹{customerStats.totalAmount}</span>
                  <span className="flex items-center gap-1 text-sm"><ListChecks className="h-4 w-4 text-green-600" />{customerStats.billCount} bills</span>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer" className="text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="customer"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="e.g., Jane Doe"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Gender</Label>
                  <div
                    className={`flex items-center gap-4 h-9 ${attemptSubmit && !gender ? "border border-red-500 rounded-md px-2" : ""}`}
                  >
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={gender === "male"}
                        onChange={(e) => setGender(e.target.value)}
                        required
                      />
                      Male
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={gender === "female"}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      Female
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm">Approx Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="in years"
                  className="h-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Selection */}
          <Card className="border-l-4 border-green-500 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Scissors className="h-5 w-5 text-green-600" /> Select Services
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Choose the services and variants, then assign staff and time for each.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Service</Label>
                <ReactSelect<ServiceSelectOption>
                  className="w-full text-sm"
                  styles={{
                    control: (base) => ({ ...base, minHeight: '36px', height: '36px' }),
                  }}
                  options={services.map((s) => ({
                    value: s.id,
                    label: `${s.categoryName} - ${s.name}`,
                  }))}
                  value=
                    {selectedSvc
                      ? {
                          value: selectedSvc,
                          label: `${
                            services.find((s) => s.id === selectedSvc)?.categoryName
                          } - ${services.find((s) => s.id === selectedSvc)?.name}`,
                        }
                      : null}
                  onChange={(opt: ServiceSelectOption | null) => setSelectedSvc(opt?.value || "")}
                  placeholder="Select service"
                  isSearchable
                />
              </div>

              {variants.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Variant</Label>
                  <div className="flex gap-2">
                    <Select value={selectedTier} onValueChange={setSelectedTier}>
                      <SelectTrigger className="flex-1 h-9">
                        <SelectValue placeholder="Select variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {variants.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                          {t.name} ({t.duration}m) - ₹{t.currentPrice?.offerPrice ?? t.currentPrice?.actualPrice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button onClick={addItem} size="sm" className="h-9 px-3 bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>
                </div>
              )}

              {items.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <Label className="text-sm flex items-center gap-1">
                    <ListChecks className="h-4 w-4 text-gray-600" /> Assigned Services
                  </Label>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {items.map((item, idx) => (
                      <div key={item.variantId} className="border rounded-md p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm truncate" title={item.name}>
                            {item.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setItems(items.filter((_, i) => i !== idx))}
                            className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Staff</Label>
                            <Select
                              value={item.staffId}
                              onValueChange={(value) =>
                                setItems(items.map((it, i) => (i === idx ? { ...it, staffId: value, start: "" } : it)))
                              }
                              required
                              className={`h-8 text-xs ${attemptSubmit && !item.staffId ? "border-red-500 focus:ring-red-500" : ""}`}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select staff" />
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
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Time</Label>
                            <Select
                              value={item.start}
                              onValueChange={(value) =>
                                setItems(items.map((it, i) => (i === idx ? { ...it, start: value } : it)))
                              }
                              disabled={!item.staffId}
                              required
                              className={`h-8 text-xs ${attemptSubmit && !item.start ? "border-red-500 focus:ring-red-500" : ""}`}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder={item.staffId ? "Select time" : "Select staff first"} />
                              </SelectTrigger>
                              <SelectContent>
                                {(() => {
                                  const busy = item.staffId ? busySlots(item.staffId, idx) : null
                                  return timeOptionsFor(item.duration).map((t) => {
                                    const isBusy = busy && hasBusyRange(busy, t, item.duration)
                                    return (
                                      <SelectItem
                                        key={t}
                                        value={t}
                                        data-busy={isBusy ? 'true' : undefined}
                                        className={isBusy ? 'option-busy' : undefined}
                                        style={isBusy ? { backgroundColor: '#fef08a', color: '#000' } : undefined}
                                      >
                                        {t}
                                      </SelectItem>
                                    )
                                  })
                                })()}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col justify-end pb-1">
                            <span className="text-xs text-gray-600">Duration: {item.duration}m</span>
                            <span className="text-xs font-medium text-gray-800">Price: ₹{item.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-semibold text-gray-800 flex items-center gap-1">
                      <IndianRupee className="h-4 w-4 text-gray-600" /> Total: {totalDuration}m • ₹{totalAmount}
                    </span>
                    <Button
                      type="submit"
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
                    >
                      Confirm Booking
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </form>

        <div className="space-y-6">
          <Card className="border-l-4 border-purple-500 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Clock className="h-5 w-5 text-purple-600" /> Daily Schedule
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                View and manage appointments for {format(new Date(date), "MMMM dd, yyyy")}. Click on a booking to edit.
              </CardDescription>
            </CardHeader>
            <div className="px-4 space-y-1">
              {staffSummary.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="text-xs w-20">{s.name}</span>
                  <div className="flex-1 bg-gray-200 h-2 rounded">
                    <div
                      className="bg-purple-400 h-2 rounded"
                      style={{ width: `${(s.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs w-6 text-right">{s.count}</span>
                </div>
              ))}
            </div>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[700px]">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 bg-gray-100 z-10">
                    <tr>
                      <th className="w-20 p-2 text-left border border-gray-200 font-medium text-gray-700">Time</th>
                      {staff.map((s) => (
                        <th
                          key={s.id}
                          className="min-w-[120px] p-2 text-left border border-gray-200 font-medium text-gray-700"
                        >
                          {s.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allTimes.map((time) => (
                      <tr key={time}>
                        <td className="border border-gray-200 p-1 text-gray-600 font-mono align-top">{time}</td>
                        {staff.map((st) => (
                          <td key={st.id + time} className="border border-gray-200 h-10 relative p-0 align-top">
                            {itemsFor(st.id, time).map((it, i, arr) => (
                              <div
                                key={it.id}
                                className={`absolute inset-0 text-white flex items-center justify-center text-[10px] px-1 rounded-sm m-0.5 overflow-hidden whitespace-nowrap text-ellipsis ${it.billed ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                style={{
                                  background: it.color,
                                  width: `${100 / arr.length}%`,
                                  left: `${(i * 100) / arr.length}%`,
                                }}
                                title={`${it.customer} - ${it.name} - ₹${it.price}`}
                                onClick={() => handleItemClick(it)}
                              >
                                {it.name}
                              </div>
                            ))}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {result && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center space-y-4">
              {result.success ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              ) : (
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">{result.success ? "Success!" : "Error!"}</h3>
              <p className="text-gray-600 text-sm">{result.message}</p>
              <Button onClick={() => setResult(null)} className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Edit Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Customer:</span> {edit.customer}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {edit.phone}
                </p>
                <p>
                  <span className="font-medium">Services:</span> {edit.items.map((i) => i.name).join(", ")}
                </p>
              </div>
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
                  <Trash2 className="w-4 h-4 mr-1" />
                  Cancel Booking
                </Button>
                <Button onClick={updateBooking} size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Save Changes
                </Button>
                <Button onClick={() => setEdit(null)} variant="outline" size="sm">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {editItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Edit Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm">
                <div className="space-y-1">
                  <Label>Customer</Label>
                  <Input value={editCustomer} onChange={e => setEditCustomer(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input value={editPhone} onChange={e => setEditPhone(e.target.value.replace(/\D/g, '').slice(0,10))} />
                </div>
                <div className="space-y-1">
                  <Label>Gender</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1 text-sm">
                      <input type="radio" value="male" name="editgender" checked={editGender === 'male'} onChange={e => setEditGender(e.target.value)} />
                      Male
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input type="radio" value="female" name="editgender" checked={editGender === 'female'} onChange={e => setEditGender(e.target.value)} />
                      Female
                    </label>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Age</Label>
                  <Input type="number" value={editAge} onChange={e => setEditAge(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Service</Label>
                  <Input value={editItem.name} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Staff</Label>
                <Select value={editItemStaffId} onValueChange={setEditItemStaffId}>
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
                <Select value={editItemStart} onValueChange={setEditItemStart}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const busy = editItemStaffId
                        ? busySlots(editItemStaffId, undefined, editItem.id)
                        : null
                      return allTimes.map((t) => {
                        const isBusy = busy && hasBusyRange(busy, t, editItem.duration)
                        return (
                          <SelectItem
                            key={t}
                            value={t}
                            data-busy={isBusy ? 'true' : undefined}
                            className={isBusy ? 'option-busy' : undefined}
                            style={isBusy ? { backgroundColor: '#fef08a', color: '#000' } : undefined}
                          >
                            {t}
                          </SelectItem>
                        )
                      })
                    })()}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={cancelBookingItem} variant="destructive" size="sm" className="flex-1">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Cancel Booking
                </Button>
                <Button onClick={updateBookingItem} size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Save Changes
                </Button>
                <Button onClick={() => setEditItem(null)} variant="outline" size="sm">
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
