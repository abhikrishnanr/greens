"use client"

import { useEffect, useState } from "react"
import ReactSelect from "react-select"
import { Search, CheckCircle, Clock, XCircle, ClipboardList, Plus, User, Phone } from "lucide-react"

interface BookingItem {
  id: string
  name: string
  price: number
  status: string
}

interface Booking {
  id: string
  start: string
  status: string
  customer: string | null
  phone: string | null
  items: BookingItem[]
}

interface Group {
  phone: string | null
  customer: string | null
  bookings: Booking[]
}

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

export default function AssignmentsPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [groups, setGroups] = useState<Group[]>([])
  const [services, setServices] = useState<ServiceOption[]>([])
  const [selectedService, setSelectedService] = useState<Record<string, string>>({})
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({})
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, cancelled: 0 })
  const [search, setSearch] = useState("")

  const maskPhone = (phone: string | null) => {
    if (!phone) return "No Phone"
    return `XXXXXX${phone.slice(-4)}`
  }

  const load = async () => {
    const res = await fetch(`/api/staff/assignments?date=${date}`)
    const data = await res.json()
    if (data.success) {
      setGroups(data.groups)
      const allItems = data.groups.flatMap((g: Group) => g.bookings.flatMap((b: Booking) => b.items))
      setStats({
        total: allItems.length,
        pending: allItems.filter((it: BookingItem) => it.status === "pending").length,
        completed: allItems.filter((it: BookingItem) => it.status === "completed").length,
        cancelled: allItems.filter((it: BookingItem) => it.status === "cancelled").length,
      })
    }
  }

  useEffect(() => {
    load()
  }, [date])

  useEffect(() => {
    fetch("/api/admin/services-walkin")
      .then((res) => res.json())
      .then((d: ServiceOption[]) => {
        if (Array.isArray(d)) setServices(d)
      })
  }, [])

  const updateItemStatus = async (id: string, status: string) => {
    await fetch(`/api/staff/assignments/items/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    load()
  }

  const addService = async (bookingId: string) => {
    const svcId = selectedService[bookingId]
    const variantId = selectedVariant[bookingId]
    const svc = services.find((s) => s.id === svcId)
    const variant = svc?.variants.find((v) => v.id === variantId)
    if (!svc || !variant) return
    await fetch(`/api/staff/assignments/${bookingId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: svc.id,
        tierId: variant.id,
        name: `${svc.name} - ${variant.name}`,
        price: variant.currentPrice?.offerPrice ?? variant.currentPrice?.actualPrice ?? 0,
        duration: variant.duration || 0,
      }),
    })
    setSelectedService((p) => ({ ...p, [bookingId]: "" }))
    setSelectedVariant((p) => ({ ...p, [bookingId]: "" }))
    load()
  }

  const updateCustomer = async (bookingId: string, customer: string, phone: string) => {
    await fetch(`/api/staff/assignments/${bookingId}/customer`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, phone }),
    })
    load()
  }

  const searchLower = search.toLowerCase()
  const filteredGroups = groups
    .map((g) => {
      const filteredBookings = g.bookings
        .map((b) => ({
          ...b,
          items: b.items.filter((it) => it.name.toLowerCase().includes(searchLower)),
        }))
        .filter((b) => b.items.length > 0)
      const matchGroup = (g.customer || "").toLowerCase().includes(searchLower) || (g.phone || "").includes(search)
      if (matchGroup) return g
      if (filteredBookings.length === 0) return null
      return { ...g, bookings: filteredBookings }
    })
    .filter(Boolean) as Group[]

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-800 to-green-600 rounded-xl text-white shadow-lg">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
                  Daily Assignments
                </h1>
                <p className="text-gray-600 text-sm">Manage your salon appointments and services</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers or services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-3 w-64 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm"
                />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Services</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold mt-1">{stats.completed}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Cancelled</p>
                <p className="text-3xl font-bold mt-1">{stats.cancelled}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-1">
          {filteredGroups.map((g, idx) => (
            <div
  key={idx}
  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-visible"
>

              <div className="bg-gradient-to-r from-emerald-800 to-green-600 p-6 text-white">
                <div className="flex items-center gap-1">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{g.customer || "Walk-in Customer"}</h3>
                    <div className="flex items-center gap-2 text-rose-100">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{maskPhone(g.phone)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {g.bookings.map((b) => (
                  <div key={b.id} className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <Clock className="h-4 w-4 text-rose-600" />
                      </div>
                      <span className="font-semibold text-gray-800">{b.start}</span>
                    </div>

                    <div className="space-y-3">
                      {b.items.map((it) => (
                        <div key={it.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  it.status === "completed"
                                    ? "bg-green-100 text-green-600"
                                    : it.status === "cancelled"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-amber-100 text-amber-600"
                                }`}
                              >
                                {it.status === "completed" && <CheckCircle className="h-4 w-4" />}
                                {it.status === "cancelled" && <XCircle className="h-4 w-4" />}
                                {it.status === "pending" && <Clock className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{it.name}</p>
                                <p className="text-sm text-gray-500">₹{it.price}</p>
                              </div>
                            </div>

                            {it.status === "pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateItemStatus(it.id, "completed")}
                                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => updateItemStatus(it.id, "cancelled")}
                                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-rose-50 rounded-xl p-4 border border-purple-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Plus className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Add Extra Service</span>
                      </div>

                      <div className="space-y-3">
                        <ReactSelect<ServiceSelectOption>
  className="text-sm"
  classNamePrefix="rs"
  options={services.map((s) => ({ value: s.id, label: `${s.categoryName} - ${s.name}` }))}

  value={
    selectedService[b.id]
      ? {
          value: selectedService[b.id],
          label: `${services.find((s) => s.id === selectedService[b.id])?.categoryName} - ${
            services.find((s) => s.id === selectedService[b.id])?.name
          }`,
        }
      : null
  }

  onChange={(opt) => {
    const val = opt?.value || ""
    setSelectedService((prev) => ({ ...prev, [b.id]: val }))
    setSelectedVariant((prev) => ({ ...prev, [b.id]: "" }))
  }}
  placeholder="Select service..."
  isSearchable

  /** 👇 mount the menu to <body> so parents can't clip it */
  menuPortalTarget={typeof window !== "undefined" ? document.body : null}

  /** 👇 make sure it floats on top */
  styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
    control: (base) => ({
      ...base,
      border: "1px solid #e5e7eb",
      borderRadius: "0.75rem",
      padding: "0.25rem",
      boxShadow: "none",
      "&:hover": { borderColor: "#e5e7eb" },
    }),
  }}
/>


                        {selectedService[b.id] && (
                          <div className="flex gap-3">
                            <select
                              value={selectedVariant[b.id] || ""}
                              onChange={(e) => setSelectedVariant((prev) => ({ ...prev, [b.id]: e.target.value }))}
                              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            >
                              <option value="">Select variant...</option>
                              {services
                                .find((s) => s.id === selectedService[b.id])
                                ?.variants.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.name} ({v.duration}m) - ₹
                                    {v.currentPrice?.offerPrice ?? v.currentPrice?.actualPrice}
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => addService(b.id)}
                              disabled={!selectedVariant[b.id]}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-400 text-white text-sm font-medium rounded-xl transition-all disabled:cursor-not-allowed"
                            >
                              Add
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {(!b.customer || !b.phone) && (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-sm font-medium text-blue-800 mb-3">Update Customer Information</p>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Customer name..."
                            defaultValue={b.customer || ""}
                            id={`name-${b.id}`}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <input
                            type="tel"
                            placeholder="Phone number..."
                            defaultValue={b.phone || ""}
                            id={`phone-${b.id}`}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <button
                            onClick={() => {
                              const customer = (document.getElementById(`name-${b.id}`) as HTMLInputElement).value
                              const phone = (document.getElementById(`phone-${b.id}`) as HTMLInputElement).value
                              updateCustomer(b.id, customer, phone)
                            }}
                            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-xl transition-all"
                          >
                            Save Customer Info
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-16">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No assignments found</h3>
            <p className="text-gray-600">Try adjusting your search or date filter</p>
          </div>
        )}
      </div>
    </div>
  )
}
