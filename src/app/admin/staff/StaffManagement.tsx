"use client"

import { useEffect, useState, type FormEvent } from "react"
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
  // State management
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [filter, setFilter] = useState<"ALL" | "AVAILABLE" | "REMOVED">("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [existingCustomer, setExistingCustomer] = useState<Partial<Staff> | null>(null)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [newPhone, setNewPhone] = useState("")

  // Fetch data functions
  const fetchStaff = async () => {
    const res = await fetch("/api/staff")
    const { success, staff } = await res.json()
    if (success) setStaffList(staff)
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

  // Calculate metrics
  const totalStaff = staffList.length
  const activeStaff = staffList.filter((s) => !s.removed).length
  const removedStaff = staffList.filter((s) => s.removed).length

  // Get designation breakdown
  const designationCounts = staffList.reduce(
    (acc, staff) => {
      if (!staff.removed) {
        acc[staff.designation] = (acc[staff.designation] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  // Handler functions
  const handleToggle = async (id: string, curr: boolean) => {
    await fetch("/api/staff/toggle", {
      method: "POST",
      body: JSON.stringify({ id, removed: !curr }),
    })
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
      .map((row) =>
        row
          .map((cell) => {
            const text = String(cell ?? "")
            return `"${text.replace(/"/g, '""')}"`
          })
          .join(","),
      )
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
      if (role === "staff") {
        fd.set("role", "customer_staff")
      }
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
    const res = await fetch("/api/staff/update", {
      method: "POST",
      body: fd,
    })
    const { success } = await res.json()
    if (success) {
      toast.success("Staff updated successfully!")
      setSelectedStaff(null)
      fetchStaff()
    } else {
      toast.error("Failed to update staff")
    }
  }

  // Filter and search staff
  const filteredStaff = staffList
    .filter((s) => {
      if (filter === "ALL") return true
      return filter === "REMOVED" ? s.removed : !s.removed
    })
    .filter((s) => {
      const q = searchTerm.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q)
      )
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <Toaster richColors position="top-center" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Staff Management</h1>
            <p className="text-gray-600">Manage your salon team efficiently</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              className="border-blue-200 hover:bg-blue-50 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Metrics Cards - Using inline styles to override any conflicting CSS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            className="rounded-lg shadow-lg border-0 overflow-hidden p-6"
            style={{
              background: "linear-gradient(to right, #3b82f6, #2563eb)",
              color: "white",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1 opacity-80">Total Staff</p>
                <p className="text-3xl font-bold">{totalStaff}</p>
              </div>
              <Users className="w-8 h-8 opacity-70 flex-shrink-0" />
            </div>
          </div>

          <div
            className="rounded-lg shadow-lg border-0 overflow-hidden p-6"
            style={{
              background: "linear-gradient(to right, #10b981, #059669)",
              color: "white",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1 opacity-80">Active Staff</p>
                <p className="text-3xl font-bold">{activeStaff}</p>
              </div>
              <UserCheck className="w-8 h-8 opacity-70 flex-shrink-0" />
            </div>
          </div>

          <div
            className="rounded-lg shadow-lg border-0 overflow-hidden p-6"
            style={{
              background: "linear-gradient(to right, #ef4444, #dc2626)",
              color: "white",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1 opacity-80">Removed Staff</p>
                <p className="text-3xl font-bold">{removedStaff}</p>
              </div>
              <UserX className="w-8 h-8 opacity-70 flex-shrink-0" />
            </div>
          </div>

          <div
            className="rounded-lg shadow-lg border-0 overflow-hidden p-6"
            style={{
              background: "linear-gradient(to right, #8b5cf6, #7c3aed)",
              color: "white",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1 opacity-80">Designations</p>
                <p className="text-3xl font-bold">{Object.keys(designationCounts).length}</p>
              </div>
              <Briefcase className="w-8 h-8 opacity-70 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Designation Breakdown */}
        {Object.keys(designationCounts).length > 0 && (
          <Card className="mb-6 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Staff by Designation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(designationCounts).map(([designation, count]) => (
                  <Badge
                    key={designation}
                    variant="secondary"
                    className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    {designation}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search staff by name, email, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            {(["ALL", "AVAILABLE", "REMOVED"] as const).map((filterOption) => (
              <Button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                variant={filter === filterOption ? "default" : "outline"}
                className={
                  filter === filterOption ? "bg-blue-600 hover:bg-blue-700" : "border-gray-200 hover:bg-gray-50"
                }
              >
                {filterOption}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStaff.map((staff) => (
          <Card
            key={staff.id}
            className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <CardContent className="p-6">
              {/* Avatar and Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                  {staff.imageUrl ? (
                    <img
                      src={staff.imageUrl || "/placeholder.svg"}
                      alt={staff.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 text-lg font-semibold">{staff.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <Badge
                  variant={staff.removed ? "destructive" : "default"}
                  className={
                    staff.removed
                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }
                >
                  {staff.removed ? "Removed" : "Active"}
                </Badge>
              </div>

              {/* Name and Designation */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{staff.name}</h3>
                <p className="text-blue-600 font-medium">{staff.designation}</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4 text-sm text-gray-600">
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

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedStaff(staff)}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleToggle(staff.id, staff.removed)}
                  size="sm"
                  variant={staff.removed ? "default" : "destructive"}
                  className={staff.removed ? "flex-1 bg-green-600 hover:bg-green-700" : "flex-1"}
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

      {/* Empty State */}
      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No staff found</h3>
          <p className="text-gray-500">
            {searchTerm ? "Try adjusting your search terms" : "Add your first staff member to get started"}
          </p>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add New Staff</h2>
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
                      className="w-full"
                    />
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
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
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
                        className="w-full p-2 border border-gray-300 rounded-md"
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
                      <Input
                        name="experience"
                        defaultValue={existingCustomer?.experience}
                        placeholder="e.g., 2 years"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date*</label>
                      <Input name="startDate" type="date" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role*</label>
                      <select
                        name="role"
                        defaultValue="staff"
                        required
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="staff">Staff</option>
                        <option value="customer_staff">Staff & Customer</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Branch*</label>
                      <select name="branchId" required className="w-full p-2 border border-gray-300 rounded-md">
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

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Staff</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleEdit} encType="multipart/form-data" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
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
                    <select
                      name="gender"
                      defaultValue={selectedStaff.gender}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
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
                    <Input
                      name="startDate"
                      type="date"
                      defaultValue={selectedStaff.startDate?.split("T")[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role*</label>
                    <select
                      name="role"
                      defaultValue={selectedStaff.role}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="staff">Staff</option>
                      <option value="customer_staff">Staff & Customer</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch*</label>
                    <select
                      name="branchId"
                      defaultValue={selectedStaff.branchId || ""}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
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

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
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
