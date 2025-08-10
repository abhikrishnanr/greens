"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Select, { type MultiValue, type StylesConfig } from "react-select"
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
  ArrowRight,
  Wand2
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
    variantIds: [],
    preferredDate: null,
    preferredTime: null,
  })

  const [variants, setVariants] = useState<VariantOption[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setForm((prev) => ({
      ...prev,
      name: params.get("name") || "",
      phone: params.get("phone") || "",
      gender: params.get("gender") || "",
    }))
  }, [])

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || (session.user as any).name || "",
        phone: prev.phone || ((session.user as any).phone || ""),
        gender: prev.gender || ((session.user as any).gender || ""),
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
      .catch(() => setVariants([]))
  }, [form.gender])

  const now = new Date()
  const isDateToday = form.preferredDate ? isToday(form.preferredDate) : false
  const startTime = setHours(setMinutes(new Date(), 0), 9)
  const endTime = setHours(setMinutes(new Date(), 30), 20)
  const minTime = isDateToday && now > startTime ? now : startTime
  const maxTime = endTime

  // Dark emerald react-select styling (placeholders gray, text light)
  const selectStyles = useMemo<StylesConfig<any, true>>(
    () => ({
      control: (base, state) => ({
        ...base,
        backgroundColor: "rgba(6,78,59,0.55)", // emerald-800/55
        borderColor: state.isFocused ? "#34D399" : "rgba(16,185,129,0.35)", // emerald-400 / emerald-500/35
        boxShadow: "none",
        ":hover": { borderColor: "#34D399" },
        minHeight: 46,
        color: "#ECFDF5", // emerald-50
        borderRadius: 10,
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: "#064E3B", // emerald-900
        border: "1px solid rgba(16,185,129,0.35)",
        overflow: "hidden",
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "rgba(16,185,129,0.35)"
          : state.isFocused
          ? "rgba(16,185,129,0.18)"
          : "transparent",
        color: "#ECFDF5",
        cursor: "pointer",
      }),
      multiValue: (base) => ({ ...base, backgroundColor: "rgba(16,185,129,0.25)" }),
      multiValueLabel: (base) => ({ ...base, color: "#ECFDF5" }),
      multiValueRemove: (base) => ({
        ...base,
        color: "#10B981", // emerald-500
        ":hover": { backgroundColor: "rgba(16,185,129,0.25)", color: "#ECFDF5" },
      }),
      input: (base) => ({ ...base, color: "#ECFDF5" }),
      placeholder: (base) => ({ ...base, color: "#9CA3AF" /* gray-400 */ }),
      singleValue: (base) => ({ ...base, color: "#ECFDF5" }),
    }),
    []
  )

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    const payload = {
      ...form,
      preferredDate: form.preferredDate ? format(form.preferredDate, "yyyy-MM-dd") : "",
      preferredTime: form.preferredTime ? format(form.preferredTime, "HH:mm") : null,
    }

    try {
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
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex flex-col min-h-screen bg-emerald-950 text-emerald-50 overflow-x-hidden">
      <Header />

      {/* top padding so we never sit under the fixed header */}
      <div className="pt-24 md:pt-28" />

      {/* soft animated background accents — wrapped by overflow-x-hidden above to avoid horizontal scroll */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl animate-pulse" />

      <div className="flex-1 container mx-auto px-4 pb-12 md:pb-16 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center text-2xl md:text-3xl font-bold text-emerald-100"
        >
          <Calendar className="h-7 w-7 md:h-8 md:w-8 mr-2 text-emerald-400" />
          Book an Appointment
        </motion.h1>
        <p className="text-center text-emerald-200/85 mt-2 mb-10">
          Pick your preferences below — we’ll confirm your slot shortly.
        </p>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="max-w-2xl md:max-w-3xl mx-auto text-center p-6 md:p-8 rounded-2xl border border-emerald-700/50 bg-gradient-to-b from-emerald-900/70 to-emerald-900/30 backdrop-blur shadow-[0_20px_60px_-20px_rgba(16,185,129,0.25)]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 16 }}
                className="mx-auto mb-4 grid place-items-center h-16 w-16 rounded-full bg-emerald-600/20 border border-emerald-500"
              >
                <CheckCircle className="h-9 w-9 text-emerald-400" />
              </motion.div>
              <h2 className="text-xl font-semibold text-emerald-50 mb-2">Thank you! 🎉</h2>
              <p className="text-emerald-200/90">We’ve received your request and will reach out to confirm.</p>

              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-500/70 px-4 py-2 hover:bg-emerald-800/40 transition"
                >
                  Back to Home
                </Link>
                <Link
                  href="/#featured"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition"
                >
                  Explore Services <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl md:max-w-3xl mx-auto space-y-8 rounded-2xl border border-emerald-700/50 bg-gradient-to-b from-emerald-900/70 to-emerald-900/30 backdrop-blur p-6 md:p-10 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.25)]"
            >
              {/* Pro tip */}
              <div className="flex items-center gap-2 text-emerald-100/90 text-sm bg-emerald-900/50 border border-emerald-700/60 rounded-xl px-3 py-2">
                <Wand2 className="h-4 w-4 text-emerald-400" />
                Tip: <span className="ml-1 font-medium text-emerald-300">Select your gender</span> to load available services. Time slot is optional.
              </div>

              {/* Details */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-emerald-300/90 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Your Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-1 text-emerald-100">
                      <User className="h-4 w-4 text-emerald-400" /> Name
                    </Label>
                    <Input
                      id="name"
                      className="mt-1 h-11 bg-emerald-950/40 border-emerald-700 text-emerald-50 placeholder:text-gray-400 focus:ring-emerald-500"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-1 text-emerald-100">
                      <PhoneIcon className="h-4 w-4 text-emerald-400" /> Mobile Number
                    </Label>
                    <Input
                      id="phone"
                      className="mt-1 h-11 bg-emerald-950/40 border-emerald-700 text-emerald-50 placeholder:text-gray-400 focus:ring-emerald-500"
                      placeholder="10-digit number"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                      }
                      required
                    />
                    <p className="text-xs text-emerald-200/70 mt-1">We’ll never share your number.</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-emerald-700/40 to-transparent" />

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-emerald-300/90 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <Label htmlFor="gender" className="text-emerald-100">Gender</Label>
                    <select
                      id="gender"
                      className="w-full mt-1 h-11 p-2 rounded-md bg-emerald-950/40 border border-emerald-700 text-emerald-50 focus:ring-emerald-500"
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
                    <Label htmlFor="preferredDate" className="flex items-center gap-1 text-emerald-100">
                      <Calendar className="h-4 w-4 text-emerald-400" /> Preferred Date
                    </Label>
                    <DatePicker
                      id="preferredDate"
                      selected={form.preferredDate}
                      onChange={(date) => setForm({ ...form, preferredDate: date })}
                      minDate={new Date()}
                      placeholderText="Select date"
                      className="w-full mt-1 h-11 p-2 rounded-md bg-emerald-950/40 border border-emerald-700 text-emerald-50 placeholder:text-gray-400 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredTime" className="flex items-center gap-1 text-emerald-100">
                      <Clock className="h-4 w-4 text-emerald-400" /> Preferred Time
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
                      className="w-full mt-1 h-11 p-2 rounded-md bg-emerald-950/40 border border-emerald-700 text-emerald-50 placeholder:text-gray-400 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-emerald-700/40 to-transparent" />

              {/* Services & Notes */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-emerald-300/90 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Services & Notes
                </h3>

                <div>
                  <Label className="text-emerald-100">Services Interested In (optional)</Label>
                  <Select
                    isMulti
                    className="mt-1 text-sm"
                    classNamePrefix="select"
                    styles={selectStyles}
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
                  <p className="text-xs text-emerald-200/70 mt-1">You can select multiple services.</p>
                </div>

                <div>
                  <Label className="text-emerald-100">Customer Enquiry</Label>
                  <Textarea
                    className="mt-1 bg-emerald-950/40 border-emerald-700 text-black placeholder:text-gray-400 focus:ring-emerald-500 min-h-[120px]"
                    placeholder="Tell us about your needs"
                    value={form.enquiry}
                    onChange={(e) => setForm({ ...form, enquiry: e.target.value })}
                  />
                  <p className="text-xs text-emerald-200/70 mt-1">Any specific requests or questions?</p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold rounded-full transition-all bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                      Submitting…
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Save className="h-4 w-4" /> Submit
                    </span>
                  )}
                </Button>
              </div>

              <p className="text-center text-xs text-emerald-200/60">
                We’ll confirm availability by call or WhatsApp. No charges for rescheduling.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  )
}
