"use client"

import { useEffect, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import { format, subDays } from "date-fns"
import {
  History,
  Calendar as CalendarIcon,
  IndianRupee,
  Scissors,
  ReceiptText,
  User,
  Phone,
  Tag,
  Wallet,
  Printer,
  Download,
  Eye,
  X,
  Hash,
  MapPin,
  ImageDown,
  Info,
  CheckCircle2,
  XCircle,
  FileDown,
} from "lucide-react"

const SALON_INFO = {
  name: "Greens Beauty Salon",
  logo: "/logo.png", // serve from public
  address: "TC 45/215, Kunjalumood Junction, Karamana PO, Trivandrum",
  phone: "+91 8891 467678",
  email: "greensalon@gmail.com",
  website: "https://greensbeautysalon.com",
}

interface BillItem {
  phone: string | null
  category: string
  service: string
  variant: string
  amountBefore: number
  amountAfter: number
  scheduledAt: string
}

interface Bill {
  id: string
  phones: string[]
  billingName: string | null
  billingAddress: string | null
  voucherCode: string | null
  paymentMethod: string
  paidAt: string | null
  totalBefore: number
  totalAfter: number
  createdAt: string
  items: BillItem[]
}

function toWordsIndian(num: number) {
  // simple amount in words (INR) – keeps it small & dependable for receipts
  const a = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen",
  ]
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
  const n = Math.floor(num)
  if (n === 0) return "zero"
  function twoDigits(n: number) {
    return n < 20 ? a[n] : b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "")
  }
  function threeDigits(n: number) {
    return n > 99 ? a[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + twoDigits(n % 100) : "") : twoDigits(n)
  }
  let str = ""
  const crore = Math.floor(n / 10000000)
  const lakh = Math.floor((n / 100000) % 100)
  const thousand = Math.floor((n / 1000) % 100)
  const hundred = n % 1000
  if (crore) str += threeDigits(crore) + " crore "
  if (lakh) str += threeDigits(lakh) + " lakh "
  if (thousand) str += threeDigits(thousand) + " thousand "
  if (hundred) str += threeDigits(hundred)
  return str.trim()
}

function currency(n: number) {
  return `₹${n.toFixed(2)}`
}

