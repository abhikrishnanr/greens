"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Toaster, toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Download,
  Search,
  Edit,
  RotateCcw,
  Trash2,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  Building,
  Layers,
  Filter,
  X,
} from "lucide-react"

interface Branch {
  id: string
  name: string
}

interface Staff {
  id: string
  name: string
  email: string
  phone: string
  gender: string
  dob: string
  address: string
  designation: string
  experience?: string
  startDate: string
  role: string
  branchId?: string
  branch?: Branch
  removed: boolean
  createdAt: string
  imageUrl?: string
}

export default function StaffManagement() {
  // State
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [filter, setFilter] = useState<"ALL" | "AVAILABLE" | "REMOVED">("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [branchFilter, setBranchFilter] = useState<string>("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [existingCustomer, setExistingCustomer] = useState<Partial<Staff> | null>(null)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [newPhone, setNewPhone] = useState("")
  const [loading, setLoading] = useState(false)

  // Fetch
  const fetchStaff = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/staff")
      const { success, staff } = await res.json()
      if (success) setStaffList(staff)
    } finally {
      setLoading(false)
    }
  }
  const fetchBranches = async () => {
    const res = await fetch("/api/branch")
    const { success, branches } = await res.json()
    if (success) setBranches(branches)
  }
  useEffect(() => {
    fetchStaff()
    fetchBranches()
  }, [])

  // Metrics
  const totalStaff = staffList.length
  const activeStaff = staffList.filter((s) => !s.removed).length
  const removedStaff = staffList.filter((s) => s.removed).length
  const designationCounts = staffList.reduce((acc, s) => {
    if (!s.removed) acc[s.designation] = (acc[s.designation] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Handlers
  const handleToggle = async (id: string, curr: boolean) => {
    await fetch("/api/staff/toggle", { method: "POST", body: JSON.stringify({ id, removed: !curr }) })
    fetchStaff()
  }

  const handleExport = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Gender",
      "DOB",
      "Address",
      "Designation",
      "Experience",
      "Start Date",
      "Role",
      "Branch",
      "Removed",
      "Joined",
    ]
    const rows = staffList.map((s) => [
      s.name,
      s.email,
      s.phone,
      s.gender,
      s.dob,
      s.address,
      s.designation,
      s.experience,
      s.startDate,
      s.role,
      s.branch?.name,
      s.removed ? "Yes" : "No",
      new Date(s.createdAt).toLocaleDateString(),
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "staff_export.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePhoneCheck = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(newPhone)) {
      toast.error("Phone must be 10 digits")
      return
    }
    const res = await fetch(`/api/staff/check?phone=${newPhone}`)
    const data = await res.json()
    if (data.exists) {
      if (data.user.role !== "customer") {
        toast.error("User already staff")
        return
      }
      const ok = window.confirm("Customer exists with this number. Add as staff?")
      if (!ok) return
      setExistingCustomer(data.user)
    } else {
      setExistingCustomer(null)
    }
    setPhoneVerified(true)
  }

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const phone = fd.get("phone") as string
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Phone must be 10 digits")
      return
    }
    let res: Response
    if (existingCustomer) {
      fd.append("id", existingCustomer.id!)
      const role = fd.get("role")
      if (role === "staff") fd.set("role", "customer_staff")
      res = await fetch("/api/staff/update", { method: "POST", body: fd })
    } else {
      res = await fetch("/api/staff/add", { method: "POST", body: fd })
    }
    const { success } = await res.json()
    if (success) {
      toast.success("Staff added successfully!")
      form.reset()
      setShowAddModal(false)
      setPhoneVerified(false)
      setExistingCustomer(null)
      setNewPhone("")
      fetchStaff()
    } else {
      toast.error("Failed to add staff")
    }
  }

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const phone = fd.get("phone") as string
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Phone must be 10 digits")
      return
    }
    fd.append("id", selectedStaff!.id)
    const res = await fetch("/api/staff/update", { method: "POST", body: fd })
    const { success } = await res.json()
    if (success) {
      toast.success("Staff updated successfully!")
      setSelectedStaff(null)
      fetchStaff()
    } else {
      toast.error("Failed to update staff")
    }
  }

  // Filter + Search
  const filteredStaff = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return staffList
      .filter((s) => (filter === "ALL" ? true : filter === "REMOVED" ? s.removed : !s.removed))
      .filter((s) => (branchFilter ? s.branchId === branchFilter : true))
      .filter((s) => (roleFilter ? s.role === roleFilter : true))
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.designation.toLowerCase().includes(q),
      )
  }, [staffList, filter, searchTerm, branchFilter, roleFilter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster richColors position="top-center" />

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
                <Users className="h-6 w-6" />
                <span className="uppercase tracking-wider text-xs">Team</span>
              </div>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold">Staff Management</h1>
              <p className="mt-2 text-emerald-50 max-w-2xl">Manage your salon team, roles, and branches.</p>
            </div>

            {/* Stat chips */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
                <div className="text-xs">Total</div>
                <div className="text-2xl font-bold">{totalStaff}</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
                <div className="text-xs">Active</div>
                <div className="text-2xl font-bold">{activeStaff}</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
                <div className="text-xs">Removed</div>
                <div className="text-2xl font-bold">{removedStaff}</div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, email, designation…"
                className="pl-10 h-10 bg-white/10 border-white/30 text-white placeholder:text-white/70"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-white/90 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Status
              </span>
              {(["ALL", "AVAILABLE", "REMOVED"] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                  onClick={() => setFilter(f)}
                  className={
                    filter === f
                      ? "h-10 bg-green-800 text-emerald-900 hover:bg-green/900"
                      : "h-10 border-white/30 text-white hover:bg-green/900"
                  }
                >
                  {f}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-white/80" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="h-10 rounded-md border border-white/30 bg-white/10 px-3 text-white outline-none focus:ring-2 focus:ring-white/40"
              >
                <option value="" className="text-black">
                  All Branches
                </option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="text-black">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-white/80" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 rounded-md border border-white/30 bg-white/10 px-3 text-white outline-none focus:ring-2 focus:ring-white/40"
              >
                <option value="" className="text-black">
                  All Roles
                </option>
                <option value="staff" className="text-black">
                  Staff
                </option>
                <option value="customer_staff" className="text-black">
                  Staff & Customer
                </option>
                <option value="manager" className="text-black">
                  Manager
                </option>
                <option value="admin" className="text-black">
                  Admin
                </option>
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-yellow-500 text-white hover:bg-black shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
              <Button onClick={handleExport} variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Designation breakdown */}
      {Object.keys(designationCounts).length > 0 && (
        <div className="container mx-auto px-4 mt-6">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Staff by Designation</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex flex-wrap gap-2">
                {Object.entries(designationCounts).map(([designation, count]) => (
                  <Badge key={designation} variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-800">
                    {designation}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200" />
                    <div className="h-6 w-20 bg-gray-200 rounded" />
                  </div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                    <div className="h-3 w-2/3 bg-gray-200 rounded" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="h-9 w-20 bg-gray-200 rounded" />
                    <div className="h-9 w-24 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No staff found</h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search or filters." : "Add your first staff member to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStaff.map((staff) => (
              <Card
                key={staff.id}
                className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  {/* Avatar & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-emerald-50 flex items-center justify-center">
                      {staff.imageUrl ? (
                        <img
                          src={staff.imageUrl || "/placeholder.svg"}
                          alt={staff.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-emerald-700 text-lg font-semibold">
                          {staff.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant={staff.removed ? "destructive" : "default"}
                      className={
                        staff.removed
                          ? "bg-red-100 text-red-800 hover:bg-red-200"
                          : "bg-emerald-400 text-emerald-800 hover:bg-emerald-200"
                      }
                    >
                      {staff.removed ? "Removed" : "Active"}
                    </Badge>
                  </div>

                  {/* Name & Designation */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{staff.name}</h3>
                    <p className="text-emerald-700 font-medium">{staff.designation}</p>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{staff.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{staff.branch?.name || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Started {new Date(staff.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button onClick={() => setSelectedStaff(staff)} size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleToggle(staff.id, staff.removed)}
                      size="sm"
                      variant={staff.removed ? "default" : "destructive"}
                      className={staff.removed ? "flex-1 bg-emerald-600 hover:bg-emerald-700" : "flex-1"}
                    >
                      {staff.removed ? (
                        <>
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Restore
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add New Staff</h2>
            </div>
            <div className="p-6">
              {!phoneVerified ? (
                <form onSubmit={handlePhoneCheck} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number*</label>
                    <Input
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Enter 10-digit phone number"
                      required
                      maxLength={10}
                      pattern="\d{10}"
                    />
                    <p className="text-xs text-gray-500 mt-1">We’ll check if this number already exists.</p>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddModal(false)
                        setNewPhone("")
                        setPhoneVerified(false)
                        setExistingCustomer(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                      Next
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAdd} encType="multipart/form-data" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                      <input type="file" name="image" accept="image/*" className="w-full p-2 border rounded-md" />
                      <p className="text-xs text-gray-500 mt-1">Optional JPG/PNG</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name*</label>
                      <Input name="name" defaultValue={existingCustomer?.name} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email*</label>
                      <Input name="email" type="email" defaultValue={existingCustomer?.email} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone*</label>
                      <Input name="phone" value={newPhone} readOnly className="bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender*</label>
                      <select
                        name="gender"
                        defaultValue={existingCustomer?.gender || ""}
                        required
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth*</label>
                      <Input name="dob" type="date" defaultValue={existingCustomer?.dob?.split?.("T")[0]} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Designation*</label>
                      <Input
                        name="designation"
                        defaultValue={existingCustomer?.designation}
                        placeholder="e.g., Hair Stylist, Nail Technician"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                      <Input name="experience" defaultValue={existingCustomer?.experience} placeholder="e.g., 2 years" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date*</label>
                      <Input name="startDate" type="date" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role*</label>
                      <select name="role" defaultValue="staff" required className="w-full p-2 border rounded-md">
                        <option value="staff">Staff</option>
                        <option value="customer_staff">Staff & Customer</option>
                        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Branch*</label>
                      <select name="branchId" required className="w-full p-2 border rounded-md">
                        <option value="">Select branch</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address*</label>
                      <Input name="address" defaultValue={existingCustomer?.address} required />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddModal(false)
                        setPhoneVerified(false)
                        setExistingCustomer(null)
                        setNewPhone("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                      Add Staff
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Edit Staff</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleEdit} encType="multipart/form-data" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                    <input type="file" name="image" accept="image/*" className="w-full p-2 border rounded-md" />
                    <p className="text-xs text-gray-500 mt-1">Leave blank to keep current</p>
                  </div>

                  <input type="hidden" name="id" value={selectedStaff.id} />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name*</label>
                    <Input name="name" defaultValue={selectedStaff.name} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email*</label>
                    <Input name="email" type="email" defaultValue={selectedStaff.email} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone*</label>
                    <Input name="phone" defaultValue={selectedStaff.phone} required maxLength={10} pattern="\d{10}" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender*</label>
                    <select name="gender" defaultValue={selectedStaff.gender} required className="w-full p-2 border rounded-md">
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth*</label>
                    <Input name="dob" type="date" defaultValue={selectedStaff.dob?.split("T")[0]} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation*</label>
                    <Input name="designation" defaultValue={selectedStaff.designation} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                    <Input name="experience" defaultValue={selectedStaff.experience} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date*</label>
                    <Input name="startDate" type="date" defaultValue={selectedStaff.startDate?.split("T")[0]} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role*</label>
                    <select name="role" defaultValue={selectedStaff.role} required className="w-full p-2 border rounded-md">
                      <option value="staff">Staff</option>
                      <option value="customer_staff">Staff & Customer</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch*</label>
                    <select name="branchId" defaultValue={selectedStaff.branchId || ""} required className="w-full p-2 border rounded-md">
                      <option value="">Select branch</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address*</label>
                    <Input name="address" defaultValue={selectedStaff.address} required />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => setSelectedStaff(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Update Staff
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
