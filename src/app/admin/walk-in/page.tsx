"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Calendar, Plus, X, CheckCircle, AlertCircle, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface StaffApi extends Staff {
  removed: boolean
}

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

const COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#c084fc", "#f472b6"]

export default function AdminBooking() {
  const [categories, setCategories] = useState<Category[]>([])
  const [category, setCategory] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [selectedSvc, setSelectedSvc] = useState("")
  const [tiers, setTiers] = useState<Tier[]>([])
  const [selectedTier, setSelectedTier] = useState("")
  const [items, setItems] = useState<Selected[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [customer, setCustomer] = useState("")
  const [phone, setPhone] = useState("")
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [edit, setEdit] = useState<Booking | null>(null)
  const [editStaffId, setEditStaffId] = useState("")
  const [editStart, setEditStart] = useState("")

  // Load functions (keeping original logic)
  const loadCategories = async () => {
    const res = await fetch("/api/admin/service-categories")
    const data = await res.json()
    setCategories(data)
  }

  const loadServices = async () => {
    if (!category) return
    const res = await fetch(`/api/admin/services-new/${category}`)
    const data: Service[] = await res.json()
    const enriched: Service[] = []
    for (const svc of data) {
      const tRes = await fetch(`/api/admin/service-tiers/${svc.id}`)
      const tiers: Tier[] = await tRes.json()
      if (tiers.some((t) => t.currentPrice)) {
        enriched.push({ ...svc, tiers })
      }
    }
    setServices(enriched)
  }

  const loadStaff = async () => {
    const res = await fetch("/api/staff")
    const { staff: staffData } = await res.json()
    setStaff((staffData as StaffApi[]).filter((s) => !s.removed))
  }

  const loadBookings = async () => {
    const res = await fetch(`/api/bookings?date=${date}`)
    if (res.ok) {
      const data = await res.json()
      setBookings(data)
    } else {
      console.error("Failed loading bookings")
    }
  }

  useEffect(() => {
    loadCategories()
    loadStaff()
  }, [])
  useEffect(() => {
    loadBookings()
  }, [date])
  useEffect(() => {
    loadServices()
    setSelectedSvc("")
    setTiers([])
  }, [category])
  useEffect(() => {
    if (!selectedSvc) return
    const svc = services.find((s) => s.id === selectedSvc)
    setTiers(svc?.tiers || [])
  }, [selectedSvc])
  useEffect(() => {
    localStorage.setItem("walkin-bookings", JSON.stringify(bookings))
  }, [bookings])
  useEffect(() => {
    if (edit) {
      setEditStaffId(edit.staffId)
      setEditStart(edit.start)
    }
  }, [edit])

  const addItem = () => {
    const tier = tiers.find((t) => t.id === selectedTier)
    if (!tier) return
    const price = tier.currentPrice?.offerPrice ?? tier.currentPrice?.actualPrice ?? 0
    const duration = tier.duration || 0
    setItems([
      ...items,
      {
        serviceId: selectedSvc,
        tierId: tier.id,
        name: `${services.find((s) => s.id === selectedSvc)?.name} - ${tier.name}`,
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

  const hasConflict = (staffId: string, start: string, duration: number, idx: number) => {
    if (!staffId) return false
    const st = toMin(start)
    const en = st + duration
    for (const b of bookings) {
      if (b.staffId !== staffId || b.date !== date) continue
      const bst = toMin(b.start)
      const ben = bst + b.items.reduce((a, i) => a + i.duration, 0)
      if (st < ben && en > bst) return true
    }
    for (let i = 0; i < items.length; i++) {
      if (i === idx) continue
      const it = items[i]
      if (it.staffId !== staffId || !it.start) continue
      const ist = toMin(it.start)
      const ien = ist + it.duration
      if (st < ien && en > ist) return true
    }
    return false
  }

  const saveBooking = async () => {
    if (!customer || !phone || !items.length) return
    if (items.some((i) => !i.staffId || !i.start)) return
    if (!window.confirm(`Total amount ₹${totalAmount}. Confirm booking?`)) return

    const color = COLORS[bookings.length % COLORS.length]
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, phone, date, color, items }),
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
      setItems([])
    }
  }

  const updateBooking = async () => {
    if (!edit) return
    const res = await fetch("/api/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: edit.id, staffId: editStaffId, start: editStart }),
    })
    if (res.ok) {
      const updated = await res.json()
      setBookings((bs) => bs.map((b) => (b.id === updated.id ? updated : b)))
      setEdit(null)
    }
  }

  const cancelBooking = async () => {
    if (!edit) return
    if (!window.confirm("Cancel this booking?")) return
    const res = await fetch(`/api/bookings?id=${edit.id}`, { method: "DELETE" })
    if (res.ok) {
      setBookings((bs) => bs.filter((b) => b.id !== edit.id))
      setEdit(null)
    }
  }

  const bookingsFor = (id: string, time: string) =>
    bookings.filter((b) => b.staffId === id && b.date === date && b.start === time)

  return (
    <div className="p-4 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Walk-in Booking</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Input
              type="date"
              min={format(new Date(), "yyyy-MM-dd")}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Booking Form - Left Side */}
        <div className="col-span-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">New Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="customer" className="text-xs">
                    Customer Name
                  </Label>
                  <Input
                    id="customer"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="h-8"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-8"
                    placeholder="Enter phone"
                  />
                </div>
              </div>

              {/* Service Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select category" />
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
                  <div>
                    <Label className="text-xs">Service</Label>
                    <Select value={selectedSvc} onValueChange={setSelectedSvc}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select service" />
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
              </div>

              {tiers.length > 0 && (
                <div>
                  <Label className="text-xs">Tier</Label>
                  <div className="flex gap-2">
                    <Select value={selectedTier} onValueChange={setSelectedTier}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name} - {t.duration}m - ₹{t.currentPrice?.actualPrice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addItem} size="sm" className="h-8 px-3">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Selected Items */}
              {items.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs">Selected Services</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {items.map((item, idx) => (
                      <div key={item.tierId} className="border rounded p-2 text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium truncate" title={item.name}>
                            {item.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setItems(items.filter((_, i) => i !== idx))}
                            className="h-6 w-6 p-0 text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Select
                            value={item.staffId}
                            onValueChange={(value) =>
                              setItems(items.map((it, i) => (i === idx ? { ...it, staffId: value, start: "" } : it)))
                            }
                          >
                            <SelectTrigger className="h-6 text-xs">
                              <SelectValue placeholder="Staff" />
                            </SelectTrigger>
                            <SelectContent>
                              {staff.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={item.start}
                            onValueChange={(value) =>
                              setItems(items.map((it, i) => (i === idx ? { ...it, start: value } : it)))
                            }
                            disabled={!item.staffId}
                          >
                            <SelectTrigger className="h-6 text-xs">
                              <SelectValue placeholder="Time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptionsFor(item.duration).map((t) => (
                                <SelectItem
                                  key={t}
                                  value={t}
                                  className={
                                    item.staffId && hasConflict(item.staffId, t, item.duration, idx)
                                      ? "bg-yellow-100"
                                      : ""
                                  }
                                >
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-gray-600 flex items-center">
                            {item.duration}m ₹{item.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">
                      Total: {totalDuration}m ₹{totalAmount}
                    </span>
                    <Button
                      onClick={saveBooking}
                      disabled={!customer || !phone || items.some((i) => !i.staffId || !i.start)}
                      size="sm"
                    >
                      Confirm Booking
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Schedule Grid - Right Side */}
        <div className="col-span-7">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Schedule - {format(new Date(date), "MMM dd, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[600px]">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="w-16 p-2 text-left border">Time</th>
                      {staff.map((s) => (
                        <th key={s.id} className="w-32 p-2 text-left border">
                          {s.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allTimes.map((time) => (
                      <tr key={time}>
                        <td className="border p-1 text-gray-600 font-mono">{time}</td>
                        {staff.map((st) => (
                          <td key={st.id + time} className="border h-8 relative p-0">
                            {bookingsFor(st.id, time).map((b, i, arr) => (
                              <div
                                key={b.id}
                                className="absolute inset-0 text-white flex items-center justify-center text-[10px] cursor-pointer px-1 truncate"
                                style={{
                                  background: b.color,
                                  width: `${100 / arr.length}%`,
                                  left: `${(i * 100) / arr.length}%`,
                                }}
                                title={`${b.customer} - ₹${b.items.reduce((a, i) => a + i.price, 0)}`}
                                onClick={() => setEdit(b)}
                              >
                                {b.customer}
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

      {/* Result Modal */}
      {result && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Card className="w-80">
            <CardContent className="p-4 text-center space-y-3">
              {result.success ? (
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              ) : (
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              )}
              <p className="text-sm">{result.message}</p>
              <Button onClick={() => setResult(null)} size="sm" className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Booking Modal */}
      {edit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Card className="w-80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Edit Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p>
                  <strong>Customer:</strong> {edit.customer}
                </p>
                <p>
                  <strong>Phone:</strong> {edit.phone}
                </p>
                <p>
                  <strong>Services:</strong> {edit.items.map((i) => i.name).join(", ")}
                </p>
              </div>
              <div>
                <Label className="text-xs">Staff</Label>
                <Select value={editStaffId} onValueChange={setEditStaffId}>
                  <SelectTrigger className="h-8">
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
              <div>
                <Label className="text-xs">Time</Label>
                <Select value={editStart} onValueChange={setEditStart}>
                  <SelectTrigger className="h-8">
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
                  <Trash2 className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
                <Button onClick={updateBooking} size="sm" className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Save
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
