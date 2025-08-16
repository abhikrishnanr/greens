"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  ReceiptText,
  Calendar as CalendarIcon,
  Search,
  User,
  Phone,
  Scissors,
  IndianRupee,
  Tag,
  MapPin,
  Ticket,
  Wallet,
  ChevronDown,
  CheckCircle2,
  XCircle,
  FilterX,
  Eraser,
  Loader2,
} from "lucide-react"

interface Coupon {
  id: string
  code: string
  discountType: string
  discountValue: number
}

interface ServiceInfo {
  id: string
  phone: string | null
  customer: string | null
  category: string
  service: string
  variant: string
  start: string
  actualPrice: number
  offerPrice: number
  scheduledAt: string
}

export default function BillingPage() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [services, setServices] = useState<ServiceInfo[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [voucher, setVoucher] = useState("")
  const [billingName, setBillingName] = useState("")
  const [billingAddress, setBillingAddress] = useState("")
  const [method, setMethod] = useState("cash")
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const router = useRouter()

  const showBanner = (type: "success" | "error", msg: string) => {
    setBanner({ type, msg })
    setTimeout(() => setBanner(null), 2600)
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/billing-services?date=${date}`)
        const data: ServiceInfo[] = res.ok ? await res.json() : []
        setServices(data)
      } catch {
        setServices([])
        showBanner("error", "Failed to load services. Try again.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [date])

  const filtered = services.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.service.toLowerCase().includes(q) ||
      s.variant.toLowerCase().includes(q) ||
      (s.phone || "").includes(search) ||
      (s.customer || "").toLowerCase().includes(q)
    )
  })

  const groupedByPhone: Record<string, ServiceInfo[]> = useMemo(() => {
    const g: Record<string, ServiceInfo[]> = {}
    filtered.forEach((s) => {
      const key = s.phone || "unknown"
      g[key] = g[key] || []
      g[key].push(s)
    })
    return g
  }, [filtered])

  const isServiceSelected = (id: string) => selected.includes(id)
  const toggleService = (id: string, checked: boolean) =>
    setSelected((sel) => (checked ? [...sel, id] : sel.filter((i) => i !== id)))

  const toggleGroup = (phone: string) => {
    const list = groupedByPhone[phone] || []
    const allSelected = list.every((s) => selected.includes(s.id))
    if (allSelected) {
      setSelected((sel) => sel.filter((id) => !list.some((s) => s.id === id)))
    } else {
      const ids = list.map((s) => s.id)
      setSelected((sel) => Array.from(new Set([...sel, ...ids])))
    }
  }

  const clearFilters = () => setSearch("")
  const clearSelection = () => setSelected([])
  const clearVoucher = () => {
    setVoucher("")
    setCoupon(null)
  }

  const totalOffer = selected.reduce((acc, id) => {
    const s = services.find((x) => x.id === id)
    return acc + (s ? (s.offerPrice ?? s.actualPrice ?? 0) : 0)
  }, 0)

  const discount = coupon
    ? coupon.discountType === "fixed"
      ? coupon.discountValue
      : (coupon.discountValue / 100) * totalOffer
    : 0

  const finalTotal = Math.max(0, totalOffer - discount)
  const gstAmount = finalTotal * 0.18

  const applyVoucher = async () => {
    if (!voucher.trim()) return
    const res = await fetch(`/api/coupon?code=${encodeURIComponent(voucher.trim())}`)
    if (res.ok) {
      const c = await res.json()
      setCoupon(c)
      showBanner("success", `Voucher "${c.code}" applied`)
    } else {
      setCoupon(null)
      showBanner("error", "Invalid voucher code")
    }
  }

  const confirmBilling = async () => {
    if (!selected.length) return
    const svcData = selected
      .map((id) => services.find((s) => s.id === id)!)
      .map((s) => ({
        phone: s.phone,
        category: s.category,
        service: s.service,
        variant: s.variant,
        amountBefore: s.actualPrice,
        amountAfter: s.offerPrice ?? s.actualPrice,
        scheduledAt: s.scheduledAt,
      }))

    const phones = Array.from(new Set(svcData.map((s) => s.phone).filter(Boolean))) as string[]

    await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        billingName: billingName || null,
        billingAddress: billingAddress || null,
        phones,
        voucherCode: coupon?.code || null,
        paymentMethod: method,
        paidAt: method === "paylater" ? null : new Date().toISOString(),
        services: svcData,
      }),
    })

    setSelected([])
    router.push(`/admin/billing-history?date=${date}`)
  }

  const stat = (title: string, value: string | number, Icon: any) => (
    <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3 text-white">
      <div className="text-xs">{title}</div>
      <div className="text-2xl font-bold flex items-center gap-1">
        <Icon className="h-5 w-5" /> {value}
      </div>
    </div>
  )

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
                <ReceiptText className="h-6 w-6" />
                <span className="uppercase tracking-wider text-xs">Finance</span>
              </div>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold">Salon Billing</h1>
              <p className="mt-2 text-emerald-50 max-w-2xl">
                Select services, apply vouchers, and generate receipts with ease.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stat("Selected", selected.length, Scissors)}
              {stat("Subtotal", `${totalOffer.toFixed(2)}`, IndianRupee)}
              {stat("Discount", `${discount.toFixed(2)}`, Tag)}
              {stat("Final", `${finalTotal.toFixed(2)}`, IndianRupee)}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label htmlFor="date-input" className="text-sm text-emerald-50 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Select date
            </label>
            <input
              id="date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 rounded-md border border-white/30 bg-white/10 px-3 text-white outline-none focus:ring-2 focus:ring-white/40"
            />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
              <input
                placeholder="Search services or customer"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-md border border-white/30 bg-white/10 px-3 text-white outline-none focus:ring-2 focus:ring-white/40 w-64"
              />
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 h-10 text-sm hover:bg-white/20"
              title="Clear search"
            >
              <FilterX className="h-4 w-4" /> Clear
            </button>

            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 h-10 text-sm hover:bg-white/20"
              title="Clear selection"
            >
              <Eraser className="h-4 w-4" /> Deselect all
            </button>
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
            {banner.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <span>{banner.msg}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-10">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Panel: Service Selection */}
          <div className="space-y-6">
            {loading ? (
              <div className="grid gap-4">
                {[0, 1, 2].map((k) => (
                  <div key={k} className="animate-pulse rounded-xl border p-5">
                    <div className="h-5 w-40 bg-gray-200 rounded" />
                    <div className="mt-3 h-4 w-2/3 bg-gray-200 rounded" />
                    <div className="mt-2 h-4 w-1/3 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : Object.keys(groupedByPhone).length === 0 ? (
              <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <ReceiptText className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-gray-900">No services scheduled</h3>
                <p className="text-sm text-gray-500">Try a different date or adjust your search.</p>
              </div>
            ) : (
              Object.entries(groupedByPhone).map(([phone, list]) => {
                const unknown = phone === "unknown"
                const allSelected = list.every((s) => selected.includes(s.id))
                const someSelected = !allSelected && list.some((s) => selected.includes(s.id))

                return (
                  <div key={phone} className="rounded-2xl border bg-white shadow-sm p-6">
                    <div className="flex items-center justify-between gap-3 border-b pb-4">
                      <div className="flex items-center gap-2">
                        {unknown ? <User className="h-5 w-5 text-emerald-600" /> : <Phone className="h-5 w-5 text-emerald-600" />}
                        <h2 className="text-lg font-semibold text-gray-900">
                          {unknown ? "No Phone" : phone}
                        </h2>
                        {list[0].customer && (
                          <span className="text-sm text-gray-500">— {list[0].customer}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleGroup(phone)}
                        className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs border ${
                          allSelected
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : someSelected
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-white text-gray-700 border-gray-200"
                        }`}
                      >
                        {allSelected ? "Deselect all" : "Select all"}
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {list.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            id={`service-${s.id}`}
                            checked={isServiceSelected(s.id)}
                            onChange={(e) => toggleService(s.id, e.target.checked)}
                            className="mt-1 h-4 w-4 rounded-sm border border-emerald-600 text-emerald-600 focus:ring-emerald-300"
                          />
                          <label htmlFor={`service-${s.id}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Scissors className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium text-gray-900">{s.service}</span>
                              <span className="text-gray-500">({s.variant})</span>
                              <span className="ml-auto font-semibold text-gray-900">
                                <IndianRupee className="inline-block h-4 w-4 mr-1" />
                                {(s.offerPrice ?? s.actualPrice).toFixed(2)}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              Scheduled: {format(new Date(s.scheduledAt), "MMM dd, yyyy • hh:mm a")}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Right Panel: Billing Preview */}
          <div className="space-y-6">
            <div className="md:sticky md:top-8 p-6 rounded-2xl border bg-white shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b pb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-900">
                  <ReceiptText className="h-6 w-6 text-emerald-600" /> Billing Preview
                </h2>
                {selected.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {selected.length} item{selected.length > 1 ? "s" : ""} selected
                  </span>
                )}
              </div>

              {selected.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Scissors className="h-5 w-5 text-gray-600" />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Select one or more services to preview bill.</p>
                </div>
              ) : (
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900">Selected Services</h3>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selected.map((id) => {
                        const s = services.find((x) => x.id === id)!
                        return (
                          <li key={id} className="flex justify-between items-center">
                            <span>{s.service} — {s.variant}</span>
                            <span className="font-medium">
                              <IndianRupee className="inline-block h-3 w-3 mr-0.5" />
                              {(s.offerPrice ?? s.actualPrice).toFixed(2)}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold text-gray-900">
                        <IndianRupee className="inline-block h-4 w-4 mr-1" />
                        {totalOffer.toFixed(2)}
                      </span>
                    </p>

                    {coupon && (
                      <p className="flex justify-between text-emerald-700">
                        <span className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          Discount ({coupon.code}
                          {coupon.discountType === "percent" ? ` • ${coupon.discountValue}%` : ""})
                        </span>
                        <span className="font-semibold">
                          - <IndianRupee className="inline-block h-4 w-4 mr-1" />
                          {discount.toFixed(2)}
                        </span>
                      </p>
                    )}

                    <p className="flex justify-between">
                      <span className="text-gray-600">GST (18%)</span>
                      <span className="font-semibold text-gray-900">
                        <IndianRupee className="inline-block h-4 w-4 mr-1" />
                        {gstAmount.toFixed(2)}
                      </span>
                    </p>

                    <p className="flex justify-between text-lg font-bold text-emerald-700">
                      <span>Final</span>
                      <span>
                        <IndianRupee className="inline-block h-5 w-5 mr-1" />
                        {finalTotal.toFixed(2)}
                      </span>
                    </p>
                  </div>

                  {/* Customer details */}
                  <div className="grid gap-4">
                    <div>
                      <label
                        htmlFor="billing-name"
                        className="flex items-center gap-2 mb-1 text-sm font-medium"
                      >
                        <User className="h-4 w-4 text-gray-500" /> Billing Name
                      </label>
                      <input
                        id="billing-name"
                        placeholder="Enter customer name"
                        value={billingName}
                        onChange={(e) => setBillingName(e.target.value)}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="billing-address"
                        className="flex items-center gap-2 mb-1 text-sm font-medium"
                      >
                        <MapPin className="h-4 w-4 text-gray-500" /> Billing Address
                      </label>
                      <input
                        id="billing-address"
                        placeholder="Enter customer address"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>

                    {/* Voucher */}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label
                          htmlFor="voucher-code"
                          className="flex items-center gap-2 mb-1 text-sm font-medium"
                        >
                          <Ticket className="h-4 w-4 text-gray-500" /> Voucher Code
                        </label>
                        <input
                          id="voucher-code"
                          placeholder="Enter voucher code"
                          value={voucher}
                          onChange={(e) => setVoucher(e.target.value)}
                          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={applyVoucher}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 text-white h-10 px-5 text-sm hover:bg-emerald-700"
                      >
                        Apply
                      </button>
                      {coupon && (
                        <button
                          type="button"
                          onClick={clearVoucher}
                          className="inline-flex items-center justify-center gap-2 rounded-md border h-10 px-3 text-sm hover:bg-gray-50"
                          title="Remove voucher"
                        >
                          <Eraser className="h-4 w-4" /> Clear
                        </button>
                      )}
                    </div>

                    {/* Payment */}
                    <div>
                      <label
                        htmlFor="payment-method"
                        className="flex items-center gap-2 mb-1 text-sm font-medium"
                      >
                        <Wallet className="h-4 w-4 text-gray-500" /> Payment Method
                      </label>
                      <div className="relative">
                        <select
                          id="payment-method"
                          value={method}
                          onChange={(e) => setMethod(e.target.value)}
                          className="appearance-none h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 pr-9"
                        >
                          <option value="cash">Cash</option>
                          <option value="upi">UPI</option>
                          <option value="card">Card</option>
                          <option value="paylater">Pay Later</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={confirmBilling}
                      disabled={!selected.length}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 text-white w-full py-3 text-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                      Confirm Billing
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
