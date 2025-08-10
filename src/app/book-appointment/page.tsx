"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Select, { type MultiValue } from "react-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Save,
  User,
  Phone as PhoneIcon,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react"
import DatePicker from "react-datepicker"
import { format, isToday, setHours, setMinutes } from "date-fns"


interface VariantOption {
  id: string
  categoryName: string
  serviceName: string
  variantName: string
}

interface FormState {
  name: string
  phone: string
  gender: string
  enquiry: string
  variantIds: string[]
  preferredDate: Date | null
  preferredTime: Date | null
}

export default function BookAppointmentPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    gender: "",
    enquiry: "",
    variantIds: [] as string[],
    preferredDate: null,
    preferredTime: null,
  })

  const [variants, setVariants] = useState<VariantOption[]>([])
  const [submitted, setSubmitted] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: session.user.name || "",
        phone: session.user.phone || "",
        gender: session.user.gender || "",
      }))
    }
  }, [session])

  useEffect(() => {
    if (!form.gender) {
      setVariants([])
      setForm((prev) => ({ ...prev, variantIds: [] }))
      return
    }
    fetch(`/api/admin/service-variants/all?gender=${form.gender}`)
      .then((res) => res.json())
      .then((data) => setVariants(data))
  }, [form.gender])

  const now = new Date()
  const isDateToday = form.preferredDate ? isToday(form.preferredDate) : false
  const startTime = setHours(setMinutes(new Date(), 0), 9)
  const endTime = setHours(setMinutes(new Date(), 30), 20)
  const minTime = isDateToday && now > startTime ? now : startTime
  const maxTime = endTime

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      preferredDate: form.preferredDate
        ? format(form.preferredDate, "yyyy-MM-dd")
        : "",
      preferredTime: form.preferredTime
        ? format(form.preferredTime, "HH:mm")
        : "",
    }

    const res = await fetch("/api/web-enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setSubmitted(true)
      setForm({
        name: "",
        phone: "",
        gender: "",
        enquiry: "",
        variantIds: [],
        preferredDate: null,
        preferredTime: null,
      })

    }
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="flex items-center justify-center text-3xl font-bold text-green-700 mb-8">
          <Calendar className="h-8 w-8 mr-2 text-green-600" /> Book an Appointment
        </h1>
        {submitted ? (
          <div className="max-w-xl mx-auto text-center p-6 bg-green-50 border border-green-200 rounded-lg shadow">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-green-700 mb-4">Thank you! We will contact you shortly.</p>
            <Link href="/" className="text-green-600 hover:underline">
              Go back to Home
            </Link>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="max-w-xl mx-auto space-y-6 bg-green-50 p-6 border border-green-200 rounded-lg shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-1">
                  <User className="h-4 w-4" /> Name
                </Label>
                <Input
                  id="name"
                  className="mt-1"
                  placeholder="Your full name"

                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <PhoneIcon className="h-4 w-4" /> Mobile Number
                </Label>
                <Input
                  id="phone"
                  className="mt-1"
                  placeholder="10-digit number"

                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">We&apos;ll never share your number.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="children">Children</option>
                </select>
              </div>
              <div>
                <Label htmlFor="preferredDate" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Preferred Date
                </Label>
                <DatePicker
                  id="preferredDate"
                  selected={form.preferredDate}
                  onChange={(date) => setForm({ ...form, preferredDate: date })}
                  minDate={new Date()}
                  placeholderText="Select date"
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <Label htmlFor="preferredTime" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Preferred Time
                </Label>
                <DatePicker
                  id="preferredTime"
                  selected={form.preferredTime}
                  onChange={(date) => setForm({ ...form, preferredTime: date })}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="HH:mm"
                  minTime={minTime}
                  maxTime={maxTime}
                  placeholderText="Select time"
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                />
              </div>

            </div>
            <div>
              <Label>Customer Enquiry</Label>
              <Textarea
                className="mt-1"
                placeholder="Tell us about your needs"
                value={form.enquiry}
                onChange={(e) => setForm({ ...form, enquiry: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Any specific requests or questions?</p>

            </div>
            <div>
              <Label>Services Interested In</Label>
              <Select
                isMulti
                className="mt-1 text-sm"
                classNamePrefix="select"
                options={variants.map((v) => ({
                  value: v.id,
                  label: `${v.categoryName} - ${v.serviceName} (${v.variantName})`,
                }))}
                value={variants
                  .filter((v) => form.variantIds.includes(v.id))
                  .map((v) => ({
                    value: v.id,
                    label: `${v.categoryName} - ${v.serviceName} (${v.variantName})`,
                  }))}
                onChange={(vals: MultiValue<{ value: string; label: string }>) =>
                  setForm({ ...form, variantIds: vals.map((v) => v.value) })
                }
                placeholder="Select services"

              />
              <p className="text-xs text-gray-500 mt-1">You can select multiple services.</p>
            </div>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              <Save className="h-4 w-4 mr-1" /> Submit
            </Button>
          </form>
        )}
      </div>
      <Footer />
    </main>
  )
}