function BillView({ bill }: { bill: Bill }) {
  const gst = bill.totalAfter * 0.18
  const saved = bill.totalBefore - bill.totalAfter
  const amountWords = toWordsIndian(bill.totalAfter) + " rupees only"

  return (
    <>
      <div className="text-center sm:text-left">
        <img src={SALON_INFO.logo} className="h-12 mx-auto sm:mx-0 mb-3" alt="Salon Logo" />
        <h3 className="text-lg font-semibold leading-none tracking-tight">Billing Details</h3>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-emerald-600" />
          <strong>Bill ID:</strong> <span className="break-all">{bill.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-emerald-600" />
          <strong>Date:</strong> {format(new Date(bill.createdAt), "yyyy-MM-dd HH:mm")}
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-emerald-600" />
          <strong>Phones:</strong> {bill.phones.join(", ")}
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-600" />
          <strong>Name:</strong> {bill.billingName || "N/A"}
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <strong>Address:</strong> {bill.billingAddress || "N/A"}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 font-semibold text-gray-900">Services</div>
        <div className="overflow-hidden rounded-xl ring-1 ring-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">Service</th>
                <th className="text-left px-3 py-2 hidden sm:table-cell">Variant</th>
                <th className="text-right px-3 py-2">Actual</th>
                <th className="text-right px-3 py-2">Offer</th>
              </tr>
            </thead>
            <tbody className="[&_tr]:border-t [&_tr]:border-gray-100">
              {bill.items.map((it, idx) => (
                <tr key={idx} className="bg-white">
                  <td className="px-3 py-2">{it.service}</td>
                  <td className="px-3 py-2 hidden sm:table-cell">{it.variant}</td>
                  <td className="px-3 py-2 text-right">{currency(it.amountBefore)}</td>
                  <td className="px-3 py-2 text-right">{currency(it.amountAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:max-w-md sm:ml-auto">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Before</span>
            <span className="font-medium">{currency(bill.totalBefore)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Voucher</span>
            <span className="font-medium">{bill.voucherCode || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment</span>
            <span className="font-medium">{bill.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GST (18%)</span>
            <span className="font-medium">{currency(gst)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-emerald-700">
            <span>Amount After</span>
            <span>{currency(bill.totalAfter)}</span>
          </div>
          <div className="text-center text-emerald-600 font-semibold">
            You saved {currency(saved)}
          </div>
          <div className="text-xs text-gray-500 mt-1 italic text-right">
            Amount in words: {amountWords}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-xs text-center space-y-1 text-gray-600">
          <div>{SALON_INFO.address}</div>
          <div>
            {SALON_INFO.phone} | {SALON_INFO.email}
          </div>
          <div>{SALON_INFO.website}</div>
          <div className="text-[11px] text-gray-400">This is a computer-generated invoice. No signature required.</div>
        </div>
      </div>
    </>
  )
}

export default function BillingHistoryPage() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [bills, setBills] = useState<Bill[]>([])
  const [viewBill, setViewBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  useEffect(() => {
    loadBills()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const showBanner = (type: "success" | "error", msg: string) => {
    setBanner({ type, msg })
    setTimeout(() => setBanner(null), 2600)
  }

  const loadBills = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/billing?date=${date}`)
      if (!res.ok) throw new Error()
      const data: Bill[] = await res.json()
      setBills(data)
    } catch {
      setBills([])
      showBanner("error", "Failed to load bills for the selected date.")
    } finally {
      setLoading(false)
    }
  }

  const printBill = (b: Bill) => {
    const win = window.open("", "print", "height=700,width=520")
    if (!win) return
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${b.id}</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"; color: #111827; margin: 0; padding: 16px; }
          .bill { width: 100%; max-width: 360px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
          .center { text-align: center; }
          .muted { color: #6b7280; }
          .brand { color: #059669; font-weight: 700; }
          .h1 { font-size: 18px; margin: 6px 0 2px; }
          .h2 { font-size: 14px; margin: 0; }
          .row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
          th { text-align: left; color: #6b7280; font-size: 12px; }
          td { font-size: 12px; }
          .total { font-weight: 700; color: #065f46; }
          .save { text-align: center; color: #059669; font-weight: 700; margin-top: 8px; }
          .foot { text-align: center; color: #6b7280; font-size: 11px; margin-top: 12px; }
          img { height: 56px; }
        </style>
      </head>
      <body>
        <div class="bill">
          <div class="center">
            <img src="${SALON_INFO.logo}" alt="${SALON_INFO.name} Logo" />
            <div class="h1 brand">${SALON_INFO.name}</div>
            <div class="h2 muted">${SALON_INFO.address}</div>
            <div class="muted">${SALON_INFO.phone} | ${SALON_INFO.email}</div>
          </div>

          <div class="row"><strong>Bill ID</strong><span>${b.id}</span></div>
          <div class="row"><strong>Date</strong><span>${format(new Date(b.createdAt), "yyyy-MM-dd HH:mm")}</span></div>
          <div class="row"><strong>Customer</strong><span>${b.billingName || "N/A"} (${b.phones.join(", ")})</span></div>
          <div class="row"><strong>Address</strong><span>${b.billingAddress || "N/A"}</span></div>
          <div class="row"><strong>Voucher</strong><span>${b.voucherCode || "N/A"}</span></div>
          <div class="row"><strong>Payment</strong><span>${b.paymentMethod}</span></div>

          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th style="text-align:right;">Actual</th>
                <th style="text-align:right;">Offer</th>
              </tr>
            </thead>
            <tbody>
              ${b.items.map((it) => `
                <tr>
                  <td>${it.service} - ${it.variant}</td>
                  <td style="text-align:right;">₹${it.amountBefore.toFixed(2)}</td>
                  <td style="text-align:right;">₹${it.amountAfter.toFixed(2)}</td>
                </tr>`).join("")}
            </tbody>
          </table>

          <div class="row"><span class="muted">Actual Amount</span><span>₹${b.totalBefore.toFixed(2)}</span></div>
          <div class="row"><span class="muted">GST (18%)</span><span>₹${(b.totalAfter * 0.18).toFixed(2)}</span></div>
          <div class="row total"><span>Net Amount</span><span>₹${b.totalAfter.toFixed(2)}</span></div>

          <div class="save">You saved ₹${(b.totalBefore - b.totalAfter).toFixed(2)}</div>

          <div class="foot">
            Thank you for your visit!<br/>${SALON_INFO.website}<br/>
            <span class="muted">Computer-generated invoice. No signature required.</span>
          </div>
        </div>
        <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 200); };</script>
      </body>
      </html>
    `
    win.document.write(printContent)
    win.document.close()
  }

  const downloadPdf = async (b: Bill) => {
    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib")
    const logoBytes = await fetch(SALON_INFO.logo).then((res) => res.arrayBuffer())

    const pdf = await PDFDocument.create()
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)
    const png = await pdf.embedPng(logoBytes)

    const pageWidth = 595
    const pageHeight = 842
    const margin = 40
    const contentWidth = pageWidth - 2 * margin
    const page = pdf.addPage([pageWidth, pageHeight])

    let y = pageHeight - margin

    const logoDims = png.scale(0.6)
    page.drawImage(png, { x: (pageWidth - logoDims.width) / 2, y: y - logoDims.height, ...logoDims })
    y -= logoDims.height + 10

    page.drawText(SALON_INFO.name, { x: margin, y, size: 20, font: boldFont, color: rgb(0.02, 0.6, 0.39) })
    y -= 18
    page.drawText(SALON_INFO.address, { x: margin, y, size: 10, font, color: rgb(0.45, 0.45, 0.45) })
    y -= 12
    page.drawText(`${SALON_INFO.phone} | ${SALON_INFO.email}`, { x: margin, y, size: 10, font, color: rgb(0.45, 0.45, 0.45) })
    y -= 20

    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0.92, 0.92, 0.92) })
    y -= 20

    const line = (label: string, value: string) => {
      page.drawText(`${label}:`, { x: margin, y, size: 11, font: boldFont, color: rgb(0.2, 0.2, 0.2) })
      page.drawText(value, { x: margin + 90, y, size: 11, font, color: rgb(0.2, 0.2, 0.2) })
      y -= 15
    }

    line("Bill ID", b.id)
    line("Date", format(new Date(b.createdAt), "yyyy-MM-dd HH:mm"))
    line("Customer", `${b.billingName || "N/A"} (${b.phones.join(", ")})`)
    line("Address", b.billingAddress || "N/A")
    line("Voucher", b.voucherCode || "N/A")
    line("Payment", b.paymentMethod)
    y -= 10

    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0.92, 0.92, 0.92) })
    y -= 15

    page.drawText("Services", { x: margin, y, size: 14, font: boldFont, color: rgb(0.02, 0.6, 0.39) })
    y -= 15

    page.drawText("Service", { x: margin, y, size: 11, font: boldFont })
    page.drawText("Actual", { x: margin + contentWidth * 0.55, y, size: 11, font: boldFont })
    page.drawText("Offer", { x: margin + contentWidth * 0.8, y, size: 11, font: boldFont })
    y -= 10
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) })
    y -= 10

    b.items.forEach((it) => {
      page.drawText(`${it.service} - ${it.variant}`, { x: margin, y, size: 10, font })
      page.drawText(`₹${it.amountBefore.toFixed(2)}`, { x: margin + contentWidth * 0.55, y, size: 10, font })
      page.drawText(`₹${it.amountAfter.toFixed(2)}`, { x: margin + contentWidth * 0.8, y, size: 10, font })
      y -= 15
    })

    y -= 10
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) })
    y -= 15

    const gst = b.totalAfter * 0.18
    const drawSummary = (label: string, value: string, total = false) => {
      page.drawText(label, { x: margin + contentWidth * 0.5, y, size: total ? 13 : 11, font: total ? boldFont : font, color: total ? rgb(0.02, 0.6, 0.39) : rgb(0.2, 0.2, 0.2) })
      page.drawText(value, { x: margin + contentWidth * 0.75, y, size: total ? 13 : 11, font: total ? boldFont : font, color: total ? rgb(0.02, 0.6, 0.39) : rgb(0.2, 0.2, 0.2) })
      y -= total ? 20 : 15
    }

    drawSummary("Actual Amount:", `₹${b.totalBefore.toFixed(2)}`)
    drawSummary("GST (18%):", `₹${gst.toFixed(2)}`)
    drawSummary("Net Amount:", `₹${b.totalAfter.toFixed(2)}`, true)

    y -= 8
    page.drawText(`You saved ₹${(b.totalBefore - b.totalAfter).toFixed(2)}`, { x: margin, y, size: 12, font: boldFont, color: rgb(0.02, 0.6, 0.39) })
    y -= 20

    page.drawText("Thank you for your visit!", { x: margin, y, size: 10, font, color: rgb(0.45, 0.45, 0.45) })
    y -= 12
    page.drawText(SALON_INFO.website, { x: margin, y, size: 10, font, color: rgb(0.45, 0.45, 0.45) })

    const blob = new Blob([await pdf.save()], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bill-${b.id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadJpeg = async (b: Bill) => {
    const html2canvas = (await import("html2canvas")).default
    const container = document.createElement("div")
    container.className =
      "relative z-50 w-full max-w-md rounded-lg border bg-white text-black p-6 shadow-lg text-sm"
    container.style.position = "fixed"
    container.style.left = "-10000px"
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(<BillView bill={b} />)
    await new Promise((resolve) => setTimeout(resolve, 120))
    const canvas = await html2canvas(container, { backgroundColor: "#ffffff", scale: 2 })
    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/jpeg", 1)
    link.download = `bill-${b.id}.jpeg`
    link.click()
    root.unmount()
    document.body.removeChild(container)
  }

  const exportCsv = () => {
    if (!bills.length) return
    const header = ["Bill ID", "Date", "Phones", "Name", "Voucher", "Payment", "Items", "Actual", "Net"]
    const rows = bills.map((b) => [
      b.id,
      format(new Date(b.createdAt), "yyyy-MM-dd HH:mm"),
      b.phones.join(" "),
      b.billingName || "",
      b.voucherCode || "",
      b.paymentMethod,
      b.items.length,
      b.totalBefore.toFixed(2),
      b.totalAfter.toFixed(2),
    ])
    const csv = [header, ...rows].map((r) => r.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `billing-${date}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totals = useMemo(() => {
    const revenue = bills.reduce((s, b) => s + b.totalAfter, 0)
    const services = bills.reduce((s, b) => s + b.items.length, 0)
    const gst = revenue * 0.18
    return { revenue, services, gst, count: bills.length }
  }, [bills])

  const setQuick = (daysBack: number) => {
    const d = subDays(new Date(), daysBack)
    setDate(format(d, "yyyy-MM-dd"))
  }

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
                <History className="h-6 w-6" />
                <span className="uppercase tracking-wider text-xs">Finance</span>
              </div>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold">Billing History</h1>
              <p className="mt-2 text-emerald-50 max-w-2xl">
                Review daily transactions, export records, and print customer receipts.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
                <div className="text-xs">Total Revenue</div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  <IndianRupee className="h-5 w-5" /> {totals.revenue.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
                <div className="text-xs">GST (18%)</div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  <IndianRupee className="h-5 w-5" /> {totals.gst.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
                <div className="text-xs">Services</div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  <Scissors className="h-5 w-5" /> {totals.services}
                </div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
                <div className="text-xs">Bills</div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  <ReceiptText className="h-5 w-5" /> {totals.count}
                </div>
              </div>
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
            <div className="flex gap-2">
              <button
                onClick={() => setQuick(0)}
                className="rounded-md border border-white/30 bg-white/10 px-3 h-10 text-sm hover:bg-white/20"
                type="button"
              >
                Today
              </button>
              <button
                onClick={() => setQuick(1)}
                className="rounded-md border border-white/30 bg-white/10 px-3 h-10 text-sm hover:bg-white/20"
                type="button"
              >
                Yesterday
              </button>
          
            </div>

            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 h-10 text-sm hover:bg-white/20"
                title="Export CSV"
              >
                <FileDown className="h-4 w-4" /> Export CSV
              </button>
            </div>
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
        {/* Stats (cards) – already in hero, but keeping a secondary strip optional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          {[
            { title: "Total Revenue", icon: IndianRupee, val: totals.revenue.toFixed(2) },
            { title: "Total GST (18%)", icon: IndianRupee, val: totals.gst.toFixed(2) },
            { title: "Total Services", icon: Scissors, val: totals.services },
            { title: "Bills Generated", icon: ReceiptText, val: totals.count },
          ].map((c, i) => (
            <div key={i} className="rounded-xl border bg-white shadow-sm p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">{c.title}</h3>
                <c.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">{c.val as any}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bills</h2>
              <p className="text-xs text-gray-500">Showing records for <span className="font-medium">{date}</span></p>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Info className="h-4 w-4 text-emerald-600" />
              Click a bill to preview or use actions to print/export.
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
            ) : bills.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <ReceiptText className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-gray-900">No bills for this date</h3>
                <p className="text-sm text-gray-500">Try a different date or refresh.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 text-gray-600 z-10">
                  <tr className="border-b">
                    <th className="h-12 px-4 text-left font-medium">Time</th>
                    <th className="h-12 px-4 text-left font-medium">
                      <div className="flex items-center gap-1"><User className="h-4 w-4" /> Phone / Name</div>
                    </th>
                    <th className="h-12 px-4 text-left font-medium">
                      <div className="flex items-center gap-1"><Tag className="h-4 w-4" /> Voucher</div>
                    </th>
                    <th className="h-12 px-4 text-left font-medium">
                      <div className="flex items-center gap-1"><Wallet className="h-4 w-4" /> Payment</div>
                    </th>
                    <th className="h-12 px-4 text-left font-medium">
                      <div className="flex items-center gap-1"><Scissors className="h-4 w-4" /> Service</div>
                    </th>
                    <th className="h-12 px-4 text-right font-medium">
                      <div className="flex items-center justify-end gap-1"><IndianRupee className="h-4 w-4" /> Actual</div>
                    </th>
                    <th className="h-12 px-4 text-right font-medium">
                      <div className="flex items-center justify-end gap-1"><IndianRupee className="h-4 w-4" /> Net</div>
                    </th>
                    <th className="h-12 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {bills.map((b) => (
                    <tr key={b.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{format(new Date(b.createdAt), "HH:mm")}</td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{b.phones.join(", ")}</div>
                        {b.billingName && <div className="text-xs text-gray-500">{b.billingName}</div>}
                      </td>
                      <td className="p-4">{b.voucherCode || "-"}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs ring-1 ring-emerald-200">
                          {b.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4">
                        {b.items.length === 1
                          ? `${b.items[0].service} - ${b.items[0].variant}`
                          : `${b.items.length} services`}
                      </td>
                      <td className="p-4 text-right">{currency(b.totalBefore)}</td>
                      <td className="p-4 text-right font-semibold text-emerald-700">{currency(b.totalAfter)}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setViewBill(b)}
                          className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-gray-50"
                          title="View"
                        >
                          <Eye className="h-4 w-4" /> View
                        </button>
                        <button
                          type="button"
                          onClick={() => printBill(b)}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 text-white px-2.5 py-1.5 text-xs hover:bg-emerald-700"
                          title="Print"
                        >
                          <Printer className="h-4 w-4" /> Print
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadPdf(b)}
                          className="inline-flex items-center gap-1 rounded-md bg-gray-900 text-white px-2.5 py-1.5 text-xs hover:bg-black/90"
                          title="PDF"
                        >
                          <Download className="h-4 w-4" /> PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadJpeg(b)}
                          className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-gray-50"
                          title="JPEG"
                        >
                          <ImageDown className="h-4 w-4" /> JPEG
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal */}
        {viewBill && (
          <div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setViewBill(null)}
          >
            <div
              className="relative w-full max-w-lg rounded-2xl bg-white text-gray-900 shadow-2xl ring-1 ring-black/5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <ReceiptText className="h-4 w-4 text-emerald-600" />
                  Preview
                </div>
                <button
                  type="button"
                  onClick={() => setViewBill(null)}
                  className="rounded-md p-2 hover:bg-gray-50"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-auto p-5">
                <BillView bill={viewBill} />
              </div>
              <div className="flex items-center justify-end gap-2 p-4 border-t">
                <button
                  type="button"
                  onClick={() => printBill(viewBill)}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700"
                >
                  <Printer className="h-4 w-4" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => downloadPdf(viewBill)}
                  className="inline-flex items-center gap-2 rounded-md bg-gray-900 text-white px-3 py-2 text-sm hover:bg-black/90"
                >
                  <Download className="h-4 w-4" /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => downloadJpeg(viewBill)}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <ImageDown className="h-4 w-4" /> JPEG
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
