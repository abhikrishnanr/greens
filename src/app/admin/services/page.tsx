"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  Plus,
  Edit3,
  Trash2,
  Settings,
  ImageIcon,
  Save,
  X,
  Upload,
  DollarSign,
  Clock,
  Tag,
  FileText,
  Grid3X3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import WysiwygEditor from "@/app/components/WysiwygEditor"

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
  const [category, setCategory] = useState("")
  const [services, setServices] = useState<Service[]>([])

  const emptyService: Partial<Service> = { id: "", name: "", caption: "", description: "", imageUrl: "" }
  const [serviceForm, setServiceForm] = useState<Partial<Service>>(emptyService)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState(false)

  const handleServiceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()
    setServiceForm({ ...serviceForm, imageUrl: data.url })
  }

  const emptyTier: Partial<Tier> = { id: "", name: "", actualPrice: 0, offerPrice: null, duration: null }
  const [tiers, setTiers] = useState<Tier[]>([])
  const [tierForm, setTierForm] = useState<Partial<Tier>>({})
  const [showTierModal, setShowTierModal] = useState(false)
  const [editingTier, setEditingTier] = useState(false)
  const [tierServiceId, setTierServiceId] = useState("")

  const emptyImage: Partial<Image> = { id: "", imageUrl: "", caption: "" }
  const [images, setImages] = useState<Image[]>([])
  const [imageForm, setImageForm] = useState<Partial<Image>>({})
  const [showImageModal, setShowImageModal] = useState(false)
  const [editingImage, setEditingImage] = useState(false)
  const [imageServiceId, setImageServiceId] = useState("")

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()
    setImageForm({ ...imageForm, imageUrl: data.url })
  }

  const loadCategories = async () => {
    const res = await fetch("/api/admin/service-categories")
    const data = await res.json()
    setCategories(data)
  }

  const loadServices = async () => {
    if (!category) return
    const res = await fetch(`/api/admin/services-new/${category}`)
    const data = await res.json()
    setServices(data)
  }

  useEffect(() => {
    loadCategories()
  }, [])
  useEffect(() => {
    loadServices()
  }, [category])

  const openAddService = () => {
    setServiceForm({ ...emptyService, id: crypto.randomUUID() })
    setEditingService(false)
    setShowServiceForm(true)
  }

  const openEditService = (svc: Service) => {
    setServiceForm({
      id: svc.id,
      name: svc.name,
      caption: svc.caption || "",
      description: svc.description || "",
      imageUrl: svc.imageUrl || "",
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(`/api/admin/services-new/${category}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    setTierForm({} as Partial<Tier>)
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
      offerPrice:
        tierForm.offerPrice !== null && tierForm.offerPrice !== undefined ? Number(tierForm.offerPrice) : null,
      duration: tierForm.duration ? Number(tierForm.duration) : null,
    }
    if (editingTier) {
      await fetch(`/api/admin/service-tiers/${tierServiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(`/api/admin/service-tiers/${tierServiceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    }
    const res = await fetch(`/api/admin/service-tiers/${tierServiceId}`)
    const data = await res.json()
    setTiers(data)
    setTierForm({} as Partial<Tier>)
    setEditingTier(false)
  }

  const deleteTier = async (id: string) => {
    if (!confirm("Delete this tier?")) return
    await fetch(`/api/admin/service-tiers/${tierServiceId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
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
    setImageForm({} as Partial<Image>)
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(`/api/admin/service-images/${imageServiceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    }
    const res = await fetch(`/api/admin/service-images/${imageServiceId}`)
    const data = await res.json()
    setImages(data)
    setImageForm({} as Partial<Image>)
    setEditingImage(false)
  }

  const deleteImage = async (id: string) => {
    if (!confirm("Delete this image?")) return
    await fetch(`/api/admin/service-images/${imageServiceId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    const res = await fetch(`/api/admin/service-images/${imageServiceId}`)
    const data = await res.json()
    setImages(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Services Management
          </h1>
          <p className="text-slate-600">Manage your services, tiers, and media content</p>
        </div>

        {/* Category Selection */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Grid3X3 className="h-5 w-5" />
              Category Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category to manage services" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {category && (
                <Button
                  onClick={openAddService}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        {services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
              >
                <div className="relative">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl || "/placeholder.svg"}
                      alt={service.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 text-slate-700">
                      {service.tiers.length} tiers
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">{service.name}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{service.caption || "No caption provided"}</p>

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditService(service)}
                      className="flex-1 hover:bg-blue-50 hover:border-blue-200"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTierManager(service)}
                      className="flex-1 hover:bg-green-50 hover:border-green-200"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Tiers
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openImageManager(service)}
                      className="flex-1 hover:bg-purple-50 hover:border-purple-200"
                    >
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Images
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Service Form Modal */}
        {showServiceForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {editingService ? "Edit Service" : "Add New Service"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowServiceForm(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={saveService} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Service Name
                    </Label>
                    <Input
                      id="name"
                      value={serviceForm.name || ""}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      placeholder="Enter service name"
                      required
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caption" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Caption
                    </Label>
                    <Input
                      id="caption"
                      value={serviceForm.caption || ""}
                      onChange={(e) => setServiceForm({ ...serviceForm, caption: e.target.value })}
                      placeholder="Short tagline for the service"
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description
                    </Label>
                    <div className="border rounded-lg overflow-hidden">
                      <WysiwygEditor
                        value={serviceForm.description || ""}
                        onChange={(desc) => setServiceForm({ ...serviceForm, description: desc })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image" className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Service Image
                    </Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                      <input id="image" type="file" accept="image/*" onChange={handleServiceImage} className="w-full" />
                      {serviceForm.imageUrl && (
                        <div className="mt-4">
                          <img
                            src={serviceForm.imageUrl || "/placeholder.svg"}
                            alt="preview"
                            className="h-32 w-full object-cover rounded-lg shadow-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setShowServiceForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingService ? "Update" : "Create"} Service
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tier Management Modal */}
        {showTierModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Manage Service Tiers
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTierModal(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Existing Tiers */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Current Tiers</h3>
                    <Button
                      onClick={openAddTier}
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tier
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tiers.map((tier) => (
                      <Card key={tier.id} className="border border-slate-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-slate-800">{tier.name}</h4>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditTier(tier)}
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTier(tier.id)}
                                className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3 text-slate-500" />
                              <span className="text-slate-600">Price: </span>
                              <span className="font-medium">${tier.actualPrice}</span>
                              {tier.offerPrice && (
                                <Badge variant="secondary" className="text-xs">
                                  Offer: ${tier.offerPrice}
                                </Badge>
                              )}
                            </div>
                            {tier.duration && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-slate-500" />
                                <span className="text-slate-600">Duration: </span>
                                <span className="font-medium">{tier.duration} min</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Tier Form */}
                {tierForm.name !== undefined && (
                  <Card className="border-2 border-green-200 bg-green-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-green-800">
                        {editingTier ? "Edit Tier" : "Add New Tier"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={saveTier} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tierName">Tier Name</Label>
                          <Input
                            id="tierName"
                            value={tierForm.name || ""}
                            onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                            placeholder="e.g., Basic, Premium"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="actualPrice">Actual Price ($)</Label>
                          <Input
                            id="actualPrice"
                            type="number"
                            step="0.01"
                            value={tierForm.actualPrice ?? 0}
                            onChange={(e) =>
                              setTierForm({ ...tierForm, actualPrice: Number.parseFloat(e.target.value) })
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="offerPrice">Offer Price ($)</Label>
                          <Input
                            id="offerPrice"
                            type="number"
                            step="0.01"
                            value={tierForm.offerPrice ?? ""}
                            onChange={(e) =>
                              setTierForm({
                                ...tierForm,
                                offerPrice: e.target.value ? Number.parseFloat(e.target.value) : null,
                              })
                            }
                            placeholder="Optional discount price"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={tierForm.duration ?? ""}
                            onChange={(e) =>
                              setTierForm({
                                ...tierForm,
                                duration: e.target.value ? Number.parseInt(e.target.value) : null,
                              })
                            }
                            placeholder="Service duration"
                          />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setTierForm({} as Partial<Tier>)
                              setEditingTier(false)
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {editingTier ? "Update" : "Add"} Tier
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Image Management Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-0">
              <CardHeader className="bg-purple-50 text-purple-800">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Manage Service Images
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageModal(false)}
                    className="text-purple-800 hover:bg-purple-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Existing Images */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Current Images</h3>
                    <Button
                      onClick={openAddImage}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image) => (
                      <Card
                        key={image.id}
                        className="border border-slate-200 hover:shadow-md transition-shadow overflow-hidden"
                      >
                        <div className="aspect-video relative">
                          {image.imageUrl ? (
                            <img
                              src={image.imageUrl || "/placeholder.svg"}
                              alt={image.caption || "Service image"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-slate-400" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openEditImage(image)}
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => deleteImage(image.id)}
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-red-100 text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm text-slate-600 truncate">{image.caption || "No caption"}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Image Form */}
                {imageForm.imageUrl !== undefined && (
                  <Card className="border-2 border-purple-200 bg-purple-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-purple-800">
                        {editingImage ? "Edit Image" : "Add New Image"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={saveImage} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="imageFile" className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Image
                          </Label>
                          <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                            <input
                              id="imageFile"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="w-full"
                            />
                            {imageForm.imageUrl && (
                              <div className="mt-4">
                                <img
                                  src={imageForm.imageUrl || "/placeholder.svg"}
                                  alt="preview"
                                  className="h-32 w-full object-cover rounded-lg shadow-md"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="imageUrl">Image URL</Label>
                          <Input
                            id="imageUrl"
                            value={imageForm.imageUrl || ""}
                            onChange={(e) => setImageForm({ ...imageForm, imageUrl: e.target.value })}
                            placeholder="Direct link to image"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="imageCaption">Caption</Label>
                          <Input
                            id="imageCaption"
                            value={imageForm.caption || ""}
                            onChange={(e) => setImageForm({ ...imageForm, caption: e.target.value })}
                            placeholder="Image description or caption"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setImageForm({} as Partial<Image>)
                              setEditingImage(false)
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {editingImage ? "Update" : "Add"} Image
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
