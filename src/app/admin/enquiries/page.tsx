"use client"

import type React from "react"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import WysiwygEditor from "@/app/components/WysiwygEditor"
import Select, { type MultiValue } from "react-select"
import {
  Phone,
  Calendar as CalendarIcon,
  Sparkles,
  Clock,
  CheckCircle2,
  Edit3,
  Search,
  Save,
  User,
  ArrowUpRight,
  BookOpen,
  Filter,
  X,
  AlertCircle,
  Globe,
  Check,
  RefreshCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface VariantOption {
  id: string
  serviceId: string
  variantName: string
  serviceName: string
  categoryName: string
  duration?: number | null
  current?: { actualPrice: number; offerPrice?: number | null } | null
}

interface Enquiry {
  id: string
  enquiry: string | null
  variantIds: string[]
  createdAt: string
  status: string
  remark?: string | null
  source: string
  name?: string | null
  phone?: string | null
  gender?: string | null
  preferredDate?: string | null
  preferredTime?: string | null

  customer?: { id: string; name: string | null; phone: string | null; gender: string | null }
}

interface Stats {
  today: number
  new: number
  processing: number
  closed: number
  web: number
  webClosed: number
}

export default function EnquiriesPage() {
  const empty = { name: "", phone: "", gender: "", enquiry: "", variantIds: [] as string[] }
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [form, setForm] = useState(empty)
  const [prevEnquiries, setPrevEnquiries] = useState<Enquiry[]>([])
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [variants, setVariants] = useState<VariantOption[]>([])
  const [stats, setStats] = useState<Stats>({ today: 0, new: 0, processing: 0, closed: 0, web: 0, webClosed: 0 })
  const [selected, setSelected] = useState<Enquiry | null>(null)
  const [modalStatus, setModalStatus] = useState("")
  const [modalRemark, setModalRemark] = useState("")
  const [filter, setFilter] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  // status colors (badge)
  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    closed: "bg-green-100 text-green-800",
  }

  const statCards = [
    { key: "today", label: "Today", value: stats.today, bgColor: "bg-emerald-500", icon: CalendarIcon },
    { key: "new", label: "New", value: stats.new, bgColor: "bg-sky-500", icon: Sparkles },
    { key: "processing", label: "Processing", value: stats.processing, bgColor: "bg-amber-500", icon: Clock },
    { key: "closed", label: "Closed", value: stats.closed, bgColor: "bg-slate-500", icon: CheckCircle2 },
    { key: "web", label: "Web Enquiries", value: stats.web, bgColor: "bg-purple-500", icon: Globe },
    { key: "webClosed", label: "Web Closed", value: stats.webClosed, bgColor: "bg-pink-500", icon: CheckCircle2 },
  ]

  const showBanner = (type: "success" | "error", msg: string) => {
    setBanner({ type, msg })
    setTimeout(() => setBanner(null), 2600)
  }

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10)
    setPhone(digitsOnly)
    if (digitsOnly.length > 0 && digitsOnly.length < 10) setPhoneError("Mobile number must be 10 digits")
    else setPhoneError("")
  }

  const bookServices = () => {
    if (!selected?.customer) return
    const params = new URLSearchParams()
    if (selected.customer?.name) params.set("name", selected.customer.name)
    if (selected.customer?.phone) params.set("phone", selected.customer.phone as string)
    if (selected.customer?.gender) params.set("gender", selected.customer.gender as string)
    if (selected.variantIds?.length) params.set("variants", selected.variantIds.join(","))
    window.location.href = `/admin/walk-in?${params.toString()}`
  }

  const loadEnquiries = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/enquiries")
      const data = res.ok ? await res.json() : []
      setEnquiries(data || [])
    } catch {
      showBanner("error", "Failed to load enquiries.")
    } finally {
      setLoading(false)
    }
  }

  const loadVariants = async () => {
    const res = await fetch("/api/admin/service-variants/all")
    if (res.ok) {
      const data = await res.json()
      setVariants(data)
    }
  }

  const loadStats = async () => {
    const res = await fetch("/api/admin/enquiries/stats")
    if (res.ok) {
      const data = await res.json()
      setStats(data)
    }
  }

  useEffect(() => {
    loadEnquiries()
    loadVariants()
    loadStats()
  }, [])

  // Debounce search click via ref to avoid double submits
  const searchingRef = useRef(false)
  const search = useCallback(async () => {
    if (!phone || phone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number")
      return
    }
    if (searchingRef.current) return
    searchingRef.current = true
    setIsSearching(true)
    try {
      const res = await fetch(`/api/admin/enquiries?phone=${phone}`)
      if (res.ok) {
        const data = await res.json()
        setPrevEnquiries(data.enquiries || [])
        setForm({
          ...empty,
          phone,
          name: data.customer?.name || "",
          gender: data.customer?.gender || "",
        })
      }
    } finally {
      setIsSearching(false)
      searchingRef.current = false
    }
  }, [phone])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/admin/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setForm(empty)
    setPrevEnquiries([])
    setPhone("")
    setPhoneError("")
    loadEnquiries()
    loadStats()
    showBanner("success", "Enquiry saved.")
  }

  const openModal = (e: Enquiry) => {
    setSelected(e)
    setModalStatus(e.status)
    setModalRemark(e.remark || "")
  }

  const updateStatus = async () => {
    if (!selected) return
    if (modalStatus === "closed" && !modalRemark) return
    await fetch(`/api/admin/enquiries/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: modalStatus, remark: modalRemark }),
    })
    setSelected(null)
    loadEnquiries()
    loadStats()
    showBanner("success", "Enquiry updated.")
  }

  const convertToCustomer = async () => {
    if (!selected) return
    await fetch(`/api/admin/enquiries/${selected.id}/convert`, { method: "POST" })
    setSelected(null)
    loadEnquiries()
    loadStats()
    showBanner("success", "Converted to customer.")
  }

  const clearFilter = () => setFilter(null)

  const filteredEnquiries = useMemo(() => {
    if (!filter) return enquiries
    if (filter === "today") {
      return enquiries.filter((e) => new Date(e.createdAt).toDateString() === new Date().toDateString())
    }
    return enquiries.filter((e) => e.status === filter)
  }, [enquiries, filter])

  const totalCount = enquiries.length

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 12px 12px",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 py-8 text-white">
          <div className="flex items-start sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-100">
                <Phone className="h-6 w-6" />
                <span className="uppercase tracking-wider text-xs">CRM</span>
              </div>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold">Salon Enquiries</h1>
              <p className="mt-2 text-emerald-50 max-w-2xl">
                Log new enquiries, see history, and quickly move leads to bookings.
              </p>
            </div>

            {/* Stats (click to filter) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {statCards.map((stat) => {
                const Icon = stat.icon
                const active = filter === stat.key
                return (
                  <button
                    key={stat.key}
                    onClick={() => setFilter(active ? null : stat.key)}
                    className={`rounded-xl px-4 py-3 text-left transition ring-1 ring-white/20 ${stat.bgColor} ${
                      active ? "outline outline-2 outline-white" : ""
                    }`}
                    title={`${stat.label} (${stat.value})`}
                  >
                    <div className="text-[11px] text-white/90">{stat.label}</div>
                    <div className="text-xl font-bold flex items-center gap-1">
                      <Icon className="h-4 w-4" /> {stat.value}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filter ribbon */}
          <div className="mt-4 min-h-[1.5rem]">
            {filter && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
                <Filter className="h-4 w-4" />
                <span>
                  Filtered by:{" "}
                  <strong>
                    {filter === "today" ? "Today" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </strong>
                </span>
                <button
                  onClick={clearFilter}
                  className="rounded-full p-1 hover:bg-white/20"
                  aria-label="Clear filter"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="container mx-auto px-4">
        {banner && (
          <div
            className={`-mt-4 mb-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
              banner.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
            role="status"
          >
            {banner.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{banner.msg}</span>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Mobile-first: prominent customer phone search */}
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-emerald-800 flex items-center gap-2 mb-2">
              <Search className="h-5 w-5" />
              Customer Mobile Search
            </h2>
            <div className="rounded-lg border border-emerald-200 bg-white/60 p-4">
              <div className="flex items-start gap-2 text-sm text-emerald-800">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Start with the customer’s 10-digit mobile number.</p>
                  <p className="text-emerald-700 mt-1">
                    I’ll prefill their details if they exist and show past enquiries for context.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`text-lg h-12 ${
                  phoneError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                }`}
                maxLength={10}
              />
              {phoneError && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {phoneError}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-1">{phone.length}/10 digits entered</p>
            </div>
            <Button
              onClick={search}
              disabled={phone.length !== 10 || isSearching}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Customer
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPhone("")
                setPhoneError("")
                setPrevEnquiries([])
                setForm(empty)
              }}
              className="h-12"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* New Enquiry Form */}
        {form.phone && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">New Enquiry</h3>
              <span className="text-xs text-gray-500">Found {prevEnquiries.length} previous for this number</span>
            </div>

            <form onSubmit={save} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Customer Name
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-gray-700 font-medium">
                    Gender
                  </Label>
                  <select
                    id="gender"
                    className="w-full mt-1 p-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Mobile</Label>
                  <Input disabled value={form.phone} className="mt-1 bg-gray-50" />
                </div>
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Enquiry</Label>
                <div className="mt-1">
                  <WysiwygEditor value={form.enquiry} onChange={(val) => setForm({ ...form, enquiry: val })} />
                </div>
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Services Interested In</Label>
                <div className="mt-1">
                  <Select
                    isMulti
                    classNamePrefix="select"
                    options={variants.map((v) => ({
                      value: v.id,
                      label: `${v.categoryName} — ${v.serviceName} (${v.variantName})`,
                    }))}
                    value={variants
                      .filter((v) => form.variantIds.includes(v.id))
                      .map((v) => ({
                        value: v.id,
                        label: `${v.categoryName} — ${v.serviceName} (${v.variantName})`,
                      }))}
                    onChange={(vals: MultiValue<{ value: string; label: string }>) =>
                      setForm({ ...form, variantIds: vals.map((v) => v.value) })
                    }
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Enquiry
                </Button>
                <span className="text-xs text-gray-500">
                  Tip: Use “Services Interested In” to pre-fill future bookings.
                </span>
              </div>
            </form>
          </div>
        )}

        {/* Previous Enquiries */}
        {prevEnquiries.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Previous Enquiries</h3>
            <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Preferred</th>
                    <th className="text-left py-3 px-4 font-medium">Source</th>
                    <th className="text-left py-3 px-4 font-medium">Remark</th>
                  </tr>
                </thead>
                <tbody className="[&_tr]:border-t [&_tr]:border-gray-100">
                  {prevEnquiries.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${statusColors[p.status] || ""} capitalize`}>{p.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        {p.preferredDate ? new Date(p.preferredDate).toLocaleDateString() : "-"}
                        {p.preferredTime ? ` ${p.preferredTime}` : ""}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="capitalize">{p.source}</Badge>
                      </td>
                      <td className="py-3 px-4">{p.remark || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Enquiries */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">All Enquiries</h3>
              <p className="text-xs text-gray-500">
                Showing <strong>{filteredEnquiries.length}</strong> of {totalCount}
              </p>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Filter className="h-4 w-4 text-emerald-600" />
              Click a stat card above to filter by status or “Today”.
            </div>
          </div>

          <div className="relative overflow-x-auto">
            {loading ? (
              <div className="p-6 grid gap-4 sm:grid-cols-2">
                {[0, 1, 2, 3].map((k) => (
                  <div key={k} className="animate-pulse rounded-xl border p-4">
                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    <div className="mt-3 h-3 w-2/3 bg-gray-200 rounded" />
                    <div className="mt-2 h-3 w-1/2 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-gray-900">No enquiries found</h3>
                <p className="text-sm text-gray-500">Try clearing filters or refresh.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 text-gray-600 z-10">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Phone</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Preferred</th>
                    <th className="text-left py-3 px-4 font-medium">Source</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredEnquiries.map((e) => (
                    <tr key={e.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {e.customer ? (
                          <Link
                            href={`/admin/customers/${e.customer.id}`}
                            className="text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center font-medium"
                          >
                            {e.customer.name || "Unnamed"}
                            <ArrowUpRight className="h-4 w-4 ml-1" />
                          </Link>
                        ) : e.name ? (
                          <span className="text-gray-800">{e.name}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">{e.customer?.phone || e.phone || "-"}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${statusColors[e.status] || ""} capitalize`}>{e.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        {e.preferredDate ? new Date(e.preferredDate).toLocaleDateString() : "-"}
                        {e.preferredTime ? ` ${e.preferredTime}` : ""}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="capitalize">{e.source}</Badge>
                      </td>
                      <td className="py-3 px-4">{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(e)}
                          className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ring-1 ring-black/5">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Update Enquiry</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name</span>
                    <p className="text-gray-700 mt-1">{selected.customer?.name || selected.name || "-"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone</span>
                    <p className="text-gray-700 font-mono mt-1">{selected.customer?.phone || selected.phone || "-"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Preferred Slot</span>
                    <p className="text-gray-700 mt-1">
                      {selected.preferredDate ? new Date(selected.preferredDate).toLocaleDateString() : "-"}
                      {selected.preferredTime ? ` ${selected.preferredTime}` : ""}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Enquiry</span>
                  <div
                    className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: selected.enquiry || "No enquiry details" }}
                  />
                </div>

                <div>
                  <span className="font-medium text-gray-700">Services</span>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    {selected.variantIds.map((id) => {
                      const v = variants.find((t) => t.id === id)
                      return (
                        <li key={id} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          {v ? `${v.categoryName} — ${v.serviceName} (${v.variantName})` : id}
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status" className="text-gray-700 font-medium">
                      Status
                    </Label>
                    <select
                      id="status"
                      className="w-full mt-1 p-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                    >
                      <option value="new">New</option>
                      <option value="processing">In Process</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="remark" className="text-gray-700 font-medium">
                      Remark
                    </Label>
                    <Textarea
                      id="remark"
                      className="mt-1"
                      value={modalRemark}
                      onChange={(e) => setModalRemark(e.target.value)}
                      placeholder="Add your remarks here..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {selected.customer && (
                      <Link
                        href={`/admin/customers/${selected.customer.id}`}
                        className="inline-flex items-center px-3 py-2 text-sm text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-50"
                      >
                        <User className="h-4 w-4 mr-1" />
                        View Profile
                      </Link>
                    )}
                    {selected.customer ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={bookServices}
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Book Services
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={convertToCustomer}
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                      >
                        <User className="h-4 w-4 mr-1" />
                        Convert to Customer
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(null)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={updateStatus}>
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
