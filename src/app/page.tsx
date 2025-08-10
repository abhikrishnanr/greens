"use client"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { FiPhone, FiMapPin, FiMail, FiInstagram, FiArrowRight, FiSearch, FiX } from "react-icons/fi"
import { ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Header from "@/components/Header"

const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

function getCache(key: string) {
  if (typeof window === "undefined") return null
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    const parsed = JSON.parse(cached)
    if (Date.now() - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key)
      return null
    }
    return parsed.data
  } catch {
    return null
  }
}

function setCache(key: string, data: any) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
}

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [selectedHeroCategory, setSelectedHeroCategory] = useState<string>("") // default empty until load
  const [heroTabs, setHeroTabs] = useState<any[]>([])
  const [heroLoading, setHeroLoading] = useState(true)
  const [featuredServices, setFeaturedServices] = useState<
    Record<string, { id: string; name: string; slug: string; caption: string | null; imageUrl: string | null }[]>
  >({
    female: [],
    male: [],
    children: [],
  })

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setLoading(true)
    const cached = getCache("service-categories")
    if (cached) {
      setCategories(Array.isArray(cached) ? cached : [])
      setLoading(false)
      return
    }
    fetch("/api/v2/service-categories")
      .then((res) => {
        if (!res.ok) throw new Error("API error")
        return res.json()
      })
      .then((data) => {
        const categories = Array.isArray(data) ? data : []
        setCategories(categories)
        setCache("service-categories", categories)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const cached = getCache("hero-tabs")
    if (cached) {
      const tabs = Array.isArray(cached) ? cached : []
      setHeroTabs(tabs)
      if (tabs.length > 0) setSelectedHeroCategory(tabs[0].id)
      setHeroLoading(false)
      return
    }
    fetch("/api/hero-tabs")
      .then((res) => res.json())
      .then((data) => {
        const tabs = Array.isArray(data) ? data : []
        setHeroTabs(tabs)
        if (tabs.length > 0) setSelectedHeroCategory(tabs[0].id)
        setCache("hero-tabs", tabs)
      })
      .finally(() => setHeroLoading(false))
  }, [])

  useEffect(() => {
    const cached = getCache("featured-services")
    if (cached) {
      setFeaturedServices(cached)
      return
    }
    fetch("/api/featured-services")
      .then((res) => res.json())
      .then((data) => {
        setFeaturedServices(data || {})
        setCache("featured-services", data || {})
      })
  }, [])

  useEffect(() => {
    if (!loading) {
      const savedCat = sessionStorage.getItem("expandedCat")
      const savedScroll = sessionStorage.getItem("scrollPos")
      if (savedCat) setExpandedCat(savedCat)
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll, 10))
        }, 0)
      }
      sessionStorage.removeItem("expandedCat")
      sessionStorage.removeItem("scrollPos")
    }
  }, [loading])

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    return categories
      .map((category) => {
        const categoryMatch = category.name.toLowerCase().includes(searchQuery.toLowerCase())
        const filteredServices = category.services?.filter((service: any) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        if (categoryMatch || filteredServices?.length > 0) {
          return { ...category, services: categoryMatch ? category.services : filteredServices }
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

  const signatureServices = useMemo(() => Object.values(featuredServices).flat(), [featuredServices])

  const currentHeroContent = useMemo(() => {
    if (heroTabs.length === 0) return {} as any
    return heroTabs.find((cat) => cat.id === selectedHeroCategory) || heroTabs[0]
  }, [selectedHeroCategory, heroTabs])

  const clearSearch = () => setSearchQuery("")

  return (
    <main className="bg-white min-h-screen font-sans text-gray-800">
      <Header />

      {/* HERO SECTION */}
      <section className="relative flex flex-col overflow-hidden min-h-[80vh] md:min-h-[80vh] bg-gray-800">
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
            {/* Hero media (no overlay) */}
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
                  <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
                    {currentHeroContent.heroTitle}
                  </h1>
                  {selectedHeroCategory === "home" ? (
                    <p className="text-base md:text-lg leading-relaxed text-white/90">
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

            {/* TABS BAR (white, with swipe hint & fancy scrollbar) */}
            <div className="relative w-full bg-white shadow-sm">
              {/* edge fades on mobile */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent md:hidden" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent md:hidden" />

              <div className="flex gap-0 justify-start md:justify-center overflow-x-auto py-2 px-4 fancy-scroll scroll-px-4">
                {heroTabs
                  .filter((cat) => cat.id !== "home")
                  .map((cat, idx) => (
                    <motion.button
                      key={cat.id}
                      onClick={() => setSelectedHeroCategory(cat.id)}
                      className={`flex flex-col items-center justify-center p-3 min-w-[100px] text-center transition-colors duration-200
                        ${
                          selectedHeroCategory === cat.id
                            ? "bg-white text-emerald-700 border-b-2 border-emerald-600 rounded-b-lg"
                            : "bg-transparent text-gray-600 hover:bg-emerald-50"
                        }
                        ${idx === 0 ? "rounded-bl-lg" : ""} ${idx === heroTabs.length - 2 ? "rounded-br-lg" : ""}`}
                      aria-pressed={selectedHeroCategory === cat.id}
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

              {/* swipe hint */}
              <div className="md:hidden absolute bottom-2 left-1/2 -translate-x-1/2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs shadow swipe-hint">
                Swipe →
              </div>
            </div>
          </>
        )}
      </section>


{/* OFFERS (compact, gold+green, animated bg) */}
<section id="offers" className="relative py-8 sm:py-10 overflow-hidden bg-white">
  {/* background animation (subtle + compact) */}
  <div aria-hidden className="absolute inset-0 -z-10">
    {/* soft moving radial tint */}
    <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_120%,rgba(16,185,129,0.06),transparent_50%),radial-gradient(70%_50%_at_90%_-10%,rgba(251,191,36,0.08),transparent_45%)] animate-pan-slow" />
    {/* small floating orbs */}
    <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-emerald-200/40 blur-2xl animate-float-slow" />
    <div className="absolute -bottom-12 -right-8 h-36 w-36 rounded-full bg-amber-200/50 blur-2xl animate-float-slower" />
    {/* faint grid */}
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.05)_1px,transparent_1px)] bg-[size:18px_18px]" />
  </div>

  <div className="container mx-auto px-6 relative z-10">
    <div className="text-center mb-6">

      <h2 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900">Limited-Time Offers</h2>
      <p className="text-gray-600">Save more on popular treatments this month.</p>
      <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-amber-400" />
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="group">
          {/* gold→green gradient border frame (compact) */}
          <div className="rounded-xl p-[1.5px] bg-gradient-to-br from-amber-400 via-emerald-400 to-amber-400 transition-colors duration-300">
            <div className="rounded-xl bg-white/95 backdrop-blur-sm border border-emerald-100 shadow-sm">
              {/* top accent stripe */}
              <div className="h-1 rounded-t-[10px] bg-gradient-to-r from-amber-400 via-emerald-500 to-amber-400" />
              <div className="p-4">
                <div className="text-xs text-emerald-700 font-semibold mb-1">Special {i}</div>
                <h3 className="font-bold text-gray-900 mb-1.5">Flat 20% Off on Deluxe Facials</h3>
                <p className="text-sm text-gray-700 mb-3">Weekdays 11am–4pm • By appointment only</p>
                <Link
                  href="/book-appointment"
                  className="inline-flex items-center gap-2 text-emerald-800 font-semibold hover:text-emerald-700 transition-colors"
                >
                  Book now <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* FEATURED / SIGNATURE (id="featured") */}
      <section id="featured" className="relative py-12 sm:py-16 bg-emerald-950 text-white overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-emerald-950 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-emerald-950 to-transparent z-10" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-2xl md:text-3xl font-bold text-white">Our Featured Services</p>
          </motion.div>

          <div className="relative">
            {signatureServices.length === 0 ? (
              <div className="flex gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-emerald-900/80 rounded-2xl h-80 w-72 sm:w-80 flex-shrink-0 border border-emerald-800/60"
                  />
                ))}
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-6 py-3 pr-2 fancy-scroll snap-x snap-mandatory scroll-px-6">
                {signatureServices.map((service, idx) => {
                  const bgShades = [
                    "bg-gradient-to-br from-emerald-900/70 via-emerald-800/50 to-emerald-900/30",
                    "bg-gradient-to-br from-amber-900/70 via-amber-800/50 to-amber-900/30",
                    "bg-gradient-to-br from-indigo-900/70 via-indigo-800/50 to-indigo-900/30",
                    "bg-gradient-to-br from-rose-900/70 via-rose-800/50 to-rose-900/30",
                  ]
                  const cardBg = bgShades[idx % bgShades.length]

                  return (
                    <motion.div
                      key={service.id}
                      className={`group relative overflow-hidden rounded-2xl border border-emerald-800/70 ${cardBg} shadow-[0_10px_30px_-12px_rgba(16,185,129,0.25)] hover:shadow-[0_18px_36px_-14px_rgba(16,185,129,0.45)] transition-all duration-500 flex-shrink-0 w-72 sm:w-80 snap-start`}
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      viewport={{ once: true, amount: 0.2 }}
                    >
                      <img
                        src={service.imageUrl || `/placeholder.svg?height=400&width=320&query=${service.name}`}
                        alt={service.name}
                        className="w-full h-80 sm:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Smooth bottom fade — no middle band */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold mb-1.5">{service.name}</h3>
                        <p className="text-xs sm:text-sm opacity-80 mb-3 line-clamp-2">{service.caption}</p>
                        <Link
                          href={`/services/${service.slug || service.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:text-emerald-200"
                        >
                          Explore Service <FiArrowRight />
                        </Link>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>


 {/* ACADEMY (dummy) */}
      <section id="academy" className="py-14 bg-emerald-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-emerald-900">Greens Academy & Training</h2>
              <p className="mt-3 text-emerald-800">
                Start your beauty career with industry-led certification programs. Weekend and weekday batches available.
              </p>
              <div className="mt-5 flex gap-3">
                <Link href="/academy" className="px-5 py-2 rounded-md border border-emerald-700 text-emerald-800">
                  Explore Courses
                </Link>
                <Link href="/contact" className="px-5 py-2 rounded-md bg-emerald-700 text-white">
                  Ask Counsellor
                </Link>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-emerald-200">
              <img src="/academy-banner.jpg" alt="Academy" className="w-full h-64 object-cover" />
            </div>
          </div>
        </div>
      </section>


  {/* ALL SERVICES SECTION (DARK) */}
<section id="services" className="relative py-14 sm:py-10 bg-emerald-950 text-white overflow-hidden">
  {/* top accent line */}
  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

  {/* soft background glows */}
  <div className="pointer-events-none absolute -top-28 -left-24 h-72 w-72 rounded-full bg-emerald-600/20 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />

  <div className="relative z-10 px-6 sm:px-10">
    <motion.div
      className="text-center mb-10"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
        Our Service Rates
      </p>
    </motion.div>

    {/* search */}
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="relative mx-auto max-w-3xl">
        <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-amber-400/20 blur-xl" />
        <div className="rounded-full p-[1px] bg-gradient-to-r from-emerald-400/40 via-emerald-200/20 to-amber-300/40">
          <div className="relative rounded-full bg-emerald-900/80 backdrop-blur-md border border-emerald-800">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for any service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pl-12 pr-12 text-gray-300 rounded-full bg-transparent outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent transition-all placeholder:text-gray-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-emerald-800/70 transition"
                aria-label="Clear search"
              >
                <FiX className="text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>

    {/* content states */}
    {loading ? (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl border border-emerald-800 bg-emerald-900"
          >
            <div className="h-28">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-800 [mask-image:linear-gradient(90deg,transparent,black,transparent)]" />
            </div>
          </div>
        ))}
      </div>
    ) : filteredCategories.length === 0 ? (
      <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No services found</h3>
        <p className="text-gray-500">Try a different search term or clear the search.</p>
      </motion.div>
    ) : (
      <div className="space-y-5">
        {filteredCategories.map((cat, idx) => {
          const isOpen = expandedCat === cat.id
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.05 }}
              className="group relative overflow-hidden rounded-2xl"
            >
              {/* gradient frame */}
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-emerald-600/10 via-emerald-400/10 to-amber-400/10 opacity-60 group-hover:opacity-90 transition-opacity" />
              <div className="rounded-2xl p-[1px] bg-gradient-to-br from-emerald-400/30 via-emerald-200/10 to-amber-300/30">
                <div className="bg-emerald-950/60 backdrop-blur-md border border-emerald-800/80 rounded-2xl shadow-[0_0_0_1px_rgba(16,185,129,0.1)] hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.35)] transition-shadow">
                  {/* header */}
                  <button
                    onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                    className="w-full p-5 sm:p-6 text-left focus:outline-none"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="relative">
                          <img
                            src={cat.imageUrl || "/placeholder.svg?height=60&width=60"}
                            alt={cat.name}
                            className="w-14 h-14 rounded-xl object-cover ring-1 ring-emerald-700/60"
                          />
                          <span className="pointer-events-none absolute -bottom-1 -right-1 inline-flex h-5 items-center justify-center rounded-full bg-emerald-700/80 px-1.5 text-xs text-emerald-50">
                            {cat.services?.length || 0}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-white">{cat.name}</h3>
                          <p className="text-gray-300/80 text-sm">{cat.services?.length || 0} services</p>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                        <ChevronRight className="h-6 w-6 text-emerald-400" />
                      </motion.div>
                    </div>
                  </button>

                  {/* body */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 sm:px-6 pb-6 border-t border-emerald-800/80"
                      >
                        <div className="pt-4">
                          <ul className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                            {subServices.map((svc) => (
                              <li key={svc.id}>
                                <Link
                                  href={`/services/${svc.slug || svc.id}`}
                                  onClick={() => {
                                    if (expandedCat) {
                                      sessionStorage.setItem("expandedCat", expandedCat)
                                    }
                                    sessionStorage.setItem("scrollPos", window.scrollY.toString())
                                  }}
                                  className="flex items-center justify-between gap-3 rounded-xl border border-emerald-800/70 bg-emerald-900/70 p-3 hover:bg-emerald-900 hover:border-emerald-700 transition-colors"
                                >
                                  <div className="min-w-0">
                                    <span className="block truncate font-semibold text-white text-sm">
                                      {svc.name}
                                    </span>
                                    {(svc.minActualPrice || svc.minOfferPrice) && (
                                      <span className="block text-xs mt-0.5">
                                        {svc.minOfferPrice && svc.minActualPrice && svc.minActualPrice > svc.minOfferPrice ? (
                                          <>
                                            <span className="line-through text-gray-400 mr-1">₹{svc.minActualPrice}</span>
                                            <span className="text-emerald-400">₹{svc.minOfferPrice} onwards</span>
                                          </>
                                        ) : (
                                          <span className="text-emerald-400">₹{(svc.minOfferPrice ?? svc.minActualPrice)} onwards</span>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                  <FiArrowRight className="shrink-0 text-emerald-400" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    )}
  </div>
</section>












{/* ABOUT SERVICES SECTION (compact) */}
<section
  id="about"
  className="relative py-10 sm:py-12 overflow-hidden"
  style={{
    backgroundImage:
      "linear-gradient(rgba(250,252,249,0.96), rgba(250,252,249,0.96)), url('/luxury-salon-mural.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  }}
>
  {/* compact glows */}
  <div className="pointer-events-none absolute -top-16 -left-20 h-40 w-40 rounded-full bg-emerald-300/25 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-16 -right-20 h-40 w-40 rounded-full bg-amber-300/25 blur-3xl" />

  <div className="container relative z-10 mx-auto px-5 sm:px-6">
    {/* heading */}
    <motion.div
      className="mx-auto mb-4 max-w-3xl text-center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-white/70 px-3 py-0.5 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Greens Beauty Salon
      </div>
      <p className="mt-3 text-xl md:text-2xl font-bold text-gray-900">
        💫 About Our Services
      </p>
    </motion.div>

    {/* intro */}
    <motion.div
      className="mx-auto mb-5 max-w-3xl text-center text-gray-700 space-y-3"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      viewport={{ once: true }}
    >
      <p className="text-base md:text-lg font-semibold text-gray-900">
        Luxury, Quality, and Simplicity
      </p>
      <p className="text-sm md:text-base">
        At Greens Beauty Salon, we understand that beauty needs vary from person to person. That’s why we offer our services under three distinct categories—Deluxe, Premium, and Basic—allowing you to choose based on your preferences, needs, and budget.
      </p>
    </motion.div>

    {/* tier chips */}
    <div className="mx-auto mb-6 flex max-w-xl flex-wrap items-center justify-center gap-2">
      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/70">
        🌟 Deluxe
      </span>
      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-100 to-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/70">
        💎 Premium
      </span>
      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/70">
        🌿 Basic
      </span>
    </div>

    {/* cards (denser) */}
    <div className="grid gap-4 md:grid-cols-3">
      {/* card 1 */}
      <motion.div
        className="group relative"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        viewport={{ once: true }}
      >
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-amber-300/60 via-white to-amber-100/40">
          <div className="rounded-2xl bg-white/85 backdrop-blur-md border border-amber-200/60 p-4 shadow-md transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-base">🌟</span>
              <span className="text-xs font-medium text-amber-800">Deluxe Services</span>
            </div>
            <p className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
              The Ultimate in Beauty and Care
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Indulge in our most exclusive offerings. Our Deluxe category features luxury treatments using internationally renowned brands like Shahnaz Husain and L'Oréal. These services are designed for those who demand the highest level of quality, care, and effectiveness.
            </p>
          </div>
        </div>
      </motion.div>

      {/* card 2 */}
      <motion.div
        className="group relative"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        viewport={{ once: true }}
      >
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-slate-300/60 via-white to-slate-100/40">
          <div className="rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/70 p-4 shadow-md transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-base">💎</span>
              <span className="text-xs font-medium text-slate-700">Premium Services </span>
            </div>
            <p className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
              Trusted Brands, Superior Results
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Our Premium category strikes the perfect balance between quality and affordability. We use products from leading brands such as Biotique, Streax, Matrix, Nature’s Way, Oxyglow, and Nature’s Essence to deliver visible results without a hefty price tag.
            </p>
          </div>
        </div>
      </motion.div>

      {/* card 3 */}
      <motion.div
        className="group relative"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        viewport={{ once: true }}
      >
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-emerald-300/60 via-white to-emerald-100/40">
          <div className="rounded-2xl bg-white/85 backdrop-blur-md border border-emerald-200/70 p-4 shadow-md transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-base">🌿</span>
              <span className="text-xs font-medium text-emerald-800">Basic Services</span>
            </div>
            <p className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
              Simple, Effective, Everyday Care
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Designed for everyday beauty needs, our Basic category offers reliable treatments using standard creams and techniques. These services focus on delivering clean, efficient, and affordable results—perfect for your regular self-care routine.
            </p>
          </div>
        </div>
      </motion.div>
    </div>

    {/* outro (tightened) */}
    <motion.div
      className="mx-auto mt-10 max-w-3xl text-center text-gray-700 space-y-3"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.06 }}
      viewport={{ once: true }}
    >
      <p className="font-semibold text-gray-900">
        💚 Personalized Guidance, Always
      </p>
      <p className="text-sm md:text-base">
        Not sure which service to go for? Don’t worry—we’re here to help you choose!
      </p>
      <p className="text-sm md:text-base">
        At Greens Beauty Salon, our friendly and experienced team is always happy to guide you. Whether you’re booking a facial, a haircut, or a relaxing spa session, we’ll help you choose the right category and treatment based on your skin type, hair condition, and personal preferences.
      </p>
      <p className="text-sm md:text-base">
        We love getting to know our clients and recommending what truly works best for you—because your comfort, confidence, and satisfaction are what matter most.
      </p>
 

      {/* compact CTA frame */}
      <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-white/70 px-4 py-2.5 shadow-sm backdrop-blur-sm">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">🤝</span>
        <span className="text-xs md:text-sm text-emerald-800 font-medium">
         Just ask us. We’re always ready to help you feel and look your best!
        </span>
      </div>
    </motion.div>
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


            {/* CONTACT (id="contact") */}
      <section id="contact" className="py-14 bg-emerald-25">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="rounded-2xl overflow-hidden border border-emerald-200 bg-white">
              {/* Map placeholder (keep it simple to avoid new APIs) */}
              <img src="/map-placeholder.png" alt="Map" className="w-full h-72 object-cover" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Reach Us</h3>
              <p className="text-gray-700">TC 45/215, Kunjalumood Junction, Karamana PO, Trivandrum</p>
              <div className="mt-4 flex flex-col gap-2 text-gray-800">
                <a href="tel:+918891467678" className="hover:text-emerald-700 inline-flex items-center gap-2">
                  <FiPhone /> +91 8891 467 678
                </a>
                <a href="mailto:greensalon@gmail.com" className="hover:text-emerald-700 inline-flex items-center gap-2">
                  <FiMail /> greensalon@gmail.com
                </a>
                <a
                  href="https://instagram.com/greensbeautysalon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 inline-flex items-center gap-2"
                >
                  <FiInstagram /> @greensbeautysalon
                </a>
              </div>
            </div>
          </div>
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
