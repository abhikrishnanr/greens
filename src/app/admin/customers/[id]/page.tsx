import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  UserIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  ClockIcon,
  CreditCardIcon,
  ScissorsIcon,
  PlusIcon,
  HistoryIcon,
  ReceiptIcon,
  IndianRupeeIcon,
} from "lucide-react"

interface BookingHistory {
  id: string
  date: string
  start: string
  items: { name: string }[]
}

interface BillingHistory {
  id: string
  service: string
  variant: string
  scheduledAt: string
  amountAfter: number
}

interface Customer {
  id: string
  name: string | null
  phone: string | null
  email?: string | null
  gender?: string | null
}

// Helper function to format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  } catch {
    return dateString
  }
}

// Helper function to format time
function formatTime(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  } catch {
    return timeString
  }
}

export default async function CustomerProfile({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const apiUrl = new URL(`/api/customers/${id}`, base)
  const res = await fetch(apiUrl, { cache: "no-store" })

  if (res.status === 404) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <UserIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Customer not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!res.ok) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <UserIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Failed to load customer</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { user, billingHistory, scheduleHistory } = (await res.json()) as {
    user: Customer | null
    billingHistory: BillingHistory[]
    scheduleHistory: BookingHistory[]
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <UserIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Customer not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate summary statistics
  const totalServices = scheduleHistory.reduce((acc, booking) => acc + booking.items.length, 0)
  const totalBillPaid = billingHistory.reduce((acc, bill) => acc + bill.amountAfter, 0)
  const totalVisits = scheduleHistory.length

  // Gender-based styling
  const isMale = user.gender?.toLowerCase() === "male"
  const isFemale = user.gender?.toLowerCase() === "female"

  const bgClass = isMale
    ? "bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200"
    : isFemale
      ? "bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200"
      : "bg-gray-50"

  const avatarClass = isMale
    ? "bg-gradient-to-br from-blue-500 to-blue-600"
    : isFemale
      ? "bg-gradient-to-br from-pink-500 to-pink-600"
      : "bg-gradient-to-br from-gray-500 to-gray-600"

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div
              className={`w-24 h-24 ${avatarClass} rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg`}
            >
              <UserIcon className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.name}</h1>
          <p className="text-gray-600">Customer Profile</p>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-700 mb-1">{totalVisits}</div>
              <p className="text-blue-600 font-medium">Total Visits</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ScissorsIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-700 mb-1">{totalServices}</div>
              <p className="text-purple-600 font-medium">Services Taken</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <IndianRupeeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-700 mb-1">₹{totalBillPaid.toLocaleString()}</div>
              <p className="text-green-600 font-medium">Total Paid</p>
            </CardContent>
          </Card>
        </div>

        {/* Customer Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0">
                  <PhoneIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                  <p className="font-semibold text-gray-900 truncate">{user.phone}</p>
                </div>
              </div>

              {user.email && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0">
                    <MailIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="font-semibold text-gray-900 truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0">
                  <UserIcon
                    className={`h-5 w-5 ${isMale ? "text-blue-600" : isFemale ? "text-pink-600" : "text-purple-600"}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500 mb-1">Gender</p>
                  <Badge
                    variant="secondary"
                    className={`font-medium capitalize ${
                      isMale
                        ? "bg-blue-100 text-blue-800"
                        : isFemale
                          ? "bg-pink-100 text-pink-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.gender}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="pt-6">
              <div className="flex justify-center">
                <Button
                  asChild
                  className={`w-full max-w-sm h-12 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${
                    isMale
                      ? "bg-blue-600 hover:bg-blue-700"
                      : isFemale
                        ? "bg-pink-600 hover:bg-pink-700"
                        : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  <Link
                    href={`/admin/walk-in?name=${encodeURIComponent(user.name ?? "")}&phone=${user.phone ?? ""}&gender=${user.gender ?? ""}`}
                  >
                   
                    Book New Service
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Section - Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Schedule History */}
          <Card className="h-fit bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <HistoryIcon className="h-5 w-5 text-orange-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Schedule History</CardTitle>
                <Badge variant="outline" className="ml-auto">
                  {scheduleHistory.length} visits
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {scheduleHistory.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No schedule history found.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scheduleHistory.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors shadow-sm"
                    >
                      <div className="p-2 bg-orange-100 rounded-full mt-1 shadow-sm">
                        <ScissorsIcon className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
                            <CalendarIcon className="h-4 w-4 text-orange-600" />
                            <span className="font-semibold text-gray-900 text-sm">{formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
                            <ClockIcon className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-gray-700 text-sm">{formatTime(booking.start)}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {booking.items.map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-white">
                              {item.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card className="h-fit bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <ReceiptIcon className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Billing History</CardTitle>
                <Badge variant="outline" className="ml-auto">
                  ₹{totalBillPaid.toLocaleString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {billingHistory.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No billing history found.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {billingHistory.map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-full mt-1 shadow-sm">
                          <CreditCardIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900 text-sm">{bill.service}</span>
                            <Badge variant="secondary" className="text-xs">
                              {bill.variant}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full shadow-sm">
                            <CalendarIcon className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-gray-600 font-medium">
                              {formatDate(new Date(bill.scheduledAt).toISOString().split("T")[0])}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">₹{bill.amountAfter}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
