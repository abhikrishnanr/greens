"use client"

import { useEffect, useState } from "react"
import { Tag, Plus, Pencil, Trash2, Check, X } from "lucide-react"

interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: "percent" | "fixed"
  discountValue: number
  startDate: string
  endDate: string
  minAmount: number | null
  maxRedemptions: number | null
  timesUsed: number
  isActive: boolean
}

const empty = {
  code: "",
  description: "",
  discountType: "percent" as "percent" | "fixed",
  discountValue: "",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxRedemptions: "",
  isActive: true,
}

function toLocalInput(iso?: string) {
  if (!iso) return ""
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16)
}

export default function CouponsAdmin() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [form, setForm] = useState<typeof empty>(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const notify = (type: "success" | "error", msg: string) => {
    setBanner({ type, msg })
    setTimeout(() => setBanner(null), 4000)
  }

  const load = async () => {
    const res = await fetch("/api/admin/coupons")
    if (res.ok) setCoupons((await res.json()).coupons)
  }
  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setForm(empty)
    setEditingId(null)
  }

  const startEdit = (c: Coupon) => {
    setEditingId(c.id)
    setForm({
      code: c.code,
      description: c.description ?? "",
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      startDate: toLocalInput(c.startDate),
      endDate: toLocalInput(c.endDate),
      minAmount: c.minAmount != null ? String(c.minAmount) : "",
      maxRedemptions: c.maxRedemptions != null ? String(c.maxRedemptions) : "",
      isActive: c.isActive,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const submit = async () => {
    setLoading(true)
    try {
      const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons"
      const method = editingId ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        notify("error", body?.error || "Could not save coupon")
        return
      }
      notify("success", editingId ? "Coupon updated" : "Coupon created")
      resetForm()
      load()
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (c: Coupon) => {
    const res = await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    })
    if (res.ok) {
      notify("success", `Coupon ${!c.isActive ? "activated" : "deactivated"}`)
      load()
    }
  }

  const remove = async (c: Coupon) => {
    if (!window.confirm(`Delete coupon "${c.code}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" })
    if (res.ok) {
      notify("success", "Coupon deleted")
      load()
    } else {
      notify("error", "Could not delete coupon")
    }
  }

  const fmt = (iso: string) => new Date(iso).toLocaleDateString()
  const isExpired = (c: Coupon) => new Date(c.endDate) < new Date()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Tag className="h-6 w-6 text-emerald-600" />
        <h1 className="text-2xl font-bold">Coupons</h1>
      </div>

      {banner && (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            banner.type === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          }`}
        >
          {banner.msg}
        </div>
      )}

      {/* Create / edit form */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-800">
          {editingId ? "Edit coupon" : "Create a coupon"}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Code *</span>
            <input
              className="w-full rounded-lg border px-3 py-2 uppercase"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="WELCOME10"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Discount type *</span>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value as "percent" | "fixed" })}
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount (₹)</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">
              Discount value * {form.discountType === "percent" ? "(%)" : "(₹)"}
            </span>
            <input
              type="number"
              min="0"
              className="w-full rounded-lg border px-3 py-2"
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Valid from *</span>
            <input
              type="datetime-local"
              className="w-full rounded-lg border px-3 py-2"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Valid until *</span>
            <input
              type="datetime-local"
              className="w-full rounded-lg border px-3 py-2"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Min. order amount (₹)</span>
            <input
              type="number"
              min="0"
              className="w-full rounded-lg border px-3 py-2"
              value={form.minAmount}
              onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
              placeholder="optional"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Max redemptions</span>
            <input
              type="number"
              min="0"
              className="w-full rounded-lg border px-3 py-2"
              value={form.maxRedemptions}
              onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
              placeholder="unlimited"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Description</span>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Shown internally"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span className="font-medium">Active</span>
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={submit}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> {editingId ? "Save changes" : "Create coupon"}
          </button>
          {editingId && (
            <button onClick={resetForm} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Validity</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No coupons yet. Create your first one above.
                </td>
              </tr>
            )}
            {coupons.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3 font-semibold">{c.code}</td>
                <td className="px-4 py-3">
                  {c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  {c.minAmount ? <span className="text-gray-400"> · min ₹{c.minAmount}</span> : null}
                </td>
                <td className="px-4 py-3">
                  {fmt(c.startDate)} – {fmt(c.endDate)}
                </td>
                <td className="px-4 py-3">
                  {c.timesUsed}
                  {c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ""}
                </td>
                <td className="px-4 py-3">
                  {isExpired(c) ? (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Expired</span>
                  ) : c.isActive ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Active</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => toggleActive(c)}
                      title={c.isActive ? "Deactivate" : "Activate"}
                      className="rounded p-1.5 hover:bg-gray-100"
                    >
                      {c.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button onClick={() => startEdit(c)} title="Edit" className="rounded p-1.5 hover:bg-gray-100">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(c)}
                      title="Delete"
                      className="rounded p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
