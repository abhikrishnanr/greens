"use client"
import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import {
  FiPhone,
  FiYoutube,
  FiArrowLeft,
  FiCalendar,
  FiArrowUp,
  FiMapPin,
  FiMail,
  FiInstagram,
  FiArrowRight,
  FiSearch,
  FiX,
} from "react-icons/fi"
import { ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Header from "@/components/Header"
import { FaWhatsapp, FaFacebookF } from "react-icons/fa"

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
  const [offers, setOffers] = useState<any[]>([])
  interface PremiumServiceItem {
    id: string
    name: string
    currentPrice: number
    offerPrice?: number | null
  }
  interface PremiumServicePlan {
    id: string
    title: string
    imageUrl?: string | null
    items: PremiumServiceItem[]
  }
  const [premiumPlans, setPremiumPlans] = useState<PremiumServicePlan[]>([])

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("")

  // Sticky mobile actions & hero tabs
  const heroTabsRef = useRef<HTMLDivElement | null>(null)
  const [showSticky, setShowSticky] = useState(false)

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
    fetch('/api/limited-time-offers')
      .then((res) => res.json())
      .then((data) => setOffers(Array.isArray(data) ? data : []))
  }, [])

  useEffect(() => {
    const cached = getCache('premium-services')
    if (cached) {
      setPremiumPlans(Array.isArray(cached) ? cached : [])
    }
    fetch('/api/premium-services')
      .then((res) => res.json())
      .then((data: unknown) => {
        const plans = Array.isArray(data) ? (data as PremiumServicePlan[]) : []
        setPremiumPlans(plans)
        setCache('premium-services', plans)
      })
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
  useEffect(() => {
    const setVars = () => {
      const sticky = document.getElementById("mobile-sticky")
      const stickyH = sticky && showSticky ? sticky.offsetHeight : 0
      document.documentElement.style.setProperty("--sticky-nav-h", `${stickyH}px`)

      const tabsH = heroTabsRef.current ? heroTabsRef.current.offsetHeight : 0
      document.documentElement.style.setProperty("--hero-tabs-h", `${tabsH}px`)
    }

    setVars()
    const ro = new ResizeObserver(setVars)
    if (heroTabsRef.current) ro.observe(heroTabsRef.current)
    const sticky = document.getElementById("mobile-sticky")
    if (sticky) ro.observe(sticky)

    window.addEventListener("resize", setVars)
    window.addEventListener("orientationchange", setVars)

    return () => {
      ro.disconnect()
      window.removeEventListener("resize", setVars)
      window.removeEventListener("orientationchange", setVars)
    }
  }, [showSticky, heroLoading])

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY

      if (current > 100) {
        setShowSticky(true)
      } else if (current === 0) {
        setShowSticky(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
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
    <main className="bg-white min-h-screen font-sans text-gray-800 pb-12 md:pb-0">
      <Header />

      {/* HERO SECTION */}
      <section className="relative flex flex-col overflow-hidden min-h-screen bg-emerald-950">
        {heroLoading ? (
          <>
            {/* Media placeholder with emerald gradient, content anchored to bottom */}
            <div className="relative flex-1 min-h-screen">
      {/* on-brand gradient + soft pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(16,185,129,.15),transparent_60%),radial-gradient(900px_500px_at_90%_110%,rgba(251,191,36,.12),transparent_60%)]" />

      {/* bottom-aligned skeleton */}
      <div className="absolute inset-0 flex flex-col" style={{paddingBottom: "calc(var(--hero-tabs-h, 56px) + var(--sticky-nav-h, 0px) + 12px)",}}>
        <div className="flex-1" />
        <div className="w-full px-6">
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <div className="h-7 md:h-9 w-3/4 mx-auto rounded skel-emerald" />
            <div className="h-4 md:h-5 w-5/6 mx-auto rounded skel-emerald" />
            <div className="h-9 w-40 mx-auto rounded-full skel-emerald-light" />
          </div>
        </div>
      </div>
    </div>

            {/* Tabs skeleton – overlay at bottom */}
            <div
              ref={heroTabsRef}
              className="absolute left-0 w-full bg-emerald-900/60"
              style={{ bottom: showSticky ? "var(--sticky-nav-h, 0px)" : 0 }}
            >
              <div className="flex gap-3 md:justify-center overflow-x-auto py-2 px-4 fancy-scroll scroll-px-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 min-w-[80px] rounded-full skel-tab bg-emerald-700/40"
                  />
                ))}
              </div>
            </div>
          </>
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

          <div className="relative z-20 text-white max-w-3xl space-y-4" style={{paddingBottom: "calc(var(--hero-tabs-h, 56px) + var(--sticky-nav-h, 0px) + 12px)",}}>
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

            {/* TABS BAR – overlaid at bottom without white background */}
            <div
              ref={heroTabsRef}
              className="absolute left-0 w-full bg-emerald-900/70 backdrop-blur-sm z-30"
              style={{ bottom: showSticky ? "var(--sticky-nav-h, 0px)" : 0 }}
            >
              <div className="flex gap-3 justify-start md:justify-center overflow-x-auto py-2 px-4 fancy-scroll scroll-px-4">
                {heroTabs
                  .filter((cat) => cat.id !== "home")
                  .map((cat) => (
                    <motion.button
                      key={cat.id}
                      onClick={() => setSelectedHeroCategory(cat.id)}
                      className={`flex flex-col items-center flex-shrink-0 px-4 py-2 rounded-full min-w-[80px] text-center text-xs font-medium transition-colors duration-200
                        ${
                          selectedHeroCategory === cat.id
                            ? "bg-emerald-700 text-emerald-100"
                            : "bg-emerald-800/40 text-white/80 hover:bg-emerald-800/60"
                        }
                      `}
                      aria-pressed={selectedHeroCategory === cat.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {cat.iconUrl && (
                        <img
                          src={cat.iconUrl}
                          alt={cat.name}
                          className="w-6 h-6 mb-1 object-contain"
                        />
                      )}
                      <span className="whitespace-nowrap">{cat.name}</span>
                    </motion.button>
                  ))}
              </div>
            </div>
          </>
        )}
      </section>



{/* OFFERS – Floral & Leaves (pure CSS, no images) */}
<section id="offers" className="offers-floral relative overflow-hidden bg-white py-12 sm:py-14">
  {/* decorative background (no interaction) */}
  <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
    <div className="floral-aurora" />
    {/* static decorative leaves around edges */}
    <span className="leaf leaf-a" />
    <span className="leaf leaf-b" />
    <span className="leaf leaf-c" />
    <span className="leaf leaf-d" />
    {/* gently floating petals */}
    <span className="petal petal-1" />
    <span className="petal petal-2" />
    <span className="petal petal-3" />
    <span className="petal petal-4" />
  </div>

  <div className="container mx-auto px-6 relative z-10">
    <div className="text-center mb-8">
 
      <h2 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900">Special Offers</h2>
      <p className="text-gray-600">Save more on popular treatments this month.</p>
      <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-amber-400" />
    </div>

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {offers.length === 0 ? (
        <p className="col-span-full text-center text-gray-500">No offers available</p>
      ) : (
        offers.map((offer) => (
          <div key={offer.id} className="offer-wrap group relative">
            <div className="offer-vine rounded-2xl">
              <div className="offer-card rounded-2xl">
                <div className="h-1 rounded-t-[16px] bg-gradient-to-r from-amber-400 via-emerald-500 to-amber-400" />
                {offer.imageUrl && (
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-40 object-cover rounded-t-[16px]"
                  />
                )}
                <div className="p-4">
                  {offer.category && (
                    <div className="text-xs text-emerald-700 font-semibold mb-1">{offer.category}</div>
                  )}
                  <h3 className="font-bold text-gray-900 mb-1.5">{offer.title}</h3>
                  {offer.subTitle && <p className="text-sm text-gray-700 mb-3">{offer.subTitle}</p>}
                  <Link
                    href={`/offers/${offer.id}`}
                    className="inline-flex items-center gap-2 text-emerald-800 font-semibold btn-shine"
                  >
                    View details <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>
            <span aria-hidden className="burst" />
          </div>
        ))
      )}
    </div>
  </div>
</section>
<section
  id="premium-services"
  className="py-12 sm:py-16"
  style={{
    background: "linear-gradient(180deg, #3b2b19 0%, #5a4528 30%, #2e1e0e 100%)",
  }}
>
  <div className="container mx-auto px-6">
    <div className="text-center mb-8">
      <h2 className="mt-3 text-2xl md:text-3xl font-bold text-[#FFD86B]">
        Our Premium Services
      </h2>
      <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-[#FFD86B] via-[#FFC94A] to-[#FFD86B]" />
    </div>
    {premiumPlans.length === 0 ? (
      <p className="text-center text-[#FFEAA7]">
        No premium services available
      </p>
    ) : (
      <div className="grid md:grid-cols-2 gap-8">
        {premiumPlans.map((plan: PremiumServicePlan) => (
          <div
            key={plan.id}
            className="border-2 border-[#FFD86B] rounded-lg p-4 text-[#FFDF80] bg-black/20 shadow-lg"
          >
            {plan.imageUrl && (
              <img
                src={plan.imageUrl}
                alt={plan.title}
                className="w-full h-40 object-cover rounded mb-4"
              />
            )}
            <h3 className="text-xl font-bold mb-4 text-center text-[#FFD86B]">
              {plan.title}
            </h3>
            <ul className="divide-y divide-[#FFD86B] divide-dashed">
              {plan.items.map((item: PremiumServiceItem) => (
                <li
                  key={item.id}
                  className="py-2 flex justify-between text-[#FFEAA7]"
                >
                  <span>{item.name}</span>
                  <span className="font-semibold text-[#FFD86B]">
                    {item.offerPrice && item.offerPrice < item.currentPrice ? (
                      <>
                        <span className="line-through mr-2 opacity-80">
                          ₹{item.currentPrice}
                        </span>
                        <span>₹{item.offerPrice}</span>
                      </>
                    ) : (
                      <span>₹{item.currentPrice}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}
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
            <p className="text-2xl md:text-3xl font-bold text-white">Hot Picks</p>
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
              <h2 className="text-2xl md:text-3xl font-bold text-emerald-900">Beauty Education</h2>
              <p className="mt-3 text-emerald-800">
                Start your beauty career with industry-led certification programs. Weekend and weekday batches available.
              </p>
              <div className="mt-5 flex gap-3">
                <Link href="/academy" className="px-5 py-2 rounded-md bg-emerald-700 text-white">
                  Explore Courses
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
        Explore Our services
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
        ⭐ Premium
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
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-base">⭐</span>
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
    
            <a
              href="/book-appointment"
              className="bg-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-500/30"
            >
              Book an Appointment
            </a>
          </motion.div>
        </div>
      </section>


         {/* CONTACT (id="contact") — directions-first with helper text + IG + WhatsApp */}
<section id="contact" className="relative py-16 overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
  {/* soft background accents */}
  <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl" />
  <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-300/25 blur-3xl" />

  <div className="container mx-auto px-6 relative z-10">
    <div className="grid lg:grid-cols-2 gap-8 items-stretch">
      {/* Directions card (animated route, no APIs) */}
      <div className="relative rounded-2xl border border-emerald-200 bg-white shadow-sm">
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-amber-400 via-emerald-500 to-amber-400" />
        <div className="relative p-5">
          <svg viewBox="0 0 420 240" className="w-full h-60">
            <defs>
              <pattern id="dotgrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" className="fill-emerald-100/60" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotgrid)" />
            <path
              d="M30,210 C120,140 80,80 180,110 C280,140 240,70 330,90 C370,98 390,130 395,170"
              className="fill-none stroke-emerald-500/80 route-dash"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <g transform="translate(30,210)">
              <circle r="6" className="fill-emerald-400" />
              <circle r="12" className="fill-emerald-400/30 animate-ping" />
            </g>
            <g transform="translate(395,170)">
              <circle r="8" className="fill-amber-400" />
              <circle r="16" className="fill-amber-400/30 animate-ping" />
            </g>
            <text x="400" y="160" textAnchor="end" className="fill-emerald-900 font-semibold text-[12px]">
              Greens Beauty Salon
            </text>
          </svg>

          {/* Primary CTAs + helper text */}
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=TC%2045%2F215%2C%20Kunjalumood%20Junction%2C%20Karamana%20PO%2C%20Trivandrum"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-white font-semibold hover:bg-emerald-700 transition"
                aria-label="Get directions to Greens Beauty Salon on Google Maps"
              >
                Get Directions
              </a>
              <p className="mt-1 text-xs text-gray-500">Opens Google Maps with our address prefilled.</p>
            </div>

            <div>
              <a
                href="https://maps.app.goo.gl/y5PBWRF4pL1pp9tA7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-800 hover:bg-emerald-100 transition"
                aria-label="Open Greens Beauty Salon in Google Maps"
              >
                Open in Google Maps
              </a>
              <p className="mt-1 text-xs text-gray-500">Best on Android/Chrome; opens the map page in a new tab.</p>
            </div>

            <div className="sm:col-span-2">
              <a
                href="https://maps.apple.com/?q=TC%2045%2F215%20Kunjalumood%20Junction%2C%20Karamana%20PO%2C%20Trivandrum"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-amber-800 hover:bg-amber-100 transition"
                aria-label="Open Greens Beauty Salon in Apple Maps"
              >
                Open in Apple Maps
              </a>
              <p className="mt-1 text-xs text-gray-500">On iPhone, this opens the Apple Maps app automatically.</p>
            </div>
          </div>

          {/* Quick utils */}
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-emerald-700">
            <button
              onClick={() => navigator.clipboard?.writeText("TC 45/215, Kunjalumood Junction, Karamana PO, Trivandrum")}
              className="rounded-full border border-emerald-200 bg-white px-3 py-1 hover:bg-emerald-50 transition"
              aria-label="Copy address to clipboard"
            >
              Copy address
            </button>
            <a
              href="https://maps.app.goo.gl/y5PBWRF4pL1pp9tA7"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-emerald-200 bg-white px-3 py-1 hover:bg-emerald-50 transition"
              aria-label="Share Google Maps link"
            >
              Share map link
            </a>
          </div>
        </div>
      </div>

      {/* Details + icons + helper text */}
      <div>
  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Reach Us</h3>
  <p className="text-gray-700">TC 45/215, Kunjalumood Junction, Karamana PO, Trivandrum</p>

  <div className="mt-5 grid sm:grid-cols-2 gap-3">
    {/* Phone */}
    <div>
      <a
        href="tel:+918891467678"
        className="rounded-xl border border-emerald-200 bg-white px-4 py-3 hover:bg-emerald-50 transition inline-flex items-center gap-2"
        aria-label="Call Greens Beauty Salon"
      >
        <FiPhone className="text-emerald-600" />
        <span>+91 8891 467 678</span>
      </a>
      <p className="mt-1 text-xs text-gray-500">Tap to call us.</p>
    </div>

    {/* Email */}
    <div>
      <a
        href="mailto:thegreensbeautysalon@gmail.com"
        className="rounded-xl border border-emerald-200 bg-white px-4 py-3 hover:bg-emerald-50 transition inline-flex items-center gap-2"
        aria-label="Email Greens Beauty Salon"
      >
        <FiMail className="text-amber-600" />
        <span>thegreensbeautysalon@gmail.com</span>
      </a>
      <p className="mt-1 text-xs text-gray-500">We usually respond within business hours.</p>
    </div>

    {/* Instagram */}
    <div>
      <a
        href="https://instagram.com/greensbeautysalon"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl border border-pink-200 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 px-4 py-3 hover:from-pink-100 hover:to-pink-100 transition inline-flex items-center gap-2"
        aria-label="Open our Instagram profile"
      >
        <FiInstagram className="text-pink-500" />
        <span>@greensbeautysalon</span>
      </a>
      <p className="mt-1 text-xs text-gray-500">See photos, stories & updates.</p>
    </div>

    {/* WhatsApp */}
    <div>
      <a
        href="https://wa.me/918891467678?text=Hi%20Greens%20Beauty%20Salon%2C%20I%27d%20like%20directions%20and%20to%20book.%20Map%20link%3A%20https%3A%2F%2Fmaps.app.goo.gl%2Fy5PBWRF4pL1pp9tA7"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl border border-emerald-200 bg-white px-4 py-3 hover:bg-emerald-50 transition inline-flex items-center gap-2"
        aria-label="Chat with us on WhatsApp"
      >
        <FaWhatsapp className="text-emerald-600" />
        <span>WhatsApp us</span>
      </a>
      <p className="mt-1 text-xs text-gray-500">Fast replies on WhatsApp.</p>
    </div>

    {/* Facebook */}
    <div>
      <a
        href="https://www.facebook.com/thegreensbeautysalon"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 px-4 py-3 hover:from-blue-100 hover:to-blue-100 transition inline-flex items-center gap-2"
        aria-label="Visit our Facebook page"
      >
        <FaFacebookF className="text-blue-600" />
        <span>Facebook</span>
      </a>
      <p className="mt-1 text-xs text-gray-500">Follow us for updates & offers.</p>
    </div>

    {/* YouTube */}
    <div>
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 px-4 py-3 hover:from-red-100 hover:to-red-100 transition inline-flex items-center gap-2"
        aria-label="Visit our YouTube channel"
      >
        <FiYoutube className="text-red-600" />
        <span>YouTube</span>
      </a>
      <p className="mt-1 text-xs text-gray-500">Watch our latest videos.</p>
    </div>
  </div>

  {/* helper notes */}
  <ul className="mt-4 text-sm text-gray-600 space-y-1">
    <li>• Landmark: Kunjalumood Junction</li>
    <li>• Parking available nearby</li>
    <li>• Tip: On mobile, “Get Directions” opens your Maps app for turn-by-turn navigation.</li>
  </ul>
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
            <a href="mailto:thegreensbeautysalon@gmail.com" className="hover:text-emerald-400 transition-colors">
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
  <nav
    id="mobile-sticky"
    className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-emerald-600 text-white border-t border-emerald-500 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.35)] transition-transform duration-300 ${showSticky ? "translate-y-0" : "translate-y-full pointer-events-none"}`}
  >
  <div className="grid grid-cols-4 text-center">
    {/* Back */}
    <button
      onClick={() => (typeof window !== "undefined" ? window.history.back() : null)}
      className="py-2.5 flex flex-col items-center justify-center gap-1 active:bg-emerald-700/40"
      aria-label="Go back"
    >
      <FiArrowLeft className="text-xl" />
      <span className="text-[11px] font-medium">Back</span>
    </button>

    {/* Call */}
    <a
      href="tel:+918891467678"
      className="py-2.5 flex flex-col items-center justify-center gap-1 active:bg-emerald-700/40"
      aria-label="Call us"
    >
      <FiPhone className="text-xl" />
      <span className="text-[11px] font-medium">Call</span>
    </a>

    {/* WhatsApp */}
    <a
      href="https://wa.me/918891467678?text=Hi%20Greens%20Beauty%20Salon%2C%20I%27d%20like%20to%20book%20an%20appointment."
      target="_blank"
      rel="noopener noreferrer"
      className="py-2.5 flex flex-col items-center justify-center gap-1 active:bg-emerald-700/40"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="text-xl" />
      <span className="text-[11px] font-medium">WhatsApp</span>
    </a>

    {/* Book */}
    <Link
      href="/book-appointment"
      className="py-2.5 flex flex-col items-center justify-center gap-1 active:bg-emerald-700/40"
      aria-label="Book appointment"
    >
      <FiCalendar className="text-xl" />
      <span className="text-[11px] font-medium">Book</span>
    </Link>
  </div>
  {/* iOS safe-area shim */}
  <div className="h-[env(safe-area-inset-bottom)]" />
</nav>

{/* Desktop helpers (left: Book, right: Top) */}
<div className="hidden md:block">
  {/* Book – bottom-left */}
  <div className="fixed bottom-6 left-6 z-50">
    <Link
      href="/book-appointment"
      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-white font-semibold shadow-lg hover:bg-emerald-700 active:scale-[0.98] transition"
      aria-label="Book appointment"
    >
      <FiCalendar className="text-lg" />
      <span>Book Appointment</span>
    </Link>
  </div>

  {/* Scroll to top – bottom-right */}
  <div className="fixed bottom-6 right-6 z-50">
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-white font-semibold shadow-lg hover:bg-emerald-700 active:scale-[0.98] transition"
      aria-label="Scroll to top"
    >
      <FiArrowUp className="text-lg" />
      <span>Top</span>
    </button>
  </div>
</div>
    </main>
  )
}
