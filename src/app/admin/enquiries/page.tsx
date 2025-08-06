"use client"

import type React from "react"

import Link from "next/link"
import { useEffect, useState } from "react"
import WysiwygEditor from "@/app/components/WysiwygEditor"
import Select, { type MultiValue } from "react-select"
import {
  Phone,
  Calendar,
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

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    closed: "bg-green-500 text-black-800",
  }

  const statCards = [
    { key: "today", label: "Today", value: stats.today, bgColor: "bg-blue-500", icon: Calendar },
    { key: "new", label: "New", value: stats.new, bgColor: "bg-green-500", icon: Sparkles },
    { key: "processing", label: "Processing", value: stats.processing, bgColor: "bg-yellow-500", icon: Clock },
    { key: "closed", label: "Closed", value: stats.closed, bgColor: "bg-gray-500", icon: CheckCircle2 },
    { key: "web", label: "Web Enquiries", value: stats.web, bgColor: "bg-purple-500", icon: Globe },
    { key: "webClosed", label: "Web Closed", value: stats.webClosed, bgColor: "bg-pink-500", icon: CheckCircle2 },
  ]

  const handlePhoneChange = (value: string) => {
    // Only allow digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10)
    setPhone(digitsOnly)

    if (digitsOnly.length > 0 && digitsOnly.length < 10) {
      setPhoneError("Mobile number must be 10 digits")
    } else {
      setPhoneError("")
    }
  }

  const bookServices = () => {
    if (!selected?.customer) return
    const params = new URLSearchParams()
    if (selected.customer?.name) params.set("name", selected.customer.name)
    if (selected.customer?.phone) params.set("phone", selected.customer.phone)
    if (selected.customer?.gender) params.set("gender", selected.customer.gender)
    if (selected.variantIds?.length) params.set("variants", selected.variantIds.join(","))
    window.location.href = `/admin/walk-in?${params.toString()}`
  }

  const loadEnquiries = async () => {
    const res = await fetch("/api/admin/enquiries")
    if (res.ok) {
      const data = await res.json()
      setEnquiries(data)
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

  const search = async () => {
    if (!phone || phone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number")
      return
    }

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
    }
  }

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
  }

  const convertToCustomer = async () => {
    if (!selected) return
    await fetch(`/api/admin/enquiries/${selected.id}/convert`, { method: 'POST' })
    setSelected(null)
    loadEnquiries()
    loadStats()
  }

  const clearFilter = () => setFilter(null)

  const filteredEnquiries = filter
    ? enquiries.filter((e) => {
        if (filter === "today") {
          return new Date(e.createdAt).toDateString() === new Date().toDateString()
        }
        return e.status === filter
      })
    : enquiries

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Phone className="h-6 w-6 text-green-700" />
        <h1 className="text-2xl font-bold text-green-700">Salon Enquiries</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.key}
              className={`p-4 rounded-lg shadow cursor-pointer text-white flex items-center justify-between hover:opacity-90 transition-opacity ${
                stat.bgColor
              } ${filter === stat.key ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
              onClick={() => setFilter(filter === stat.key ? null : stat.key)}
            >
              <div>
                <div className="text-sm">{stat.label}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
              <Icon className="h-6 w-6" />
            </div>
          )
        })}
      </div>

      {/* Active Filter Indicator */}
      {filter && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
            <Filter className="h-4 w-4" />
            Filtered by: {filter === "today" ? "Today" : filter.charAt(0).toUpperCase() + filter.slice(1)}
            <button onClick={clearFilter} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* Mobile Search Section - Prominent */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 shadow-lg">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-green-800 flex items-center gap-2 mb-2">
            <Search className="h-5 w-5" />
            Customer Mobile Search
          </h2>
          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
            <div className="flex items-start gap-2 text-sm text-green-800">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Enter the mobile number of the customer first</p>
                <p className="text-green-700 mt-1">
                  This will help us find existing customer details and previous enquiries
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
                  : "border-green-300 focus:border-green-500 focus:ring-green-500"
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
            className="bg-green-600 hover:bg-green-700 text-white h-12 px-8"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Customer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Customer Form */}
      {form.phone && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">New Enquiry Form</h3>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full mt-1 p-2 rounded-md border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
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
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Customer Enquiry</Label>
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
                    label: `${v.categoryName} - ${v.serviceName} (${v.variantName})`,
                  }))}
                  value={variants
                    .filter((v) => form.variantIds.includes(v.id))
                    .map((v) => ({
                      value: v.id,
                      label: `${v.categoryName} - ${v.serviceName} (${v.variantName})`,
                    }))}
                  onChange={(vals: MultiValue<{ value: string; label: string }>) =>
                    setForm({ ...form, variantIds: vals.map((v) => v.value) })
                  }
                  className="text-sm"
                />
              </div>
            </div>

            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Enquiry
            </Button>
          </form>
        </div>
      )}

      {/* Previous Enquiries */}
      {prevEnquiries.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Previous Enquiries</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">Preferred</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">Remark</th>
                </tr>
              </thead>
              <tbody>
                {prevEnquiries.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 border-b">
                      <Badge className={`${statusColors[p.status] || ""} capitalize`}>{p.status}</Badge>
                    </td>
                    <td className="py-3 px-4 border-b">
                      {p.preferredDate ? new Date(p.preferredDate).toLocaleDateString() : "-"}
                      {p.preferredTime ? ` ${p.preferredTime}` : ""}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <Badge className="capitalize">{p.source}</Badge>
                    </td>
                    <td className="py-3 px-4 border-b">{p.remark || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enquiries Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">All Enquiries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">Preferred</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">Source</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">
                    {e.customer ? (
                      <Link
                        href={`/admin/customers/${e.customer.id}`}
                        className="text-green-700 hover:text-green-800 hover:underline inline-flex items-center font-medium"
                      >
                        {e.customer.name || "Unnamed"}
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Link>
                    ) : e.name ? (
                      <span className="text-gray-700">{e.name}</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b font-mono">{e.customer?.phone || e.phone || "-"}</td>
                  <td className="py-3 px-4 border-b">
                    <Badge className={`${statusColors[e.status] || ""} capitalize`}>{e.status}</Badge>
                  </td>
                  <td className="py-3 px-4 border-b">
                    {e.preferredDate ? new Date(e.preferredDate).toLocaleDateString() : "-"}
                    {e.preferredTime ? ` ${e.preferredTime}` : ""}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <Badge className="capitalize">{e.source}</Badge>
                  </td>
                  <td className="py-3 px-4 border-b">{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 border-b">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(e)}
                      className="text-green-700 hover:text-green-800 hover:bg-green-50"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">Update Enquiry</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <p className="text-gray-600 mt-1">{selected.customer?.name || selected.name || "-"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <p className="text-gray-600 font-mono mt-1">{selected.customer?.phone || selected.phone || "-"}</p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Preferred Slot:</span>
                  <p className="text-gray-600 mt-1">
                    {selected.preferredDate
                      ? new Date(selected.preferredDate).toLocaleDateString()
                      : "-"}
                    {selected.preferredTime ? ` ${selected.preferredTime}` : ""}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Enquiry:</span>
                  <div
                    className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                    dangerouslySetInnerHTML={{ __html: selected.enquiry || "No enquiry details" }}
                  />
                </div>

                <div>
                  <span className="font-medium text-gray-700">Services:</span>
                  <ul className="mt-2 space-y-1">
                    {selected.variantIds.map((id) => {
                      const v = variants.find((t) => t.id === id)
                      return (
                        <li key={id} className="flex items-center gap-2 text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {v ? `${v.categoryName} - ${v.serviceName} (${v.variantName})` : id}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="status" className="text-gray-700 font-medium">
                    Status
                  </Label>
                  <select
                    id="status"
                    className="w-full mt-1 p-2 rounded-md border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
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
                      className="inline-flex items-center px-3 py-2 text-sm text-green-700 border border-green-300 rounded-lg hover:bg-green-50"
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
                      className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Book Services
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={convertToCustomer}
                      className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
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
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={updateStatus}>
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
  )
}
