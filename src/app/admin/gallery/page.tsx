'use client'

import { useEffect, useState } from 'react'

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

  const load = async () => {
    const res = await fetch('/api/admin/galleries')
    const data = await res.json()
    setGalleries(data)
  }

  useEffect(() => {
    load()
  }, [])

  const addGallery = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin/galleries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    })
    setTitle('')
    load()
  }

  const deleteGallery = async (id: string) => {
    if (!confirm('Delete this gallery?')) return
    await fetch('/api/admin/galleries', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    load()
  }

  const handlePhoto = async (
    e: React.ChangeEvent<HTMLInputElement>,
    galleryId: string
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const up = await fetch('/api/upload', { method: 'POST', body: fd })
      const { url } = await up.json()
      await fetch('/api/admin/gallery-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryId, imageUrl: url })
      })
    }
    e.target.value = ''
    load()
  }

  const deletePhoto = async (id: string) => {
    await fetch('/api/admin/gallery-images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    load()
  }

  const movePhoto = async (id: string, galleryId: string) => {
    await fetch('/api/admin/gallery-images', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, galleryId })
    })
    load()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Gallery</h1>
      <form onSubmit={addGallery} className="flex gap-2 mb-6">
        <input className="flex-1 p-2 rounded border" value={title} onChange={e => setTitle(e.target.value)} placeholder="New gallery title" required />
        <button className="bg-green-600 px-4 py-2 rounded text-white" type="submit">Add</button>
      </form>
      <div className="space-y-8">
        {galleries.map(g => (
          <div key={g.id} className="bg-white p-4 rounded shadow border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{g.title}</h2>
              <button className="text-red-600" onClick={() => deleteGallery(g.id)}>Delete</button>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Add Photo</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => handlePhoto(e, g.id)}
              />
            </div>
            {g.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {g.images.map(img => (
                  <div key={img.id} className="relative group">
                    <img src={img.imageUrl} alt="" className="w-full h-32 object-cover rounded" />
                    <button className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded" onClick={() => deletePhoto(img.id)}>X</button>
                    <select value={g.id} onChange={e => movePhoto(img.id, e.target.value)} className="mt-1 w-full text-sm border rounded">
                      {galleries.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.title}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
