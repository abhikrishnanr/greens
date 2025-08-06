"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  ReceiptText,
  Calendar,
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
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/billing-services?date=${date}`)
      .then((res) => res.json())
      .then((data: ServiceInfo[]) => setServices(data))
  }, [date])

  const filtered = services.filter(
    (s) =>
      !search ||
      s.service.toLowerCase().includes(search.toLowerCase()) ||
      s.variant.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone || "").includes(search) ||
      (s.customer || "").toLowerCase().includes(search.toLowerCase()),
  )

  const groupedByPhone: { [key: string]: ServiceInfo[] } = {}
  filtered.forEach((s) => {
    const key = s.phone || "unknown"
    groupedByPhone[key] = groupedByPhone[key] || []
    groupedByPhone[key].push(s)
  })

  const getCardBgClass = (idx: number) => {
    const classes = ["bg-card-bg-1", "bg-card-bg-2", "bg-card-bg-3", "bg-card-bg-4", "bg-card-bg-5"]
    return classes[idx % classes.length]
  }

  const totalOffer = selected.reduce((acc, id) => {
    const s = services.find((s) => s.id === id)
    return acc + (s?.offerPrice ?? s?.actualPrice || 0)
  }, 0)

  const discount = coupon
    ? coupon.discountType === "fixed"
      ? coupon.discountValue
      : (coupon.discountValue / 100) * totalOffer
    : 0

  const finalTotal = totalOffer - discount
  const gstAmount = finalTotal * 0.18

  const applyVoucher = async () => {
    if (!voucher) return
    const res = await fetch(`/api/coupon?code=${voucher}`)
    if (res.ok) {
      const c = await res.json()
      setCoupon(c)
    } else {
      setCoupon(null)
      alert("Invalid voucher code")
    }
  }

  const confirmBilling = async () => {
    const svcData = selected
      .map((id) => services.find((s) => s.id === id)!)
      .map((s) => ({
        phone: s.phone,
        category: s.category,
        service: s.service,
        variant: s.variant,
        amountBefore: s.actualPrice,
        amountAfter: (s.offerPrice ?? s.actualPrice) * (finalTotal / totalOffer || 1),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white text-foreground">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <ReceiptText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Salon Billing</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Panel: Service Selection */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-card text-card-foreground shadow-md p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 flex-1">
                  <label htmlFor="date-input" className="sr-only">
                    Date
                  </label>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <input
                    id="date-input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="flex-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    placeholder="Search services or customer"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {Object.entries(groupedByPhone).length === 0 && (
              <p className="text-center text-muted-foreground">No scheduled services found for this date.</p>
            )}

            {Object.entries(groupedByPhone).map(([phone, list], idx) => (
              <div key={phone} className={`rounded-xl shadow-lg ${getCardBgClass(idx)} p-6`}>
                <div className="flex flex-col space-y-1.5 pb-3">
                  <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                    {phone === "unknown" ? (
                      <>
                        <User className="h-5 w-5" /> No Phone
                      </>
                    ) : (
                      <>
                        <Phone className="h-5 w-5" /> {phone}
                      </>
                    )}
                    {list[0].customer && (
                      <span className="text-base font-normal text-muted-foreground">
                        - <User className="inline-block h-4 w-4 mr-1" /> {list[0].customer}
                      </span>
                    )}
                  </h2>
                </div>
                <div className="space-y-3">
                  {list.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-background/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={`service-${s.id}`}
                        checked={selected.includes(s.id)}
                        onChange={(e) => {
                          setSelected((sel) => (e.target.checked ? [...sel, s.id] : sel.filter((i) => i !== s.id)))
                        }}
                        className="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <label
                        htmlFor={`service-${s.id}`}
                        className="flex-1 flex flex-wrap items-center gap-x-2 text-base cursor-pointer"
                      >
                        <Scissors className="h-4 w-4 text-primary" />
                        <span className="font-medium">{s.service}</span>
                        <span className="text-muted-foreground">({s.variant})</span>
                        <span className="ml-auto font-semibold text-foreground">
                          <IndianRupee className="inline-block h-4 w-4 mr-1" />
                          {(s.offerPrice ?? s.actualPrice).toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground w-full text-right">
                          Scheduled: {format(new Date(s.scheduledAt), "MMM dd, yyyy hh:mm a")}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel: Billing Preview */}
          <div className="space-y-6">
            {selected.length > 0 && (
              <div className="md:sticky md:top-8 p-6 shadow-lg rounded-xl border-primary/20 border-2 bg-card text-card-foreground">
                <div className="flex flex-col space-y-1.5 pb-4">
                  <h2 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-primary">
                    <ReceiptText className="h-6 w-6" /> Billing Preview
                  </h2>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Selected Services:</h3>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      {selected.map((id) => {
                        const s = services.find((s) => s.id === id)!
                        return (
                          <li key={id} className="flex justify-between items-center">
                            <span>
                              {s.service} - {s.variant}
                            </span>
                            <span className="font-medium text-foreground">
                              <IndianRupee className="inline-block h-3 w-3 mr-0.5" />
                              {(s.offerPrice ?? s.actualPrice).toFixed(2)}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  <div className="space-y-2 text-base">
                    <p className="flex justify-between items-center">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold text-foreground">
                        <IndianRupee className="inline-block h-4 w-4 mr-1" />
                        {totalOffer.toFixed(2)}
                      </span>
                    </p>
                    {coupon && (
                      <p className="flex justify-between items-center text-green-600">
                        <span className="flex items-center gap-1">
                          <Tag className="h-4 w-4" /> Discount ({coupon.code}):
                        </span>
                        <span className="font-semibold">
                          - <IndianRupee className="inline-block h-4 w-4 mr-1" />
                          {discount.toFixed(2)}
                        </span>
                      </p>
                    )}
                    <p className="flex justify-between items-center">
                      <span className="text-muted-foreground">GST (18%):</span>
                      <span className="font-semibold text-foreground">
                        <IndianRupee className="inline-block h-4 w-4 mr-1" />
                        {gstAmount.toFixed(2)}
                      </span>
                    </p>
                    <p className="flex justify-between items-center text-xl font-bold text-primary">
                      <span>Final:</span>
                      <span>
                        <IndianRupee className="inline-block h-5 w-5 mr-1" />
                        {finalTotal.toFixed(2)}
                      </span>
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label
                        htmlFor="billing-name"
                        className="flex items-center gap-2 mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <User className="h-4 w-4 text-muted-foreground" /> Billing Name
                      </label>
                      <input
                        id="billing-name"
                        placeholder="Enter customer name"
                        value={billingName}
                        onChange={(e) => setBillingName(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="billing-address"
                        className="flex items-center gap-2 mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground" /> Billing Address
                      </label>
                      <input
                        id="billing-address"
                        placeholder="Enter customer address"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label
                          htmlFor="voucher-code"
                          className="flex items-center gap-2 mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <Ticket className="h-4 w-4 text-muted-foreground" /> Voucher Code
                        </label>
                        <input
                          id="voucher-code"
                          placeholder="Enter voucher code"
                          value={voucher}
                          onChange={(e) => setVoucher(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={applyVoucher}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
                      >
                        Apply
                      </button>
                    </div>
                    <div>
                      <label
                        htmlFor="payment-method"
                        className="flex items-center gap-2 mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <Wallet className="h-4 w-4 text-muted-foreground" /> Payment Method
                      </label>
                      <div className="relative">
                        <select
                          id="payment-method"
                          value={method}
                          onChange={(e) => setMethod(e.target.value)}
                          className="appearance-none flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10" // Added pr-10 for icon space
                        >
                          <option value="cash" className="flex items-center">
                            Cash
                          </option>
                          <option value="upi" className="flex items-center">
                            UPI
                          </option>
                          <option value="card" className="flex items-center">
                            Card
                          </option>
                          <option value="paylater" className="flex items-center">
                            Pay Later
                          </option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={confirmBilling}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 w-full py-3 text-lg font-semibold"
                    >
                      Confirm Billing
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
