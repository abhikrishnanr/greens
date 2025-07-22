"use client"
import type React from "react"
import { useEffect, useState, useMemo } from "react"
import {
  Pencil,
  Trash2,
  Search,
  XCircle,
  IndianRupee,
  Calendar,
  Tag,
  Sparkles,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TierRow {
  id: string
  tierName: string
  serviceName: string
  categoryName: string
  current?: Entry
  upcoming?: Entry
}

interface Entry {
  id: string
  actualPrice: number
  offerPrice?: number | null
  startDate: string
  endDate?: string | null
}

// Helper function to format date for input type="date" (YYYY-MM-DD)
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    // Ensure it's a valid date before formatting
    if (isNaN(date.getTime())) return ""
    return date.toISOString().split("T")[0]
  } catch (error) {
    console.error("Error formatting date:", error)
    return ""
  }
}

export default function TierPriceHistoryPage() {
  const empty: Partial<Entry> = { id: "", actualPrice: 0, startDate: "" }
  const [rows, setRows] = useState<TierRow[]>([])
  const [selected, setSelected] = useState("")
  const [entries, setEntries] = useState<Entry[]>([])
  const [form, setForm] = useState<Partial<Entry>>(empty)
  const [editing, setEditing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [serviceFilter, setServiceFilter] = useState<string[]>([])
  const [tierFilter, setTierFilter] = useState<string[]>([])


  // Get today's date in YYYY-MM-DD format for min attribute
  const today = useMemo(() => new Date().toISOString().split("T")[0], [])

  useEffect(() => {
    loadRows()
  }, [])

  const loadRows = async () => {
    const tiers = await fetch("/api/admin/service-tiers/all").then((r) => r.json())
    setRows(tiers)
  }

  const open = async (tierId: string) => {
    setSelected(tierId)
    const hist = await fetch(`/api/admin/tier-price-history/${tierId}`).then((r) => r.json())
    setEntries(hist)
    setForm({ ...empty, id: crypto.randomUUID() })
    setEditing(false)
    setIsDialogOpen(true)
  }

  const closeTierDetails = () => {
    setSelected("")
    setEntries([])
    setIsDialogOpen(false)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = {
      actualPrice: Number(form.actualPrice),
      offerPrice: form.offerPrice !== undefined && form.offerPrice !== null ? Number(form.offerPrice) : null,
      startDate: form.startDate,
      endDate: form.endDate || null,
    }
    if (editing) {
      await fetch(`/api/admin/tier-price-history/${selected}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: form.id, ...body }),
      })
    } else {
      await fetch(`/api/admin/tier-price-history/${selected}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    }
    setForm({ ...empty, id: crypto.randomUUID() })
    setEditing(false)
    const hist = await fetch(`/api/admin/tier-price-history/${selected}`).then((r) => r.json())
    setEntries(hist)
    loadRows()
  }

  const edit = (e: Entry) => {
    setForm({ ...e })
    setEditing(true)
  }

  const del = async (id: string) => {
    if (!confirm("Are you sure you want to delete this price entry?")) return
    await fetch(`/api/admin/tier-price-history/${selected}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    const hist = await fetch(`/api/admin/tier-price-history/${selected}`).then((r) => r.json())
    setEntries(hist)
    loadRows()
  }

  const filteredRows = useMemo(() => {
    let currentRows = rows
    if (searchTerm) {
      currentRows = currentRows.filter(
        (row) =>
          row.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.tierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.current?.actualPrice?.toString().includes(searchTerm) ||
          row.upcoming?.actualPrice?.toString().includes(searchTerm),
      )
    }
    if (categoryFilter.length > 0) {
      currentRows = currentRows.filter((row) => categoryFilter.includes(row.categoryName))
    }
    if (serviceFilter.length > 0) {
      currentRows = currentRows.filter((row) => serviceFilter.includes(row.serviceName))
    }
    if (tierFilter.length > 0) {
      currentRows = currentRows.filter((row) => tierFilter.includes(row.tierName))
    }
    return [...currentRows].sort((a, b) => {
      const cat = a.categoryName.localeCompare(b.categoryName)
      if (cat !== 0) return cat
      const serv = a.serviceName.localeCompare(b.serviceName)
      if (serv !== 0) return serv
      return a.tierName.localeCompare(b.tierName)
    })
  }, [rows, searchTerm, categoryFilter, serviceFilter, tierFilter])

  const uniqueCategories = useMemo(() => Array.from(new Set(rows.map((row) => row.categoryName))), [rows])
  const uniqueServices = useMemo(() => Array.from(new Set(rows.map((row) => row.serviceName))), [rows])
  const uniqueTiers = useMemo(() => Array.from(new Set(rows.map((row) => row.tierName))), [rows])

  const tiersWithCurrentPrice = rows.filter((row) => row.current).length
  const tiersWithUpcomingPrice = rows.filter((row) => row.upcoming).length
  const tiersWithoutPrice = rows.filter((row) => !row.current && !row.upcoming).length

  // Determine if the current form's start date is in the past (for disabling)
  const isStartDateInPast = useMemo(() => {
    if (!form.startDate) return false
    const entryDate = new Date(form.startDate)
    const now = new Date()
    // Compare only dates, ignoring time
    return entryDate.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0)
  }, [form.startDate])

  // Determine the minimum allowed date for the end date input
  const endDateMinDate = useMemo(() => {
    if (form.startDate) {
      // End date cannot be before start date
      return formatDateForInput(form.startDate)
    }
    // If no start date, end date cannot be before today
    return today
  }, [form.startDate, today])

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 px-4 md:px-6 bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">Salon Pricing & Offers</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Effortlessly manage and update all service tier prices and special offers.
        </p>
        {/* Info Graphics / Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <Card className="shadow-lg border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Service Tiers</CardTitle>
              <Tag className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{rows.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All available service tiers</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-l-4 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Tiers with Active Pricing</CardTitle>
              <IndianRupee className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{tiersWithCurrentPrice}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently configured prices</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-l-4 border-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Tiers with Upcoming Offers</CardTitle>
              <Calendar className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{tiersWithUpcomingPrice}</div>
              <p className="text-xs text-muted-foreground mt-1">Future price changes or promotions</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-l-4 border-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Tiers Needing Price Setup</CardTitle>
              <Info className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{tiersWithoutPrice}</div>
              <p className="text-xs text-muted-foreground mt-1">Tiers without any price configuration</p>
            </CardContent>
          </Card>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Service Tier Price List</CardTitle>
            <CardDescription>Browse, filter, and manage pricing details for each service tier.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 items-end gap-4 mb-6">
              <div className="relative col-span-full xl:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by category, service, or tier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-md border focus-visible:ring-blue-500"
                />
              </div>
              {/* Category Filter */}
              <div className="col-span-1">
                <Label htmlFor="categoryFilter" className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </Label>
                <MultiSelect
                  id="categoryFilter"
                  options={uniqueCategories}
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                />
              </div>
              {/* Service Filter */}
              <div className="col-span-1">
                <Label htmlFor="serviceFilter" className="mb-1 block text-sm font-medium text-gray-700">
                  Service
                </Label>
                <MultiSelect
                  id="serviceFilter"
                  options={uniqueServices}
                  value={serviceFilter}
                  onValueChange={setServiceFilter}
                />
              </div>
              {/* Tier Filter */}
              <div className="col-span-1">
                <Label htmlFor="tierFilter" className="mb-1 block text-sm font-medium text-gray-700">
                  Tier
                </Label>
                <MultiSelect
                  id="tierFilter"
                  options={uniqueTiers}
                  value={tierFilter}
                  onValueChange={setTierFilter}
                />
              </div>
              {(searchTerm || categoryFilter.length > 0 || serviceFilter.length > 0 || tierFilter.length > 0) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter([])
                    setServiceFilter([])
                    setTierFilter([])
                  }}
                  className="col-span-full justify-self-start h-9 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Reset All Filters
                  <XCircle className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            {/* Main Table */}
            <div className="rounded-lg border overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="w-[60px] text-center">Sl No.</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Current Ends</TableHead>
                    <TableHead>Upcoming Price</TableHead>
                    <TableHead>Upcoming Starts</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.length > 0 ? (
                    filteredRows.map((row, index) => (
                      <TableRow key={row.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-center text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-semibold text-gray-800">{row.categoryName}</TableCell>
                        <TableCell>{row.serviceName}</TableCell>
                        <TableCell>{row.tierName}</TableCell>
                        <TableCell>
                          {row.current ? (
                            <div className="flex flex-col items-start gap-1">
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                ₹{row.current.actualPrice}
                              </Badge>
                              {row.current.offerPrice && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
                                >
                                  Offer: ₹{row.current.offerPrice}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
                              Not Set
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.current?.endDate ? new Date(row.current.endDate).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          {row.upcoming ? (
                            <div className="flex flex-col items-start gap-1">
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                ₹{row.upcoming.actualPrice}
                              </Badge>
                              {row.upcoming.offerPrice && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
                                >
                                  Offer: ₹{row.upcoming.offerPrice}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.upcoming?.startDate ? new Date(row.upcoming.startDate).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => open(row.id)}
                                className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Price History</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Sparkles className="h-8 w-8 text-gray-400" />
                          <p>No matching service tiers found.</p>
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchTerm("")
                              setCategoryFilter([])
                              setServiceFilter([])
                              setTierFilter([])
                            }}
                          >
                            Clear all filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        {/* Price Entry Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] p-6 max-h-[80vh] overflow-y-auto text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Edit Price History</DialogTitle>
              <DialogDescription>Manage individual price entries for this service tier.</DialogDescription>
            </DialogHeader>
            <Separator className="my-4" />
            <form onSubmit={save} className="space-y-4">
              <div>
                <Label htmlFor="actualPrice" className="font-medium">
                  Actual Price
                </Label>
                <Input
                  id="actualPrice"
                  type="number"
                  placeholder="e.g., 500.00"
                  value={form.actualPrice ?? ""}
                  onChange={(e) => setForm({ ...form, actualPrice: Number.parseFloat(e.target.value) })}
                  required
                  className="mt-1 w-full focus-visible:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="offerPrice" className="font-medium">
                  Offer Price
                </Label>
                <Input
                  id="offerPrice"
                  type="number"
                  placeholder="e.g., 450.00 (optional)"
                  value={form.offerPrice ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, offerPrice: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                  className="mt-1 w-full focus-visible:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="startDate" className="font-medium">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formatDateForInput(form.startDate)}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                  disabled={editing && isStartDateInPast}
                  min={today}
                  className="mt-1 w-full focus-visible:ring-blue-500"
                />
                <p className="mt-2 text-xs text-muted-foreground">Date when this price becomes effective.</p>
              </div>
              <div>
                <Label htmlFor="endDate" className="font-medium">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formatDateForInput(form.endDate)}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value || null })}
                  min={endDateMinDate}
                  className="mt-1 w-full focus-visible:ring-blue-500"
                />
                <p className="mt-2 text-xs text-muted-foreground">Leave blank if this price has no planned end date.</p>
              </div>
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeTierDetails}
                  className="hover:bg-gray-100 bg-transparent"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editing ? "Update Entry" : "Add New Entry"}
                </Button>
              </DialogFooter>
            </form>
            {entries.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Historical Price Entries</h3>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Actual</TableHead>
                        <TableHead>Offer</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((e) => (
                        <TableRow key={e.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium">₹{e.actualPrice}</TableCell>
                          <TableCell>{e.offerPrice ? `₹${e.offerPrice}` : "—"}</TableCell>
                          <TableCell>{new Date(e.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{e.endDate ? new Date(e.endDate).toLocaleDateString() : "—"}</TableCell>
                          <TableCell className="text-right">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => edit(e)}
                                  className="text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Entry</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => del(e.id)}
                                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Entry</TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
