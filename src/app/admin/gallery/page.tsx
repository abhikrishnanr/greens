'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Images,
  Plus,
  Info,
  Upload,
  ImagePlus,
  Trash2,
  MoveRight,
  CheckCircle2,
  XCircle,
  FolderPlus,
  Copy,
} from 'lucide-react'

interface Image {
  id: string
  imageUrl: string
  galleryId: string
}

interface Gallery {
  id: string
  title: string
  images: Image[]
}

export default function GalleryAdminPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [dragActiveGallery, setDragActiveGallery] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const titleMax = 60
  const titleChars = title.length
  const titleTooLong = titleChars > titleMax

  const totalImages = useMemo(
    () => galleries.reduce((acc, g) => acc + (g.images?.length || 0), 0),
    [galleries]
  )

  const showBanner = (type: 'success' | 'error', msg: string) => {
    setBanner({ type, msg })
    setTimeout(() => setBanner(null), 3000)
  }

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/galleries')
      const data = await res.json()
      setGalleries(Array.isArray(data) ? data : [])
    } catch (e) {
      showBanner('error', 'Failed to load galleries.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const addGallery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || titleTooLong) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      })
      if (!res.ok) throw new Error()
      setTitle('')
      showBanner('success', 'Gallery created successfully.')
      await load()
    } catch (e) {
      showBanner('error', 'Could not create gallery.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteGallery = async (id: string, name: string) => {
    if (!confirm(`Delete the gallery "${name}"? This will remove all its photos.`)) return
    try {
      const res = await fetch('/api/admin/galleries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      showBanner('success', 'Gallery deleted.')
      await load()
    } catch {
      showBanner('error', 'Failed to delete gallery.')
    }
  }

  const uploadAndAttach = async (file: File, galleryId: string) => {
    const fd = new FormData()
    fd.append('file', file)
    const up = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!up.ok) throw new Error('Upload failed')
    const { url } = await up.json()
    const link = await fetch('/api/admin/gallery-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ galleryId, imageUrl: url }),
    })
    if (!link.ok) throw new Error('Attach failed')
  }

  const handlePhoto = async (
    e: React.ChangeEvent<HTMLInputElement>,
    galleryId: string
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    try {
      setSubmitting(true)
      for (const file of Array.from(files)) {
        await uploadAndAttach(file, galleryId)
      }
      showBanner('success', 'Photo(s) added.')
      await load()
    } catch {
      showBanner('error', 'Could not add photo(s).')
    } finally {
      setSubmitting(false)
      e.target.value = ''
    }
  }

  const handleDrop = async (ev: React.DragEvent<HTMLLabelElement>, galleryId: string) => {
    ev.preventDefault()
    ev.stopPropagation()
    setDragActiveGallery(null)
    const dt = ev.dataTransfer
    const files = dt?.files
    if (!files || files.length === 0) return
    try {
      setSubmitting(true)
      for (const file of Array.from(files)) {
        await uploadAndAttach(file, galleryId)
      }
      showBanner('success', 'Photo(s) added via drag & drop.')
      await load()
    } catch {
      showBanner('error', 'Upload failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const deletePhoto = async (id: string) => {
    try {
      const res = await fetch('/api/admin/gallery-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      showBanner('success', 'Photo removed.')
      await load()
    } catch {
      showBanner('error', 'Failed to remove photo.')
    }
  }

  const movePhoto = async (id: string, galleryId: string) => {
    try {
      const res = await fetch('/api/admin/gallery-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, galleryId }),
      })
      if (!res.ok) throw new Error()
      showBanner('success', 'Photo moved.')
      await load()
    } catch {
      showBanner('error', 'Failed to move photo.')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showBanner('success', 'Image URL copied.')
    } catch {
      showBanner('error', 'Copy failed.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero / Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 sm:p-8 shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
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
              <Images className="h-6 w-6" />
              <span className="uppercase tracking-wider text-xs">Media</span>
            </div>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white">
              Gallery Manager
            </h1>
            <p className="mt-2 max-w-2xl text-emerald-50">
              Create galleries, upload photos, and organize visuals effortlessly.
              Drag &amp; drop supported. Crisp previews. Zero guesswork.
            </p>
          </div>
          <div className="flex gap-3 text-white/90">
            <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
              <div className="text-xs">Galleries</div>
              <div className="text-2xl font-bold">{galleries.length}</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
              <div className="text-xs">Total Images</div>
              <div className="text-2xl font-bold">{totalImages}</div>
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
          {banner.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span>{banner.msg}</span>
        </div>
      )}

      {/* Create Gallery */}
      <section className="mt-6">
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-4 sm:px-6 py-4 flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">Create a new gallery</h2>
          </div>
          <form onSubmit={addGallery} className="p-4 sm:p-6">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label htmlFor="gallery-title" className="block text-sm font-medium text-gray-700">
                  Gallery title
                </label>
                <input
                  id="gallery-title"
                  className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 ${
                    titleTooLong
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-emerald-200'
                  }`}
                  placeholder="e.g., Bridal Looks • May 2025"
                  value={title}
                  maxLength={120}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <div className="mt-1 flex items-center justify-between text-xs">
                  <p className="flex items-center gap-1 text-gray-500">
                    <Info className="h-3.5 w-3.5" />
                    Keep it short and descriptive. You can rename later.
                  </p>
                  <span className={`${
                      titleTooLong ? 'text-red-600' : 'text-gray-400'
                    }`}
                  >
                    {titleChars}/{titleMax}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={!title.trim() || titleTooLong || submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-disabled={!title.trim() || titleTooLong || submitting}
              >
                <Plus className="h-4 w-4" />
                Add Gallery
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Galleries */}
      <section className="mt-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border bg-white p-6 shadow-sm">
                <div className="h-5 w-40 rounded bg-gray-200" />
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="h-24 rounded bg-gray-200" />
                  <div className="h-24 rounded bg-gray-200" />
                  <div className="h-24 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : galleries.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <Images className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No galleries yet</h3>
            <p className="mt-1 text-gray-500">
              Create your first gallery to start showcasing your work.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {galleries.map((g) => (
              <article key={g.id} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <header className="flex items-center justify-between gap-3 border-b px-4 sm:px-6 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{g.title}</h3>
                    <p className="text-xs text-gray-500">{g.images?.length || 0} photo(s)</p>
                  </div>
                  <button
                    onClick={() => deleteGallery(g.id, g.title)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                    title="Delete gallery"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </header>

                {/* Uploader */}
                <div className="px-4 sm:px-6 py-5">
                  <label
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragActiveGallery(g.id)
                    }}
                    onDragLeave={() => setDragActiveGallery(null)}
                    onDrop={(e) => handleDrop(e, g.id)}
                    className={`group relative block cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
                      dragActiveGallery === g.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhoto(e, g.id)}
                      className="sr-only"
                    />
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                      <Upload className="h-6 w-6 text-emerald-700" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-900">
                      Drag &amp; drop images here, or <span className="text-emerald-700 underline">click to upload</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG, or WEBP. Up to ~10MB each for smooth uploads.
                    </p>
                  </label>
                </div>

                {/* Images grid */}
                {g.images?.length ? (
                  <div className="px-4 sm:px-6 pb-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {g.images.map((img) => (
                        <div key={img.id} className="group relative">
                          <img
                            src={img.imageUrl}
                            alt=""
                            className="h-32 w-full rounded-xl object-cover ring-1 ring-gray-200"
                          />

                          {/* Hover controls */}
                          <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/0 transition group-hover:bg-black/30" />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button
                              onClick={() => deletePhoto(img.id)}
                              className="pointer-events-auto inline-flex items-center justify-center rounded-md bg-red-600/90 p-1.5 text-white shadow hover:bg-red-700"
                              title="Delete photo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => copyToClipboard(img.imageUrl)}
                              className="pointer-events-auto inline-flex items-center justify-center rounded-md bg-white/90 p-1.5 text-gray-800 shadow hover:bg-white"
                              title="Copy image URL"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Move control */}
                          <div className="absolute inset-x-2 bottom-2 pointer-events-auto">
                            <div className="rounded-lg bg-white/95 px-2 py-1.5 shadow ring-1 ring-gray-200">
                              <div className="flex items-center gap-2">
                                <MoveRight className="h-4 w-4 text-gray-500" />
                                <select
                                  value={img.galleryId}
                                  onChange={(e) => movePhoto(img.id, e.target.value)}
                                  className="w-full bg-transparent text-xs text-gray-700 outline-none"
                                  title="Move photo to another gallery"
                                >
                                  {galleries.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                      {opt.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 sm:px-6 pb-6">
                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <ImagePlus className="h-5 w-5 text-gray-600" />
                      </div>
                      <p className="mt-2 text-sm text-gray-700">No photos yet</p>
                      <p className="text-xs text-gray-500">Upload a few to see them here.</p>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer helper tips */}
      <div className="mt-10 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div>
            <h4 className="font-semibold text-gray-900">Pro tips</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
              <li>Use short, meaningful gallery names (e.g., “Bridal • May 2025”).</li>
              <li>Drag &amp; drop multiple images at once for faster uploads.</li>
              <li>Use the “Move” control on each photo to reorganize quickly.</li>
              <li>Click the copy icon to grab a photo URL for sharing or embedding.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Global busy overlay (simple) */}
      {submitting && (
        <div className="fixed inset-0 z-[60] bg-black/10 backdrop-blur-[1px]" aria-hidden="true">
          <div className="pointer-events-none fixed inset-x-0 top-4 mx-auto w-full max-w-sm rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 animate-spin text-emerald-600" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"></path>
              </svg>
              <span className="text-sm text-gray-800">Processing…</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
