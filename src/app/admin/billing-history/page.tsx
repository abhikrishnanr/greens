"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  History,
  Calendar,
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
} from "lucide-react"

const SALON_INFO = {
  name: "Greens Beauty Salon",
  logo: "/placeholder.svg?height=50&width=50&text=Logo", // Using placeholder for logo
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

export default function BillingHistoryPage() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [bills, setBills] = useState<Bill[]>([])
  const [viewBill, setViewBill] = useState<Bill | null>(null)

  useEffect(() => {
    loadBills()
  }, [date])

  const loadBills = async () => {
    const res = await fetch(`/api/billing?date=${date}`)
    if (res.ok) {
      const data: Bill[] = await res.json()
      setBills(data)
    } else {
      setBills([])
    }
  }

  const printBill = (b: Bill) => {
    const win = window.open("", "print", "height=600,width=400")
    if (!win) return

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${b.id}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            font-size: 12px;
          }
          .bill-container {
            width: 100%;
            max-width: 300px;
            margin: 0 auto;
            border: 1px solid #eee;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.05);
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            height: 60px;
            margin-bottom: 10px;
          }
          .header h1 {
            font-size: 18px;
            margin: 0;
            color: #e75480; /* Primary color */
          }
          .header p {
            margin: 2px 0;
            font-size: 10px;
          }
          .section-title {
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 5px;
            border-bottom: 1px dashed #ccc;
            padding-bottom: 5px;
          }
          .details p {
            margin: 2px 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          .items-table th, .items-table td {
            border-bottom: 1px solid #eee;
            padding: 8px 0;
            text-align: left;
          }
          .items-table th {
            font-weight: bold;
            background-color: #f9f9f9;
          }
          .items-table td:last-child, .items-table th:last-child {
            text-align: right;
          }
          .summary {
            margin-top: 20px;
            border-top: 1px dashed #ccc;
            padding-top: 10px;
          }
          .summary p {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .summary .total {
            font-weight: bold;
            font-size: 14px;
            color: #e75480; /* Primary color */
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 10px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="bill-container">
          <div class="header">
            <img src="${SALON_INFO.logo}" alt="${SALON_INFO.name} Logo" />
            <h1>${SALON_INFO.name}</h1>
            <p>${SALON_INFO.address}</p>
            <p>${SALON_INFO.phone} | ${SALON_INFO.email}</p>
          </div>

          <div class="details">
            <p><strong>Bill ID:</strong> ${b.id}</p>
            <p><strong>Date:</strong> ${format(new Date(b.createdAt), "yyyy-MM-dd HH:mm")}</p>
            <p><strong>Customer:</strong> ${b.billingName || "N/A"} (${b.phones.join(", ")})</p>
            <p><strong>Address:</strong> ${b.billingAddress || "N/A"}</p>
            <p><strong>Voucher:</strong> ${b.voucherCode || "N/A"}</p>
            <p><strong>Payment Method:</strong> ${b.paymentMethod}</p>
          </div>

          <div class="section-title">Services</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Variant</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${b.items
                .map(
                  (it) => `
                <tr>
                  <td>${it.service}</td>
                  <td>${it.variant}</td>
                  <td>₹${it.amountAfter.toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="summary">
            <p><span>Actual Amount:</span> <span>₹${b.totalBefore.toFixed(2)}</span></p>
            <p><span>GST (18%):</span> <span>₹${(b.totalAfter * 0.18).toFixed(2)}</span></p>
            <p class="total"><span>Net Amount:</span> <span>₹${b.totalAfter.toFixed(2)}</span></p>
          </div>

          <div class="footer">
            <p>Thank you for your visit!</p>
            <p>${SALON_INFO.website}</p>
          </div>
        </div>
      </body>
      </html>
    `
    win.document.write(printContent)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  const downloadPdf = async (b: Bill) => {
    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib")
    const fontkit = (await import("@pdf-lib/fontkit")).default
    const fontBytes = await fetch("/fonts/NotoSans-Regular.ttf").then((res) => res.arrayBuffer())
    const logoBytes = await fetch(SALON_INFO.logo).then((res) => res.arrayBuffer())

    const pdf = await PDFDocument.create()
    pdf.registerFontkit(fontkit)
    const font = await pdf.embedFont(fontBytes)
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)
    const png = await pdf.embedPng(logoBytes)

    const pageWidth = 595
    const pageHeight = 842
    const margin = 40
    const contentWidth = pageWidth - 2 * margin
    const page = pdf.addPage([pageWidth, pageHeight])

    let y = pageHeight - margin

    // Header (Logo and Salon Info)
    const logoDims = png.scale(0.6)
    page.drawImage(png, { x: (pageWidth - logoDims.width) / 2, y: y - logoDims.height, ...logoDims })
    y -= logoDims.height + 10

    page.drawText(SALON_INFO.name, { x: margin, y, size: 20, font: boldFont, color: rgb(0.9, 0.3, 0.5) }) // Primary color
    y -= 18
    page.drawText(SALON_INFO.address, { x: margin, y, size: 10, font, color: rgb(0.5, 0.5, 0.5) })
    y -= 12
    page.drawText(`${SALON_INFO.phone} | ${SALON_INFO.email}`, {
      x: margin,
      y,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
    y -= 20

    // Bill Details
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    })
    y -= 20

    const drawDetail = (label: string, value: string, currentY: number) => {
      page.drawText(`${label}:`, { x: margin, y: currentY, size: 11, font: boldFont, color: rgb(0.3, 0.3, 0.3) })
      page.drawText(value, { x: margin + 80, y: currentY, size: 11, font, color: rgb(0.3, 0.3, 0.3) })
      return currentY - 15
    }

    y = drawDetail("Bill ID", b.id, y)
    y = drawDetail("Date", format(new Date(b.createdAt), "yyyy-MM-dd HH:mm"), y)
    y = drawDetail("Customer", `${b.billingName || "N/A"} (${b.phones.join(", ")})`, y)
    y = drawDetail("Address", b.billingAddress || "N/A", y)
    y = drawDetail("Voucher", b.voucherCode || "N/A", y)
    y = drawDetail("Payment", b.paymentMethod, y)
    y -= 20

    // Services Table
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    })
    y -= 15

    page.drawText("Services", { x: margin, y, size: 14, font: boldFont, color: rgb(0.9, 0.3, 0.5) }) // Primary color
    y -= 15

    // Table Headers
    page.drawText("Service", { x: margin, y, size: 11, font: boldFont })
    page.drawText("Variant", { x: margin + contentWidth * 0.4, y, size: 11, font: boldFont })
    page.drawText("Amount", { x: margin + contentWidth * 0.75, y, size: 11, font: boldFont })
    y -= 10
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    })
    y -= 10

    // Table Rows
    b.items.forEach((it) => {
      page.drawText(it.service, { x: margin, y, size: 10, font })
      page.drawText(it.variant, { x: margin + contentWidth * 0.4, y, size: 10, font })
      page.drawText(`₹${it.amountAfter.toFixed(2)}`, { x: margin + contentWidth * 0.75, y, size: 10, font })
      y -= 15
    })

    y -= 10
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    })
    y -= 15

    // Summary
    const drawSummaryLine = (label: string, value: string, currentY: number, isTotal = false) => {
      page.drawText(label, {
        x: margin + contentWidth * 0.5,
        y: currentY,
        size: isTotal ? 13 : 11,
        font: isTotal ? boldFont : font,
        color: isTotal ? rgb(0.9, 0.3, 0.5) : rgb(0.3, 0.3, 0.3),
      })
      page.drawText(value, {
        x: margin + contentWidth * 0.75,
        y: currentY,
        size: isTotal ? 13 : 11,
        font: isTotal ? boldFont : font,
        color: isTotal ? rgb(0.9, 0.3, 0.5) : rgb(0.3, 0.3, 0.3),
      })
      return currentY - (isTotal ? 20 : 15)
    }

    y = drawSummaryLine("Actual Amount:", `₹${b.totalBefore.toFixed(2)}`, y)
    y = drawSummaryLine("GST (18%):", `₹${(b.totalAfter * 0.18).toFixed(2)}`, y)
    y = drawSummaryLine("Net Amount:", `₹${b.totalAfter.toFixed(2)}`, y, true)

    // Footer
    y -= 30
    page.drawText("Thank you for your visit!", { x: margin, y, size: 10, font, color: rgb(0.5, 0.5, 0.5) })
    y -= 12
    page.drawText(SALON_INFO.website, { x: margin, y, size: 10, font, color: rgb(0.5, 0.5, 0.5) })

    const blob = new Blob([await pdf.save()], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bill-${b.id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white text-foreground">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <History className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Billing History</h1>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <label
            htmlFor="date-input"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Date
          </label>
          <input
            id="date-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-[200px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
            <div className="flex flex-col space-y-1.5 pb-2">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Total Revenue</h3>
            </div>
            <div className="text-3xl font-bold flex items-center gap-2 text-primary">
              <IndianRupee className="h-6 w-6" />
              {bills.reduce((s, b) => s + b.totalAfter, 0).toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
            <div className="flex flex-col space-y-1.5 pb-2">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Total GST (18%)</h3>
            </div>
            <div className="text-3xl font-bold flex items-center gap-2 text-primary">
              <IndianRupee className="h-6 w-6" />
              {(bills.reduce((s, b) => s + b.totalAfter, 0) * 0.18).toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
            <div className="flex flex-col space-y-1.5 pb-2">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Total Services</h3>
            </div>
            <div className="text-3xl font-bold flex items-center gap-2 text-primary">
              <Scissors className="h-6 w-6" />
              {bills.reduce((s, b) => s + b.items.length, 0)}
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
            <div className="flex flex-col space-y-1.5 pb-2">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Bills Generated</h3>
            </div>
            <div className="text-3xl font-bold flex items-center gap-2 text-primary">
              <ReceiptText className="h-6 w-6" />
              {bills.length}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
          <div className="flex flex-col space-y-1.5 pb-4">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">Bills</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Time
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" /> Phone/Name
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4" /> Voucher
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    <div className="flex items-center gap-1">
                      <Wallet className="h-4 w-4" /> Payment
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    <div className="flex items-center gap-1">
                      <Scissors className="h-4 w-4" /> Service
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <IndianRupee className="h-4 w-4" /> Actual
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <IndianRupee className="h-4 w-4" /> Net
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {bills.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      {format(new Date(b.createdAt), "HH:mm")}
                    </td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      {b.phones.join(", ")}
                      {b.billingName ? ` - ${b.billingName}` : ""}
                    </td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{b.voucherCode || "-"}</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{b.paymentMethod}</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      {b.items.length === 1
                        ? `${b.items[0].service} - ${b.items[0].variant}`
                        : `${b.items.length} services`}
                    </td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
                      ₹{b.totalBefore.toFixed(2)}
                    </td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
                      ₹{b.totalAfter.toFixed(2)}
                    </td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 space-x-2 text-right">
                      <button
                        type="button"
                        onClick={() => setViewBill(b)}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => printBill(b)}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                      >
                        <Printer className="h-4 w-4 mr-1" /> Print
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadPdf(b)}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-3"
                      >
                        <Download className="h-4 w-4 mr-1" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dialog for View Bill */}
        {viewBill && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setViewBill(null)}
          >
            <div
              className="relative z-50 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={SALON_INFO.logo || "/placeholder.svg"} className="h-12 mx-auto my-4" alt="Salon Logo" />
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <h3 className="text-lg font-semibold leading-none tracking-tight">Billing Details</h3>
              </div>
              <div className="p-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  <strong>Bill ID:</strong> {viewBill.id}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <strong>Date:</strong> {format(new Date(viewBill.createdAt), "yyyy-MM-dd HH:mm")}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <strong>Phones:</strong> {viewBill.phones.join(", ")}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <strong>Name:</strong> {viewBill.billingName || "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <strong>Address:</strong> {viewBill.billingAddress || "N/A"}
                </div>
                <div className="mt-4 mb-2 font-semibold text-foreground">Services:</div>
                <ul className="list-disc pl-5 space-y-1">
                  {viewBill.items.map((it, idx) => (
                    <li key={idx} className="flex justify-between items-center">
                      <span>
                        {it.service} - {it.variant}
                      </span>
                      <span className="font-medium text-foreground">
                        <IndianRupee className="inline-block h-3 w-3 mr-0.5" />
                        {it.amountAfter.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong>Amount Before:</strong>{" "}
                    <span className="font-medium text-foreground">
                      <IndianRupee className="inline-block h-3 w-3 mr-0.5" />
                      {viewBill.totalBefore.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <strong>Voucher:</strong> {viewBill.voucherCode || "N/A"}
                  </div>
                  <div className="flex justify-between items-center">
                    <strong>Payment:</strong> {viewBill.paymentMethod}
                  </div>
                  <div className="flex justify-between items-center">
                    <strong>GST (18%):</strong>{" "}
                    <span className="font-medium text-foreground">
                      <IndianRupee className="inline-block h-3 w-3 mr-0.5" />
                      {(viewBill.totalAfter * 0.18).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-primary">
                    <strong>Amount After:</strong>{" "}
                    <span>
                      <IndianRupee className="inline-block h-4 w-4 mr-0.5" />
                      {viewBill.totalAfter.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border text-xs text-center space-y-1">
                  <div>{SALON_INFO.address}</div>
                  <div>
                    {SALON_INFO.phone} | {SALON_INFO.email}
                  </div>
                  <div>{SALON_INFO.website}</div>
                </div>
              </div>
              <div className="flex justify-end p-4">
                <button
                  type="button"
                  onClick={() => setViewBill(null)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Close
                </button>
              </div>
              <button
                type="button"
                onClick={() => setViewBill(null)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
