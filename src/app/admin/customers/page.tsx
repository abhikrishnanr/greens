"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users,
  UserCheck,
  TrendingUp,
  Search,
  Filter,
  Building2,
  Crown,
  DollarSign,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface Branch {
  id: string
  name: string
}

interface Customer {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  gender: string | null
  removed: boolean
  branch?: Branch | null
}

interface TopCustomer {
  id: string
  name: string | null
  phone: string | null
  count?: number
  total?: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "REMOVED">("ALL")
  const [branchFilter, setBranchFilter] = useState("")
  const [branches, setBranches] = useState<Branch[]>([])
  const [topServices, setTopServices] = useState<TopCustomer[]>([])
  const [topBills, setTopBills] = useState<TopCustomer[]>([])
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [returningCustomers, setReturningCustomers] = useState(0)
  const [returningPercent, setReturningPercent] = useState(0)

  const load = async () => {
    const url = branchFilter ? `/api/customers?branchId=${branchFilter}` : "/api/customers"
    const res = await fetch(url)
    const data = await res.json()
    if (data.success) setCustomers(data.customers)
  }

  const loadBranches = async () => {
    const res = await fetch("/api/branch")
    const data = await res.json()
    if (data.success) setBranches(data.branches)
  }

  const loadStats = async () => {
    const res = await fetch("/api/customers/stats")
    const data = await res.json()
    if (data.success) {
      setTopServices(data.topServices)
      setTopBills(data.topBills)
      setTotalCustomers(data.totalCustomers)
      setReturningCustomers(data.returningCustomers)
      setReturningPercent(data.returningPercent)
    }
  }

  useEffect(() => {
    loadBranches()
    loadStats()
  }, [])

  useEffect(() => {
    load()
  }, [branchFilter])

  const filtered = customers
    .filter((c) => {
      if (filter === "ALL") return true
      return filter === "REMOVED" ? c.removed : !c.removed
    })
    .filter((c) => {
      const q = search.toLowerCase()
      return (c.name || "").toLowerCase().includes(q) || (c.phone || "").toLowerCase().includes(q)
    })

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: "#8b5cf6" }}>
            <Users className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        </div>
        <p className="text-gray-600">Manage your salon customers and track their engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-lg shadow-lg p-6 text-white" style={{ backgroundColor: "#3b82f6" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Customers</p>
              <p className="text-3xl font-bold">{totalCustomers.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: "#2563eb" }}>
              <Users className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow-lg p-6 text-white" style={{ backgroundColor: "#10b981" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Returning Customers</p>
              <p className="text-3xl font-bold">{returningCustomers.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: "#059669" }}>
              <UserCheck className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow-lg p-6 text-white" style={{ backgroundColor: "#8b5cf6" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Return Rate</p>
              <p className="text-3xl font-bold">{returningPercent.toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: "#7c3aed" }}>
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Crown className="h-5 w-5" style={{ color: "#eab308" }} />
              Top by Services
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {topServices.map((customer, idx) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-8 h-8 text-white rounded-full text-sm font-bold"
                      style={{ backgroundColor: "#eab308" }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-medium text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        {customer.name || customer.phone}
                      </Link>
                    </div>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-sm font-medium"
                    style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                  >
                    {customer.count} services
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <DollarSign className="h-5 w-5" style={{ color: "#10b981" }} />
              Top by Revenue
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {topBills.map((customer, idx) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-8 h-8 text-white rounded-full text-sm font-bold"
                      style={{ backgroundColor: "#10b981" }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-medium text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        {customer.name || customer.phone}
                      </Link>
                    </div>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-sm font-medium"
                    style={{ backgroundColor: "#dcfce7", color: "#166534" }}
                  >
                    ₹{(customer.total || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search customers by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>

            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              {(["ALL", "ACTIVE", "REMOVED"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    filter === status ? "text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  style={filter === status ? { backgroundColor: "#8b5cf6" } : {}}
                >
                  <Filter className="h-4 w-4" />
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Branch
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((customer, idx) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-500">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors underline"
                    >
                      {customer.name || "Unnamed Customer"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.phone || "No phone"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {customer.branch?.name || "No branch"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {customer.removed ? (
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Removed
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: "#dcfce7", color: "#166534" }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No customers found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
