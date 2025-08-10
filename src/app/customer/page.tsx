'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import {
  Calendar,
  Download,
  FileText,
  PlusCircle,
  Printer,
  Hash,
  Phone as PhoneIcon,
  User as UserIcon,
  MapPin,
  IndianRupee,
  X,
  MessageCircle,
} from 'lucide-react'
import Header from '@/components/Header'

interface Schedule {
  id: string
  date: string
  service: string
}

interface Bill {
  id: string
  date: string
  amount: number
}

interface BillDetail {
  id: string
  billingName: string | null
  billingAddress: string | null
  voucherCode: string | null
  paymentMethod: string
  paidAt: string | null
  createdAt: string
  phones: string[]
  items: {
    service: string
    variant: string
    amountBefore: number
    amountAfter: number
  }[]
  totalBefore: number
  totalAfter: number
}

interface Enquiry {
  id: string
  enquiry: string
  status: string
  remark: string
}

const SALON_INFO = {
  name: 'Greens Beauty Salon',
  logo: '/logo.png',
  address: 'TC 45/215, Kunjalumood Junction, Karamana PO, Trivandrum',
  phone: '+91 8891 467678',
  email: 'greensalon@gmail.com',
  website: 'https://greensbeautysalon.com',
}

export default function CustomerDashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [viewBill, setViewBill] = useState<BillDetail | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    fetch('/api/customer/schedules')
      .then((r) => r.json())
      .then((d) => {
        const today = new Date().toLocaleDateString('en-CA', {
          timeZone: 'Asia/Kolkata',
        })
        const upcoming = (d.schedules ?? []).filter((s: Schedule) => s.date >= today)
        setSchedules(upcoming)
      })
      .catch(() => setSchedules([]))
    fetch('/api/customer/bills')
      .then((r) => r.json())
      .then((d) => setBills(d.bills ?? []))
      .catch(() => setBills([]))
    fetch('/api/customer/enquiries')
      .then((r) => r.json())
      .then((d) => setEnquiries(d.enquiries ?? []))
      .catch(() => setEnquiries([]))
  }, [])

  const totalServices = bills.length
  const totalPaid = bills.reduce((sum, b) => sum + b.amount, 0)

  const handleView = async (id: string) => {
    const res = await fetch(`/api/customer/bills/${id}`)
    const data = await res.json()
    if (data.bill) setViewBill(data.bill)
  }

  const handleDownload = async (id: string) => {
    const res = await fetch(`/api/customer/bills/${id}`)
    const data = await res.json()
    if (data.bill) await downloadPdf(data.bill)
  }

  const printBill = (b: BillDetail) => {
    const win = window.open("", "print", "height=600,width=400")
    if (!win) return
    const itemsRows = b.items
      .map(
        (it) => `\n                <tr>\n                  <td>${it.service} - ${it.variant}</td>\n                  <td>₹${it.amountBefore.toFixed(2)}</td>\n                  <td>₹${it.amountAfter.toFixed(2)}</td>\n                </tr>`
      )
      .join("")
    win.document.write(`<!DOCTYPE html><html><head><title>Bill - ${b.id}</title><style>body{font-family:'Arial',sans-serif;margin:0;padding:20px;color:#333;font-size:12px}.bill-container{width:100%;max-width:300px;margin:0 auto;border:1px solid #eee;padding:20px;box-shadow:0 0 10px rgba(0,0,0,0.05)}.header{text-align:center;margin-bottom:20px}.header img{height:60px;margin-bottom:10px}.header h1{font-size:18px;margin:0;color:#e75480}.header p{margin:2px 0;font-size:10px}.section-title{font-weight:bold;margin-top:15px;margin-bottom:5px;border-bottom:1px dashed #ccc;padding-bottom:5px}.items-table{width:100%;border-collapse:collapse;margin-top:15px}.items-table th,.items-table td{border-bottom:1px solid #eee;padding:8px 0;text-align:left}.items-table th{background-color:#f9f9f9}.items-table td:nth-child(2),.items-table td:nth-child(3),.items-table th:nth-child(2),.items-table th:nth-child(3){text-align:right}.summary{margin-top:20px;border-top:1px dashed #ccc;padding-top:10px}.summary p{display:flex;justify-content:space-between;margin:5px 0}.summary .total{font-weight:bold;font-size:14px;color:#e75480}.savings{text-align:center;font-weight:bold;font-size:16px;margin-top:10px;color:#2e7d32}.footer{text-align:center;margin-top:30px;font-size:10px;color:#777}</style></head><body><div class="bill-container"><div class="header"><img src="${SALON_INFO.logo}" alt="${SALON_INFO.name} Logo" /><h1>${SALON_INFO.name}</h1><p>${SALON_INFO.address}</p><p>${SALON_INFO.phone} | ${SALON_INFO.email}</p></div><p><strong>Bill ID:</strong> ${b.id}</p><p><strong>Date:</strong> ${format(new Date(b.createdAt), 'yyyy-MM-dd HH:mm')}</p><p><strong>Customer:</strong> ${b.billingName || 'N/A'} (${b.phones.join(', ')})</p><p><strong>Address:</strong> ${b.billingAddress || 'N/A'}</p><p><strong>Voucher:</strong> ${b.voucherCode || 'N/A'}</p><p><strong>Payment Method:</strong> ${b.paymentMethod}</p><div class="section-title">Services</div><table class="items-table"><thead><tr><th>Service</th><th>Actual</th><th>Offer</th></tr></thead><tbody>${itemsRows}</tbody></table><div class="summary"><p><span>Actual Amount:</span><span>₹${b.totalBefore.toFixed(2)}</span></p><p><span>GST (18%):</span><span>₹${(b.totalAfter * 0.18).toFixed(2)}</span></p><p class="total"><span>Net Amount:</span><span>₹${b.totalAfter.toFixed(2)}</span></p></div><div class="savings">You saved Rs ${(b.totalBefore - b.totalAfter).toFixed(2)} on offer</div><div class="footer"><p>Thank you for your visit!</p><p>${SALON_INFO.website}</p></div></div></body></html>`)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  const downloadPdf = async (b: BillDetail) => {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
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
    page.drawText(SALON_INFO.name, { x: margin, y, size: 20, font: boldFont, color: rgb(0.9, 0.3, 0.5) })
    y -= 18
    page.drawText(SALON_INFO.address, { x: margin, y, size: 10, font, color: rgb(0.5, 0.5, 0.5) })
    y -= 12
    page.drawText(`${SALON_INFO.phone} | ${SALON_INFO.email}`, { x: margin, y, size: 10, font, color: rgb(0.5, 0.5, 0.5) })
    y -= 20
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0.9, 0.9, 0.9) })
    y -= 20
    const drawDetail = (label: string, value: string, currentY: number) => {
      page.drawText(`${label}:`, { x: margin, y: currentY, size: 11, font: boldFont, color: rgb(0.3, 0.3, 0.3) })
      page.drawText(value, { x: margin + 80, y: currentY, size: 11, font, color: rgb(0.3, 0.3, 0.3) })
      return currentY - 15
    }
    y = drawDetail('Bill ID', b.id, y)
    y = drawDetail('Date', format(new Date(b.createdAt), 'yyyy-MM-dd HH:mm'), y)
    y = drawDetail('Customer', `${b.billingName || 'N/A'} (${b.phones.join(', ')})`, y)
    y = drawDetail('Address', b.billingAddress || 'N/A', y)
    y = drawDetail('Voucher', b.voucherCode || 'N/A', y)
    y = drawDetail('Payment', b.paymentMethod, y)
    y -= 20
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0.9, 0.9, 0.9) })
    y -= 15
    page.drawText('Services', { x: margin, y, size: 14, font: boldFont, color: rgb(0.9, 0.3, 0.5) })
    y -= 15
    page.drawText('Service', { x: margin, y, size: 11, font: boldFont })
    page.drawText('Actual', { x: margin + contentWidth * 0.55, y, size: 11, font: boldFont })
    page.drawText('Offer', { x: margin + contentWidth * 0.8, y, size: 11, font: boldFont })
    y -= 10
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) })
    y -= 10
    b.items.forEach((it) => {
      page.drawText(`${it.service} - ${it.variant}`, { x: margin, y, size: 10, font })
      page.drawText(`Rs ${it.amountBefore.toFixed(2)}`, { x: margin + contentWidth * 0.55, y, size: 10, font })
      page.drawText(`Rs ${it.amountAfter.toFixed(2)}`, { x: margin + contentWidth * 0.8, y, size: 10, font })
      y -= 15
    })
    y -= 10
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) })
    y -= 15
    const drawSummaryLine = (label: string, value: string, currentY: number, isTotal = false) => {
      page.drawText(label, { x: margin + contentWidth * 0.5, y: currentY, size: isTotal ? 13 : 11, font: isTotal ? boldFont : font, color: isTotal ? rgb(0.9, 0.3, 0.5) : rgb(0.3, 0.3, 0.3) })
      page.drawText(value, { x: margin + contentWidth * 0.75, y: currentY, size: isTotal ? 13 : 11, font: isTotal ? boldFont : font, color: isTotal ? rgb(0.9, 0.3, 0.5) : rgb(0.3, 0.3, 0.3) })
      return currentY - (isTotal ? 20 : 15)
    }
    y = drawSummaryLine('Actual Amount:', `Rs ${b.totalBefore.toFixed(2)}`, y)
    y = drawSummaryLine('GST (18%):', `Rs ${(b.totalAfter * 0.18).toFixed(2)}`, y)
    y = drawSummaryLine('Net Amount:', `Rs ${b.totalAfter.toFixed(2)}`, y, true)
    y -= 10
    page.drawText(`You saved Rs ${(b.totalBefore - b.totalAfter).toFixed(2)} on offer`, { x: margin, y, size: 16, font: boldFont, color: rgb(0.2, 0.6, 0.2) })
    y -= 30
    page.drawText('Thank you for your visit!', { x: margin, y, size: 10, font, color: rgb(0.5, 0.5, 0.5) })
    y -= 12
    page.drawText(SALON_INFO.website, { x: margin, y, size: 10, font, color: rgb(0.5, 0.5, 0.5) })
    const blob = new Blob([await pdf.save()], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bill-${b.id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <Header />
      <div className="max-w-5xl mx-auto space-y-8 p-8">
        <div className="flex flex-col items-center gap-4">
          {session?.user && (
            <>
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'avatar'}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl">
                  {session.user.name?.[0] || 'U'}
                </div>
              )}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-emerald-900">{session.user.name}</h1>
                <p className="text-emerald-700">{session.user.gender}</p>
                <p className="text-emerald-700">{session.user.phone}</p>
              </div>
            </>
          )}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="text-emerald-900 text-2xl font-bold">{totalServices}</p>
              <p className="text-emerald-700">Services Taken</p>
            </div>
            <div className="text-center">
              <p className="text-emerald-900 text-2xl font-bold">₹{totalPaid}</p>
              <p className="text-emerald-700">Total Paid</p>
            </div>
          </div>
        </div>
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/70 backdrop-blur rounded-xl shadow-lg p-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-emerald-900 mb-4">
              <Calendar className="text-emerald-600" /> Upcoming Schedules
            </h2>
            <ul className="space-y-3">
              {schedules.length ? (
                schedules.map((s) => (
                  <li key={s.id} className="flex justify-between items-center">
                    <span>
                      {s.date} - {s.service}
                    </span>
                    <Link
                      href={`/customer/schedule/${s.id}`}
                      className="text-emerald-600 hover:underline"
                    >
                      View
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-emerald-700">No schedules yet.</li>
              )}
            </ul>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl shadow-lg p-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-emerald-900 mb-4">
              <FileText className="text-emerald-600" /> Billing History
            </h2>
            <ul className="space-y-3">
              {bills.length ? (
                bills.map((b) => (
                  <li key={b.id} className="flex justify-between items-center">
                    <span>
                      {b.date} - ₹{b.amount}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(b.id)}
                        className="text-emerald-600 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(b.id)}
                        className="text-emerald-600 hover:underline flex items-center"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-emerald-700">No bills yet.</li>
              )}
            </ul>
          </div>
        </section>
        <section className="bg-white/70 backdrop-blur rounded-xl shadow-lg p-6">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-emerald-900 mb-4">
            <MessageCircle className="text-emerald-600" /> My Enquiries
          </h2>
          <ul className="space-y-3">
            {enquiries.length ? (
              enquiries.map((e) => (
                <li key={e.id}>
                  <p className="font-medium">{e.enquiry}</p>
                  <p className="text-sm text-emerald-700">
                    Status: {e.status}{e.remark ? ` - Reply: ${e.remark}` : ''}
                  </p>
                </li>
              ))
            ) : (
              <li className="text-emerald-700">No enquiries yet.</li>
            )}
          </ul>
        </section>
        <div className="text-center">
          <Link
            href={`/book-appointment?name=${encodeURIComponent(session?.user?.name || '')}&phone=${session?.user?.phone || ''}&gender=${session?.user?.gender || ''}`}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow hover:bg-emerald-700"
          >
            <PlusCircle /> New Booking
          </Link>
        </div>
      </div>
      {viewBill && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setViewBill(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-lg overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Billing Details</h3>
              <button onClick={() => setViewBill(null)} className="text-gray-600 hover:text-gray-800">
                <X />
              </button>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-emerald-600" />
                <strong>Bill ID:</strong> {viewBill.id}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <strong>Date:</strong> {format(new Date(viewBill.createdAt), 'yyyy-MM-dd HH:mm')}
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-emerald-600" />
                <strong>Phones:</strong> {viewBill.phones.join(', ')}
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-emerald-600" />
                <strong>Name:</strong> {viewBill.billingName || 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <strong>Address:</strong> {viewBill.billingAddress || 'N/A'}
              </div>
              <div className="mt-4 mb-2 font-semibold text-foreground">Services:</div>
              <table className="w-full text-sm mb-2">
                <thead>
                  <tr>
                    <th className="text-left">Service</th>
                    <th className="text-right">Actual</th>
                    <th className="text-right">Offer</th>
                  </tr>
                </thead>
                <tbody>
                  {viewBill.items.map((it, idx) => (
                    <tr key={idx}>
                      <td>{it.service} - {it.variant}</td>
                      <td className="text-right">
                        <IndianRupee className="inline-block h-3 w-3 mr-0.5" />
                        {it.amountBefore.toFixed(2)}
                      </td>
                      <td className="text-right">
                        <IndianRupee className="inline-block h-3 w-3 mr-0.5" />
                        {it.amountAfter.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between items-center">
                  <strong>Amount Before:</strong>
                  <span className="font-medium text-foreground">
                    <IndianRupee className="inline-block h-3 w-3 mr-0.5" />
                    {viewBill.totalBefore.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <strong>Voucher:</strong> {viewBill.voucherCode || 'N/A'}
                </div>
                <div className="flex justify-between items-center">
                  <strong>Payment:</strong> {viewBill.paymentMethod}
                </div>
                <div className="flex justify-between items-center">
                  <strong>GST (18%):</strong>
                  <span className="font-medium text-foreground">
                    <IndianRupee className="inline-block h-3 w-3 mr-0.5" />
                    {(viewBill.totalAfter * 0.18).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-emerald-700">
                  <strong>Amount After:</strong>
                  <span>
                    <IndianRupee className="inline-block h-4 w-4 mr-0.5" />
                    {viewBill.totalAfter.toFixed(2)}
                  </span>
                </div>
                <div className="text-center text-lg font-bold text-green-600 mt-4">
                  You saved Rs {(viewBill.totalBefore - viewBill.totalAfter).toFixed(2)} on offer
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => printBill(viewBill)}
                className="flex items-center gap-1 px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Printer className="h-4 w-4" /> Print
              </button>
              <button
                onClick={() => downloadPdf(viewBill)}
                className="flex items-center gap-1 px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Download className="h-4 w-4" /> Download
              </button>
              <button
                onClick={() => setViewBill(null)}
                className="px-4 py-2 rounded border"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
