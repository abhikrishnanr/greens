'use client'

import { useEffect, useMemo, useState } from 'react'
import WysiwygEditor from '@/app/components/WysiwygEditor'
import {
  Briefcase,
  Info,
  Plus,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

interface Section {
  title: string
  content: string
}

export default function AdminJobsPage() {
  const [pageTitle, setPageTitle] = useState('')
  const [sections, setSections] = useState<Section[]>([{ title: '', content: '' }])
  const [exists, setExists] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const titleMax = 80
  const titleTooLong = pageTitle.length > titleMax

  const showBanner = (type: 'success' | 'error', msg: string) => {
    setBanner({ type, msg })
    setTimeout(() => setBanner(null), 2800)
  }

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/static-pages?slug=jobs')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setPageTitle(data.title || '')
          try {
            const parsed = JSON.parse(data.content || '[]')
            if (Array.isArray(parsed) && parsed.length) setSections(parsed)
          } catch {
            if (data.content) setSections([{ title: '', content: data.content }])
          }
          setExists(true)
        }
      }
    } catch {
      showBanner('error', 'Failed to load page data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const addSection = () => setSections((prev) => [...prev, { title: '', content: '' }])

  const updateSection = (idx: number, field: keyof Section, value: string) => {
    setSections((prev) => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], [field]: value }
      return copy
    })
  }

  const removeSection = (idx: number) =>
    setSections((prev) => prev.filter((_, i) => i !== idx))

  const moveSection = (idx: number, dir: 'up' | 'down') => {
    setSections((prev) => {
      const copy = [...prev]
      const newIdx = dir === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= copy.length) return copy
      const tmp = copy[idx]
      copy[idx] = copy[newIdx]
      copy[newIdx] = tmp
      return copy
    })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pageTitle.trim() || titleTooLong) return
    try {
      setSaving(true)
      const method = exists ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/static-pages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'jobs',
          title: pageTitle.trim(),
          content: JSON.stringify(sections),
        }),
      })
      if (!res.ok) throw new Error()
      setExists(true)
      showBanner('success', 'Jobs page saved.')
    } catch {
      showBanner('error', 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const totalWords = useMemo(() => {
    const t = sections.map((s) => s.content || '').join(' ')
    return t.trim().split(/\s+/).filter(Boolean).length
  }, [sections])

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 sm:p-8 shadow-lg">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-100">
              <Briefcase className="h-6 w-6" />
              <span className="uppercase tracking-wider text-xs">Careers</span>
            </div>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white">Jobs @ Greens</h1>
            <p className="mt-2 max-w-2xl text-emerald-50">
              Build a compelling careers page with clear roles, culture notes, and hiring FAQs.
            </p>
          </div>
          <div className="flex gap-3 text-white/90">
            <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
              <div className="text-xs">Sections</div>
              <div className="text-2xl font-bold">{sections.length}</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
              <div className="text-xs">Total Words</div>
              <div className="text-2xl font-bold">{totalWords}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Banners */}
      {banner && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            banner.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
          role="status"
        >
          {banner.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span>{banner.msg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={save} className="mt-6 rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-4 sm:px-6 py-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Page Settings</h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Page title */}
          <div>
            <label htmlFor="page-title" className="block text-sm font-medium text-gray-700">
              Page Title
            </label>
            <input
              id="page-title"
              className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 ${
                titleTooLong ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-emerald-200'
              }`}
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="Join the Greens Team"
              required
              maxLength={120}
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <p className="flex items-center gap-1 text-gray-500">
                <Info className="h-3.5 w-3.5" />
                Keep it concise and inspiring. You can edit anytime.
              </p>
              <span className={`${titleTooLong ? 'text-red-600' : 'text-gray-400'}`}>
                {pageTitle.length}/{titleMax}
              </span>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-5">
            {sections.map((sec, idx) => (
              <article key={idx} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <header className="flex items-center justify-between gap-3 border-b px-4 sm:px-6 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Section {idx + 1}</h3>
                    <p className="text-xs text-gray-500">Title &amp; rich content</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveSection(idx, 'up')}
                      className="rounded-lg border px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                      disabled={idx === 0}
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(idx, 'down')}
                      className="rounded-lg border px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                      disabled={idx === sections.length - 1}
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(idx)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                        title="Remove section"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    )}
                  </div>
                </header>

                <div className="px-4 sm:px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Section Title</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-emerald-200"
                      value={sec.title}
                      onChange={(e) => updateSection(idx, 'title', e.target.value)}
                      placeholder="Open Roles"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <div className="mt-1 rounded-lg border border-gray-300 p-2 focus-within:ring-2 focus-within:ring-emerald-200">
                      <WysiwygEditor
                        value={sec.content}
                        onChange={(v) => updateSection(idx, 'content', v)}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Tip: Include role lists, application steps, benefits, or hiring FAQs.
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={addSection}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 transition hover:bg-emerald-100"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </button>

            <div className="ml-auto" />

            <button
              type="submit"
              disabled={!pageTitle.trim() || titleTooLong || saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-disabled={!pageTitle.trim() || titleTooLong || saving}
            >
              <Save className="h-4 w-4" />
              Save Page
            </button>
          </div>
        </div>
      </form>

      {/* Footer tips */}
      <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div>
            <h4 className="font-semibold text-gray-900">Content suggestions</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
              <li><span className="font-medium">Open Positions:</span> role, location, type, quick apply link.</li>
              <li><span className="font-medium">Life at Greens:</span> culture, values, growth opportunities.</li>
              <li><span className="font-medium">Hiring Process:</span> steps, timelines, interview tips.</li>
              <li><span className="font-medium">Perks & Benefits:</span> leave policy, training, rewards.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {loading && (
        <div className="fixed inset-0 z-[60] bg-black/5 backdrop-blur-[1px]" aria-hidden="true">
          <div className="pointer-events-none fixed inset-x-0 top-4 mx-auto w-full max-w-sm rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 animate-spin text-gray-700" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"></path>
              </svg>
              <span className="text-sm text-gray-800">Loading content…</span>
            </div>
          </div>
        </div>
      )}
      {saving && (
        <div className="fixed inset-0 z-[60] bg-black/10 backdrop-blur-[1px]" aria-hidden="true">
          <div className="pointer-events-none fixed inset-x-0 top-4 mx-auto w-full max-w-sm rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 animate-spin text-emerald-600" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"></path>
              </svg>
              <span className="text-sm text-gray-800">Saving…</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
