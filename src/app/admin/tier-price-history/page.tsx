"use client"

import type React from "react"

import { useEffect, useState, useMemo } from "react"
import {
  Pencil,
  Trash2,
  Search,
  ChevronDown,
  CheckIcon,
  XCircle,
  DollarSign,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
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

export default function TierPriceHistoryPage() {
  const empty: Partial<Entry> = { id: "", actualPrice: 0, startDate: "" }
  const [rows, setRows] = useState<TierRow[]>([])
  const [selected, setSelected] = useState("") // Renamed from selectedTierId
  const [entries, setEntries] = useState<Entry[]>([])
  const [form, setForm] = useState<Partial<Entry>>(empty)
  const [editing, setEditing] = useState(false) // Renamed from isEditing
  const [isDialogOpen, setIsDialogOpen] = useState(false) // Kept for dialog state

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [serviceFilter, setServiceFilter] = useState<string[]>([])
  const [tierFilter, setTierFilter] = useState<string[]>([])

  useEffect(() => {
    loadRows()
  }, [])

  const loadRows = async () => {
    const tiers = await fetch("/api/admin/service-tiers/all").then((r) => r.json())
    setRows(tiers)
  }

  const open = async (tierId: string) => {
    // Original function name
    setSelected(tierId)
    const hist = await fetch(`/api/admin/tier-price-history/${tierId}`).then((r) => r.json())
    setEntries(hist)
    setForm({ ...empty, id: crypto.randomUUID() })
    setEditing(false)
    setIsDialogOpen(true) // Open the dialog
  }

  const closeTierDetails = () => {
    // Helper to close dialog
    setSelected("")
    setEntries([])
    setIsDialogOpen(false)
  }

  const save = async (e: React.FormEvent) => {
    // Original function name
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
    // Reload entries for the current tier and the main table
    const hist = await fetch(`/api/admin/tier-price-history/${selected}`).then((r) => r.json())
    setEntries(hist)
    loadRows()
  }

  const edit = (e: Entry) => {
    // Original function name
    setForm({ ...e })
    setEditing(true)
  }

  const del = async (id: string) => {
    // Original function name
    if (!confirm("Are you sure you want to delete this price entry?")) return
    await fetch(`/api/admin/tier-price-history/${selected}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    // Reload entries for the current tier and the main table
    const hist = await fetch(`/api/admin/tier-price-history/${selected}`).then((r) => r.json())
    setEntries(hist)
    loadRows()
  }

  const filteredRows = useMemo(() => {
    let currentRows = rows

    // Apply search term
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

    // Apply category filter
    if (categoryFilter.length > 0) {
      currentRows = currentRows.filter((row) => categoryFilter.includes(row.categoryName))
    }

    // Apply service filter
    if (serviceFilter.length > 0) {
      currentRows = currentRows.filter((row) => serviceFilter.includes(row.serviceName))
    }

    // Apply tier filter
    if (tierFilter.length > 0) {
      currentRows = currentRows.filter((row) => tierFilter.includes(row.tierName))
    }

    return currentRows
  }, [rows, searchTerm, categoryFilter, serviceFilter, tierFilter])

  const uniqueCategories = useMemo(() => Array.from(new Set(rows.map((row) => row.categoryName))), [rows])
  const uniqueServices = useMemo(() => Array.from(new Set(rows.map((row) => row.serviceName))), [rows])
  const uniqueTiers = useMemo(() => Array.from(new Set(rows.map((row) => row.tierName))), [rows])

  const tiersWithCurrentPrice = rows.filter((row) => row.current).length
  const tiersWithUpcomingPrice = rows.filter((row) => row.upcoming).length
  const tiersWithoutPrice = rows.filter((row) => !row.current && !row.upcoming).length

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
              <DollarSign className="h-5 w-5 text-green-500" />
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
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by category, service, or tier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-md border focus-visible:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto justify-between bg-white hover:bg-gray-50">
                    Category
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search category..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {uniqueCategories.map((category) => (
                          <CommandItem
                            key={category}
                            onSelect={() => {
                              setCategoryFilter((prev) =>
                                prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
                              )
                            }}
                          >
                            <div
                              className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                categoryFilter.includes(category)
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible",
                              )}
                            >
                              <CheckIcon className={cn("h-4 w-4")} />
                            </div>
                            <span>{category}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {categoryFilter.length > 0 && (
                        <>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => setCategoryFilter([])}
                              className="justify-center text-center text-red-500"
                            >
                              Clear filters
                            </CommandItem>
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Service Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto justify-between bg-white hover:bg-gray-50">
                    Service
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search service..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {uniqueServices.map((service) => (
                          <CommandItem
                            key={service}
                            onSelect={() => {
                              setServiceFilter((prev) =>
                                prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service],
                              )
                            }}
                          >
                            <div
                              className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                serviceFilter.includes(service)
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible",
                              )}
                            >
                              <CheckIcon className={cn("h-4 w-4")} />
                            </div>
                            <span>{service}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {serviceFilter.length > 0 && (
                        <>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => setServiceFilter([])}
                              className="justify-center text-center text-red-500"
                            >
                              Clear filters
                            </CommandItem>
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Tier Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto justify-between bg-white hover:bg-gray-50">
                    Tier
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search tier..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {uniqueTiers.map((tier) => (
                          <CommandItem
                            key={tier}
                            onSelect={() => {
                              setTierFilter((prev) =>
                                prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier],
                              )
                            }}
                          >
                            <div
                              className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                tierFilter.includes(tier)
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible",
                              )}
                            >
                              <CheckIcon className={cn("h-4 w-4")} />
                            </div>
                            <span>{tier}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {tierFilter.length > 0 && (
                        <>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => setTierFilter([])}
                              className="justify-center text-center text-red-500"
                            >
                              Clear filters
                            </CommandItem>
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {(searchTerm || categoryFilter.length > 0 || serviceFilter.length > 0 || tierFilter.length > 0) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter([])
                    setServiceFilter([])
                    setTierFilter([])
                  }}
                  className="h-9 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Reset Filters
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
                                ${row.current.actualPrice}
                              </Badge>
                              {row.current.offerPrice && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
                                >
                                  Offer: ${row.current.offerPrice}
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
                                ${row.upcoming.actualPrice}
                              </Badge>
                              {row.upcoming.offerPrice && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
                                >
                                  Offer: ${row.upcoming.offerPrice}
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
                                onClick={() => open(row.id)} // Original function call
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
          <DialogContent className="sm:max-w-[500px] p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Edit Price History</DialogTitle>
              <DialogDescription>Manage individual price entries for this service tier.</DialogDescription>
            </DialogHeader>
            <Separator className="my-4" />
            <form onSubmit={save} className="grid gap-5">
              {" "}
              {/* Original function call */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="actualPrice" className="text-right font-medium">
                  Actual Price
                </Label>
                <Input
                  id="actualPrice"
                  type="number"
                  placeholder="e.g., 50.00"
                  value={form.actualPrice ?? ""}
                  onChange={(e) => setForm({ ...form, actualPrice: Number.parseFloat(e.target.value) })}
                  required
                  className="col-span-3 focus-visible:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="offerPrice" className="text-right font-medium">
                  Offer Price
                </Label>
                <Input
                  id="offerPrice"
                  type="number"
                  placeholder="e.g., 45.00 (optional)"
                  value={form.offerPrice ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, offerPrice: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                  className="col-span-3 focus-visible:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right font-medium">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate || ""}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                  className="col-span-3 focus-visible:ring-blue-500"
                />
              </div>
              <p className="text-xs text-muted-foreground col-start-2 col-span-3 -mt-2">
                Date when this price becomes effective.
              </p>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right font-medium">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate || ""}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value || null })}
                  className="col-span-3 focus-visible:ring-blue-500"
                />
              </div>
              <p className="text-xs text-muted-foreground col-start-2 col-span-3 -mt-2">
                Leave blank if this price has no planned end date.
              </p>
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
                  {editing ? "Update Entry" : "Add New Entry"} {/* Original state variable */}
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
                          <TableCell className="font-medium">${e.actualPrice}</TableCell>
                          <TableCell>{e.offerPrice ? `$${e.offerPrice}` : "—"}</TableCell>
                          <TableCell>{new Date(e.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{e.endDate ? new Date(e.endDate).toLocaleDateString() : "—"}</TableCell>
                          <TableCell className="text-right">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => edit(e)} // Original function call
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
                                  onClick={() => del(e.id)} // Original function call
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
