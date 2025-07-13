'use client'
import { useEffect, useState } from 'react'
import WysiwygEditor from '@/app/components/WysiwygEditor'

interface Category {
  id: string
  name: string
}

interface Tier {
  id: string
  name: string
  actualPrice: number
  offerPrice?: number | null
  duration?: number | null
}

interface Image {
  id: string
  imageUrl: string
  caption?: string | null
}

interface Service {
  id: string
  name: string
  caption?: string | null
  description?: string | null
  imageUrl?: string | null
  tiers: Tier[]
}

export default function ServicesAdmin() {
  const [categories, setCategories] = useState<Category[]>([])
  const [category, setCategory] = useState('')
  const [services, setServices] = useState<Service[]>([])

  const emptyService: Partial<Service> = { id: '', name: '', caption: '', description: '', imageUrl: '' }
  const [serviceForm, setServiceForm] = useState<Partial<Service>>(emptyService)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState(false)

  const handleServiceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setServiceForm({ ...serviceForm, imageUrl: data.url })
  }

  const emptyTier: Partial<Tier> = { id: '', name: '', actualPrice: 0, offerPrice: null, duration: null }
  const [tiers, setTiers] = useState<Tier[]>([])
  const [tierForm, setTierForm] = useState<Partial<Tier>>(emptyTier)
  const [showTierModal, setShowTierModal] = useState(false)
  const [editingTier, setEditingTier] = useState(false)
  const [tierServiceId, setTierServiceId] = useState('')

  const emptyImage: Partial<Image> = { id: '', imageUrl: '', caption: '' }
  const [images, setImages] = useState<Image[]>([])
  const [imageForm, setImageForm] = useState<Partial<Image>>(emptyImage)
  const [showImageModal, setShowImageModal] = useState(false)
  const [editingImage, setEditingImage] = useState(false)
  const [imageServiceId, setImageServiceId] = useState('')


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setImageForm({ ...imageForm, imageUrl: data.url })
  }


  const loadCategories = async () => {
    const res = await fetch('/api/admin/service-categories')
    const data = await res.json()
    setCategories(data)
  }

  const loadServices = async () => {
    if (!category) return
    const res = await fetch(`/api/admin/services-new/${category}`)
    const data = await res.json()
    setServices(data)
  }

  useEffect(() => { loadCategories() }, [])
  useEffect(() => { loadServices() }, [category])

  const openAddService = () => {
    setServiceForm({ ...emptyService, id: crypto.randomUUID() })
    setEditingService(false)
    setShowServiceForm(true)
  }

  const openEditService = (svc: Service) => {
    setServiceForm({
      id: svc.id,
      name: svc.name,
      caption: svc.caption || '',
      description: svc.description || '',
      imageUrl: svc.imageUrl || '',
    })
    setEditingService(true)
    setShowServiceForm(true)
  }

  const saveService = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = {
      name: serviceForm.name,
      caption: serviceForm.caption,
      description: serviceForm.description,
      imageUrl: serviceForm.imageUrl,
    }
    if (editingService) {
      await fetch(`/api/admin/service-new/${serviceForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(`/api/admin/services-new/${category}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
    setShowServiceForm(false)
    setServiceForm(emptyService)
    loadServices()
  }

  const openTierManager = (svc: Service) => {
    setTierServiceId(svc.id)
    setTiers(svc.tiers)
    setShowTierModal(true)
  }

  const openAddTier = () => {
    setTierForm({ ...emptyTier, id: crypto.randomUUID() })
    setEditingTier(false)
  }

  const openEditTier = (t: Tier) => {
    setTierForm({ ...t })
    setEditingTier(true)
  }

  const saveTier = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = {
      id: tierForm.id,
      name: tierForm.name,
      actualPrice: Number(tierForm.actualPrice),
      offerPrice: tierForm.offerPrice !== null && tierForm.offerPrice !== undefined ? Number(tierForm.offerPrice) : null,
      duration: tierForm.duration ? Number(tierForm.duration) : null,
    }
    if (editingTier) {
      await fetch(`/api/admin/service-tiers/${tierServiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(`/api/admin/service-tiers/${tierServiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
    const res = await fetch(`/api/admin/service-tiers/${tierServiceId}`)
    const data = await res.json()
    setTiers(data)
    setTierForm(emptyTier)
    setEditingTier(false)
  }

  const deleteTier = async (id: string) => {
    if (!confirm('Delete this tier?')) return
    await fetch(`/api/admin/service-tiers/${tierServiceId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const res = await fetch(`/api/admin/service-tiers/${tierServiceId}`)
    const data = await res.json()
    setTiers(data)
  }

  const openImageManager = async (svc: Service) => {
    setImageServiceId(svc.id)
    const res = await fetch(`/api/admin/service-images/${svc.id}`)
    const data = await res.json()
    setImages(data)
    setShowImageModal(true)
  }

  const openAddImage = () => {
    setImageForm({ ...emptyImage, id: crypto.randomUUID() })
    setEditingImage(false)
  }

  const openEditImage = (img: Image) => {
    setImageForm({ ...img })
    setEditingImage(true)
  }

  const saveImage = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = { id: imageForm.id, imageUrl: imageForm.imageUrl, caption: imageForm.caption }
    if (editingImage) {
      await fetch(`/api/admin/service-images/${imageServiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    } else {
      await fetch(`/api/admin/service-images/${imageServiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    }
    const res = await fetch(`/api/admin/service-images/${imageServiceId}`)
    const data = await res.json()
    setImages(data)
    setImageForm(emptyImage)
    setEditingImage(false)
  }

  const deleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return
    await fetch(`/api/admin/service-images/${imageServiceId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    const res = await fetch(`/api/admin/service-images/${imageServiceId}`)
    const data = await res.json()
    setImages(data)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Services</h1>
      <div className="flex items-center gap-2 mb-4">
        <select
          className="p-2 rounded border"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {category && (
          <button className="bg-green-600 px-3 py-2 rounded" onClick={openAddService}>+ Add Service</button>
        )}
      </div>

      {services.length > 0 && (
        <table className="w-full text-sm text-left bg-white rounded shadow border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Caption</th>
              <th className="px-3 py-2">Tiers</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2">{s.caption ?? '—'}</td>
                <td className="px-3 py-2">{s.tiers.length}</td>
                <td className="space-x-2 px-3 py-2">
                  <button className="underline" onClick={() => openEditService(s)}>Edit</button>
                  <button className="underline" onClick={() => openTierManager(s)}>Manage Tiers</button>
                  <button className="underline" onClick={() => openImageManager(s)}>Manage Images</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showServiceForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-lg">
            <h2 className="text-xl mb-4">{editingService ? 'Edit' : 'Add'} Service</h2>
            <form onSubmit={saveService} className="space-y-2">
              <input
                className="w-full p-2 rounded border"
                placeholder="Name"
                value={serviceForm.name || ''}
                onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                required
              />
              <input
                className="w-full p-2 rounded border"
                placeholder="Caption"
                value={serviceForm.caption || ''}
                onChange={e => setServiceForm({ ...serviceForm, caption: e.target.value })}
              />
              <WysiwygEditor
                value={serviceForm.description || ''}
                onChange={desc => setServiceForm({ ...serviceForm, description: desc })}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleServiceImage}
                className="w-full p-2 rounded border"
              />
              {serviceForm.imageUrl && (
                <img src={serviceForm.imageUrl} alt="preview" className="h-32 object-cover" />
              )}
              <div className="text-right space-x-2 pt-2">
                <button type="button" className="px-3 py-1 bg-gray-300 rounded" onClick={() => setShowServiceForm(false)}>Cancel</button>
                <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTierModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-lg">
            <h2 className="text-xl mb-4">Manage Tiers</h2>
            <table className="w-full text-sm text-left mb-4 bg-white rounded shadow border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Offer</th>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {tiers.map(t => (
                  <tr key={t.id} className="border-t">
                    <td className="px-3 py-2">{t.name}</td>
                    <td className="px-3 py-2">{t.actualPrice}</td>
                    <td className="px-3 py-2">{t.offerPrice ?? '—'}</td>
                    <td className="px-3 py-2">{t.duration ?? '—'}</td>
                    <td className="space-x-2 px-3 py-2">
                      <button className="underline" onClick={() => openEditTier(t)}>Edit</button>
                      <button className="underline text-red-600" onClick={() => deleteTier(t.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="bg-green-600 px-3 py-1 rounded text-white mb-4" onClick={openAddTier}>+ Add Tier</button>
            {tierForm.name !== undefined && (
              <form onSubmit={saveTier} className="space-y-2">
                <input
                  className="w-full p-2 rounded border"
                  placeholder="Name"
                  value={tierForm.name || ''}
                  onChange={e => setTierForm({ ...tierForm, name: e.target.value })}
                  required
                />
                <input
                  type="number"
                  className="w-full p-2 rounded border"
                  placeholder="Actual Price"
                  value={tierForm.actualPrice ?? 0}
                  onChange={e => setTierForm({ ...tierForm, actualPrice: parseFloat(e.target.value) })}
                  required
                />
                <input
                  type="number"
                  className="w-full p-2 rounded border"
                  placeholder="Offer Price"
                  value={tierForm.offerPrice ?? ''}
                  onChange={e => setTierForm({ ...tierForm, offerPrice: e.target.value ? parseFloat(e.target.value) : null })}
                />
                <input
                  type="number"
                  className="w-full p-2 rounded border"
                  placeholder="Duration (min)"
                  value={tierForm.duration ?? ''}
                  onChange={e => setTierForm({ ...tierForm, duration: e.target.value ? parseInt(e.target.value) : null })}
                />
                <div className="text-right space-x-2 pt-2">
                  <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">{editingTier ? 'Update' : 'Add'} Tier</button>
                </div>
              </form>
            )}
            <div className="text-right mt-4">
              <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => setShowTierModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-lg">
            <h2 className="text-xl mb-4">Manage Images</h2>
            <table className="w-full text-sm text-left mb-4 bg-white rounded shadow border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2">Image</th>
                  <th className="px-3 py-2">Caption</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {images.map(img => (
                  <tr key={img.id} className="border-t">

                    <td>{img.imageUrl ? <img src={img.imageUrl} className="h-10"/> : '—'}</td>

                    <td>{img.imageUrl}</td>

                    <td>{img.caption ?? '—'}</td>
                    <td className="space-x-2">
                      <button className="underline" onClick={() => openEditImage(img)}>Edit</button>
                      <button className="underline text-red-600" onClick={() => deleteImage(img.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="bg-green-600 px-3 py-1 rounded text-white mb-4" onClick={openAddImage}>+ Add Image</button>
            {imageForm.imageUrl !== undefined && (
              <form onSubmit={saveImage} className="space-y-2">
                <input

                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 rounded border"
                />
                {imageForm.imageUrl && (
                  <img src={imageForm.imageUrl} alt="preview" className="h-24 object-cover" />
                )}

                  className="w-full p-2 rounded border"
                  placeholder="Image URL"
                  value={imageForm.imageUrl || ''}
                  onChange={e => setImageForm({ ...imageForm, imageUrl: e.target.value })}
                  required
                />

                <input
                  className="w-full p-2 rounded border"
                  placeholder="Caption"
                  value={imageForm.caption || ''}
                  onChange={e => setImageForm({ ...imageForm, caption: e.target.value })}
                />
                <div className="text-right space-x-2 pt-2">
                  <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">{editingImage ? 'Update' : 'Add'} Image</button>
                </div>
              </form>
            )}
            <div className="text-right mt-4">
              <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => setShowImageModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
