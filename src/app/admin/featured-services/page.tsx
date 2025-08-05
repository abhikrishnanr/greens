"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { X } from "lucide-react"

interface ServiceOption {
  id: string
  name: string
  applicableTo: string
}

interface FeaturedItem {
  id: string
  serviceId: string
  service: { id: string; name: string; applicableTo: string }
  applicableTo: string
}

export default function FeaturedServicesAdmin() {
  const [services, setServices] = useState<ServiceOption[]>([])
  const [featured, setFeatured] = useState<Record<string, FeaturedItem[]>>({ female: [], male: [], children: [] })
  const [selected, setSelected] = useState<Record<string, string>>({ female: "", male: "", children: "" })

  const loadData = async () => {
    try {
      const [svcRes, featRes] = await Promise.all([
        fetch("/api/admin/services-new"),
        fetch("/api/admin/featured-services"),
      ])
      if (!svcRes.ok) throw new Error("Failed to fetch services")
      if (!featRes.ok) throw new Error("Failed to fetch featured services")

      const svcData: ServiceOption[] = await svcRes.json()
      const featData = await featRes.json()
      setServices(svcData)
      setFeatured(featData)
    } catch (error) {
      console.error("Error loading data:", error)
    }

  }

  useEffect(() => {
    loadData()
  }, [])

  const addFeatured = async (gender: string) => {
    const serviceId = selected[gender]
    if (!serviceId) return
    await fetch("/api/admin/featured-services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, applicableTo: gender })
    })
    setSelected({ ...selected, [gender]: "" })
    loadData()
  }

  const removeFeatured = async (id: string) => {
    await fetch(`/api/admin/featured-services/${id}`, { method: "DELETE" })
    loadData()
  }

  const genders: Array<"female" | "male" | "children"> = ["female", "male", "children"]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Featured Services</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {genders.map((gender) => (
          <Card key={gender}>
            <CardHeader>
              <CardTitle className="capitalize">{gender}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {featured[gender]?.map((f) => (
                  <div key={f.id} className="flex items-center justify-between border p-2 rounded">
                    <span>{f.service.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeFeatured(f.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Select value={selected[gender]} onValueChange={(v) => setSelected({ ...selected, [gender]: v })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services
                      .filter((s) => s.applicableTo === gender)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => addFeatured(gender)}>Add</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
