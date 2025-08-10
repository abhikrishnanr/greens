"use client"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { FiPhone, FiMapPin, FiMail, FiInstagram, FiArrowRight, FiSearch, FiX } from "react-icons/fi"
import { Users, Sparkles, Star, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Header from "@/components/Header"

const TIER_LABELS = {
  deluxe: {
    label: "Deluxe",
    icon: <Star className="w-8 h-8 text-amber-400" />,
    description:
      "Indulge in pure luxury with world-renowned brands like Shahnaz Husain & L'Oréal for an unparalleled experience.",
  },
  premium: {
    label: "Premium",
    icon: <Sparkles className="w-8 h-8 text-cyan-400" />,
    description:
      "Experience exceptional quality and results with trusted brands like Biotique & Matrix, our most popular choice.",
  },
  basic: {
    label: "Basic",
    icon: <Users className="w-8 h-8 text-emerald-400" />,
    description:
      "Perfect for essential, everyday care. We use proven techniques to deliver efficient and affordable results.",
  },
}



export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [selectedHeroCategory, setSelectedHeroCategory] = useState<string>("") // default empty until load
  const [heroTabs, setHeroTabs] = useState<any[]>([])
  const [heroLoading, setHeroLoading] = useState(true)
  const [featuredServices, setFeaturedServices] = useState<
    Record<
      string,
      { id: string; name: string; slug: string; caption: string | null; imageUrl: string | null }[]
    >
  >({
    female: [],
    male: [],
    children: [],
  })

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setLoading(true)
    fetch("/api/v2/service-categories")
      .then((res) => {
        if (!res.ok) throw new Error("API error")
        return res.json()
      })
      .then((data) => {
        setCategories(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetch("/api/hero-tabs")
      .then((res) => res.json())
      .then((data) => {
        setHeroTabs(Array.isArray(data) ? data : [])
        if (Array.isArray(data) && data.length > 0) {
          setSelectedHeroCategory(data[0].id)
        }
      })
      .finally(() => setHeroLoading(false))
  }, [])

  useEffect(() => {
    fetch("/api/featured-services")
      .then((res) => res.json())
      .then((data) => setFeaturedServices(data || {}))
  }, [])

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    return categories
      .map((category) => {
        const categoryMatch = category.name.toLowerCase().includes(searchQuery.toLowerCase())
        const filteredServices = category.services?.filter((service: any) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        if (categoryMatch || filteredServices?.length > 0) {
          return {
            ...category,
            services: categoryMatch ? category.services : filteredServices,
          }
        }
        return null
      })
      .filter(Boolean)
  }, [categories, searchQuery])

  const subServices = useMemo(() => {
    if (!expandedCat) return []
    const cat = filteredCategories.find((c) => c.id === expandedCat)
    return cat ? cat.services : []
  }, [expandedCat, filteredCategories])

  const signatureServices = useMemo(
    () => Object.values(featuredServices).flat(),
    [featuredServices],
  )

  const currentHeroContent = useMemo(() => {
    if (heroTabs.length === 0) return {} as any
    return heroTabs.find((cat) => cat.id === selectedHeroCategory) || heroTabs[0]
  }, [selectedHeroCategory, heroTabs])

  const clearSearch = () => {
    setSearchQuery("")
  }

  return (
    <main className="bg-white min-h-screen font-sans text-gray-800">
      <Header />
     

      {/* HERO SECTION (DARK) */}
      <section className="relative flex flex-col overflow-hidden min-h-[60vh] md:min-h-[60vh] bg-gray-800">
        {heroLoading ? (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="bg-gray-300 h-8 w-64 mx-auto rounded"></div>
                <div className="bg-gray-300 h-4 w-96 mx-auto rounded"></div>
                <div className="bg-gray-300 h-10 w-32 mx-auto rounded-full mt-4"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentHeroContent.id}
                className="relative flex-1 w-full flex items-end justify-center p-8 text-center overflow-hidden pb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 z-0">
                  {currentHeroContent.videoSrc && selectedHeroCategory === "home" ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      poster={currentHeroContent.backgroundUrl}
                    >
                      <source src={currentHeroContent.videoSrc} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={currentHeroContent.backgroundUrl || "/placeholder.svg"}
                      alt={currentHeroContent.name || "Background"}
                      className="w-full h-full object-cover"
                    />
                  )}

                </div>
                <div className="relative z-20 text-white max-w-3xl space-y-4">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-white drop-shadow-lg">
                    {currentHeroContent.heroTitle}
                  </h1>
                  {selectedHeroCategory === "home" ? (
                    <p className="text-base md:text-lg leading-relaxed text-white/90 drop-shadow-md">
                      {currentHeroContent.heroDescription}
                    </p>
                  ) : (
                    <Link
  href={`/hero-tabs/${currentHeroContent.slug || currentHeroContent.id}`}
  className="inline-block px-8 py-3 font-semibold text-md shadow-lg transition-all duration-300 bg-transparent text-white border border-white hover:bg-white hover:text-emerald-600 hover:scale-105 rounded-none"
>
  {currentHeroContent.buttonLabel || "Explore Now"}
</Link>

                  )}
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="w-full overflow-x-auto py-2 scrollbar-hide bg-gray-100 shadow-lg">
              <div className="flex gap-0 justify-start px-4 md:justify-center">
                {heroTabs
                  .filter((cat) => cat.id !== "home")
                  .map((cat, idx) => (
                    <motion.button
                      key={cat.id}
                      className={`flex flex-col items-center justify-center p-3 min-w-[100px] text-center transition-all duration-300 relative ${
                        selectedHeroCategory === cat.id
                          ? `bg-white text-black shadow-md rounded-b-lg`
                          : "bg-transparent text-gray-600 hover:bg-gray-200"
                      } ${idx === 0 ? "rounded-bl-lg" : ""} ${idx === heroTabs.length - 2 ? "rounded-br-lg" : ""}`}
                      onClick={() => setSelectedHeroCategory(cat.id)}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={cat.iconUrl || "/placeholder.svg"}
                        alt={cat.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 mb-1"
                      />
                      <span className="text-xs font-medium whitespace-nowrap">{cat.name}</span>
                    </motion.button>
                  ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* SIGNATURE TREATMENTS SECTION (DARK) */}
      <section className="py-12 sm:py-16 bg-emerald-950 text-white relative">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-2xl md:text-3xl font-bold text-white">Our Signature Treatments</p>
          </motion.div>
          <div className="relative">
            {signatureServices.length === 0 ? (
              <div className="flex gap-8 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-emerald-900 rounded-lg h-96 w-80 flex-shrink-0"></div>
                ))}
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-8 custom-scrollbar py-4">
                {signatureServices.map((service, idx) => (
                  <motion.div
                    key={service.id}
                    className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 flex-shrink-0 w-80"
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    <img
                      src={service.imageUrl || `/placeholder.svg?height=400&width=320&query=${service.name}`}
                      alt={service.name}
                      className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                      <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                      <p className="text-sm opacity-80 mb-4 line-clamp-2">{service.caption}</p>
                      <Link
                        href={`/services/${service.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:text-emerald-200"
                      >
                        Explore Service <FiArrowRight />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TAILORED EXPERIENCES (TIERS) SECTION (LIGHT) */}
      <section
        className="py-12 sm:py-16 relative bg-fixed bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(250, 252, 249, 0.95), rgba(250, 252, 249, 0.95)), url('/luxury-salon-mural.png')",
        }}
      >
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-2xl md:text-3xl font-bold text-gray-900">Tailored Experiences</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.entries(TIER_LABELS).map(([key, { label, icon, description }], idx) => (
              <motion.div
                key={key}
                className="rounded-xl p-0.5 bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-[10px] p-8 text-center flex flex-col items-center h-full">
                  <div className="mb-5">{icon}</div>
                  <h3 className="text-2xl font-semibold mb-3 text-stone-800">{label}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed flex-grow">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ALL SERVICES SECTION (DARK) */}
      <section id="services" className="py-12 sm:py-16 bg-emerald-950 text-white relative">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-2xl md:text-3xl font-bold text-white">Explore All Services</p>
          </motion.div>
          <motion.div
            className="max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for any service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 pl-14 pr-6 text-gray-300 bg-emerald-900 border-2 border-emerald-800 rounded-full outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FiX />
                </button>
              )}
            </div>
          </motion.div>
          {loading ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-emerald-900 rounded-xl h-24 animate-pulse"></div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No services found</h3>
              <p className="text-gray-500">Try a different search term or clear the search.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
              {filteredCategories.map((cat, idx) => {
                const isOpen = expandedCat === cat.id
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="bg-emerald-900 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-emerald-800"
                  >
                    <button
                      onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                      className="w-full p-5 text-left focus:outline-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={cat.imageUrl || "/placeholder.svg?height=60&width=60"}
                            alt={cat.name}
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                            <p className="text-gray-200 text-sm">{cat.services?.length || 0} services</p>
                          </div>
                        </div>
                        <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                          <ChevronRight className="text-emerald-400" />
                        </motion.div>
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-5 pb-5 border-t border-emerald-800"
                        >
                          <div className="pt-2">
                            <ul className="space-y-2">
                              {subServices.map((svc) => (
                                <li key={svc.id}>
                                  <Link
                                    href={`/services/${svc.slug}`}
                                    className="flex justify-between items-center p-2 rounded-md hover:bg-emerald-800/50 transition-colors"
                                  >
                                    <span className="font-semibold text-white text-sm">{svc.name}</span>
                                    {svc.minPrice != null && (
                                      <span className="text-sm text-emerald-400 font-medium whitespace-nowrap">
                                        ₹{svc.minPrice} onwards
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* BOOKING & CONTACT SECTION (DARK with BG Image) */}
      <section
        className="py-16 sm:py-24 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/serene-salon-interior.png')",
        }}
      >
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">Your Escape Awaits</h2>
            <p className="text-lg text-white/90 mb-6">
              Ready to indulge in a moment of pure bliss? Book your appointment today and let our experts pamper you.
            </p>
            <a
              href="/book-appointment"
              className="bg-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-500/30"
            >
              Book an Appointment
            </a>
          </motion.div>
        </div>
      </section>

      {/* FOOTER (DARK) */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center gap-6 mb-6 text-xl">
            <a href="tel:+918891467678" className="hover:text-emerald-400 transition-colors">
              <FiPhone />
            </a>
            <a href="mailto:greensalon@gmail.com" className="hover:text-emerald-400 transition-colors">
              <FiMail />
            </a>
            <a
              href="https://instagram.com/greensbeautysalon"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              <FiInstagram />
            </a>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              <FiMapPin />
            </a>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} Greens Beauty Salon. All Rights Reserved.</p>
          <p className="text-xs mt-2">TC 45/215, Kunjalumood Junction, Karamana PO, Trivandrum</p>
        </div>
      </footer>
      <Link
        href="/book-appointment"
        className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg"
      >
        Book Appointment
      </Link>
    </main>
  )
}
