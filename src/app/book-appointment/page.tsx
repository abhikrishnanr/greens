"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Select, { type MultiValue } from "react-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save, User, Phone as PhoneIcon, Calendar, Clock } from "lucide-react"

interface VariantOption {
  id: string
  categoryName: string
  serviceName: string
  variantName: string
}

export default function BookAppointmentPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    enquiry: "",
    variantIds: [] as string[],
    preferredDate: "",
    preferredTime: "",
  })
  const [variants, setVariants] = useState<VariantOption[]>([])
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch("/api/admin/service-variants/all")
      .then((res) => res.json())
      .then((data) => setVariants(data))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/web-enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setSubmitted(true)
      setForm({
        name: "",
        phone: "",
        gender: "",
        enquiry: "",
        variantIds: [],
        preferredDate: "",
        preferredTime: "",
      })
    }
  }

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-8">Book an Appointment</h1>
        {submitted ? (
          <div className="max-w-xl mx-auto text-center p-6 bg-white border rounded-lg shadow">
            <p className="text-green-600 mb-4">Thank you! We will contact you shortly.</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Go back to Home
            </Link>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="max-w-xl mx-auto space-y-6 bg-white p-6 border rounded-lg shadow"
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
                <p className="text-xs text-gray-500 mt-1">We'll never share your number.</p>
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
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="preferredDate" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Preferred Date
                </Label>
                <Input
                  type="date"
                  id="preferredDate"
                  className="mt-1"
                  value={form.preferredDate}
                  onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="preferredTime" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Preferred Time
                </Label>
                <Input
                  type="time"
                  id="preferredTime"
                  className="mt-1"
                  value={form.preferredTime}
                  onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
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

