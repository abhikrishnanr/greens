"use client"

import { useState, useEffect, useMemo } from "react"
import { useCart } from "@/contexts/CartContext"
import Link from "next/link"
import { FiShoppingCart, FiPhone, FiMapPin, FiMail, FiInstagram, FiArrowRight, FiSearch, FiX } from "react-icons/fi"
import { Award, Users, Sparkles, Star, ChevronRight } from "lucide-react"
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

const QUICK_STATS = [
  { number: "15+", label: "Years of Excellence", icon: <Award className="w-8 h-8" /> },
  { number: "10K+", label: "Happy Clients", icon: <Users className="w-8 h-8" /> },
  { number: "50+", label: "Expert Services", icon: <Sparkles className="w-8 h-8" /> },
  { number: "4.9/5", label: "Average Rating", icon: <Star className="w-8 h-8" /> },
]

export default function HomePage() {
  const { items, add } = useCart()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedHeroCategory, setSelectedHeroCategory] = useState<string>("") // default empty until load
  const [heroTabs, setHeroTabs] = useState<any[]>([])
  const [heroLoading, setHeroLoading] = useState(true)
  const [selectedGenderTab, setSelectedGenderTab] = useState<"WOMEN" | "MEN">("WOMEN")

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

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
        setError("Unable to fetch services.")
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

  // Filter categories and services based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories

    return categories
      .filter((category) => {
        const categoryMatch =
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.caption?.toLowerCase().includes(searchQuery.toLowerCase())
        const serviceMatch = category.services?.some(
          (service: any) =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.caption?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        return categoryMatch || serviceMatch
      })
      .map((category) => {
        if (searchQuery.trim()) {
          return {
            ...category,
            services: category.services?.filter(
              (service: any) =>
                service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                category.caption?.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
          }
        }
        return category
      })
  }, [categories, searchQuery])

  const subServices = useMemo(() => {
    if (!expandedCat) return []
    const cat = filteredCategories.find((c) => c.id === expandedCat)
    return cat ? cat.services : []
  }, [expandedCat, filteredCategories])

  function addToCart(service: any) {
    add({ id: service.id, name: service.name, price: service.offerPrice ?? service.mrp })
  }

  const currentHeroContent = useMemo(() => {
    if (heroTabs.length === 0) return {} as any
    return heroTabs.find((cat) => cat.id === selectedHeroCategory) || heroTabs[0]
  }, [selectedHeroCategory, heroTabs])

  const clearSearch = () => {
    setSearchQuery("")
  }

  const totalServicesFound = useMemo(() => {
    return filteredCategories.reduce((total, cat) => total + (cat.services?.length || 0), 0)
  }, [filteredCategories])

  return (
    <main className="bg-white min-h-screen font-sans text-gray-800">
      {/* HEADER */}
      <Header />

      {/* HERO SECTION (UNCHANGED) */}
      {heroTabs.length > 0 && (
        <section className="relative flex flex-col overflow-hidden min-h-[70vh] md:min-h-[70vh]">
          {heroLoading || heroTabs.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-gray-400">Loading hero content...</div>
          ) : (
            <>
              <div className="w-full overflow-x-auto py-2 scrollbar-hide bg-gray-100 shadow-lg">
                <div className="flex gap-0 justify-start px-4 md:justify-center">
                  {heroTabs
                    .filter((cat) => cat.id !== "home")
                    .map((cat, idx) => (
                      <motion.button
                        key={cat.id}
                        className={`flex flex-col items-center justify-center p-3 min-w-[100px] text-center transition-all duration-300 relative
                  ${
                    selectedHeroCategory === cat.id
                      ? `bg-white text-black shadow-md rounded-t-lg`
                      : "bg-transparent text-gray-600 hover:bg-gray-200"
                  }
                  ${idx === 0 ? "rounded-tl-lg" : ""}
                  ${idx === heroTabs.length - 1 ? "rounded-tr-lg" : ""}
                `}
                        onClick={() => setSelectedHeroCategory(cat.id)}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
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
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHeroContent.id}
                  className="relative flex-1 w-full flex items-end justify-center p-8 text-center overflow-hidden pb-7"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.8 }}
                >
                  {currentHeroContent.videoSrc && selectedHeroCategory === "home" ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                      poster={currentHeroContent.backgroundUrl}
                    >
                      <source src={currentHeroContent.videoSrc} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={currentHeroContent.backgroundUrl || "/placeholder.svg"}
                      alt={currentHeroContent.name || "Background"}
                      className="absolute inset-0 z-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-white to-transparent z-10" />
                  <div className="relative z-20 text-white max-w-3xl space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-white">
                      {currentHeroContent.heroTitle}
                    </h1>
                    {selectedHeroCategory === "home" ? (
                      <p className="text-base md:text-lg leading-relaxed text-white">
                        {currentHeroContent.heroDescription}
                      </p>
                    ) : (
                      <Link
                        href={`/hero-tabs/${currentHeroContent.slug || currentHeroContent.id}`}
                        className="inline-flex px-8 py-2 font-semibold text-md shadow-lg transition-all duration-300 bg-transparent border-white text-[#ffffff] hover:scale-105"
                        style={{ border: "2px solid #fff" }}
                      >
                        {currentHeroContent.buttonLabel || "Explore Now >"}
                      </Link>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </section>
      )}

      {/* --- NEW LIGHT-THEMED SECTIONS START HERE --- */}

      {/* WHY CHOOSE US SECTION */}
      <section className="py-20 sm:py-24 bg-emerald-50/50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-2">Our Commitment</h2>
            <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              The Greens Salon Experience
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {QUICK_STATS.map((stat, idx) => (
              <motion.div
                key={idx}
                className="text-center p-6"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <div className="flex justify-center items-center mb-4 text-emerald-500">{stat.icon}</div>
                <p className="text-3xl font-bold text-stone-900 mb-1">{stat.number}</p>
                <p className="text-stone-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURE TREATMENTS SECTION */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-2">Client Favorites</h2>
            <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Our Signature Treatments
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.slice(0, 4).map((category, idx) => (
                <motion.div
                  key={category.id}
                  className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <img
                    src={category.imageUrl || `/placeholder.svg?height=400&width=300&query=${category.name}`}
                    alt={category.name}
                    className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                    <p className="text-sm opacity-80 mb-4 line-clamp-2">{category.caption}</p>
                    <Link
                      href={`/services/${category.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                    >
                      Explore Services <FiArrowRight />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <button
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
            >
              View All Our Services
            </button>
          </div>
        </div>
      </section>

      {/* TAILORED EXPERIENCES (TIERS) SECTION */}
      <section className="py-20 sm:py-24 bg-gray-50 pattern-bg-1">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-2">Your Perfect Match</h2>
            <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Tailored Experiences
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.entries(TIER_LABELS).map(([key, { label, icon, description }], idx) => (
              <motion.div
                key={key}
                className="bg-white border border-gray-200/80 rounded-xl p-8 text-center flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <div className="mb-5">{icon}</div>
                <h3 className="text-2xl font-semibold mb-3 text-stone-800">{label}</h3>
                <p className="text-gray-600 text-sm leading-relaxed flex-grow">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ALL SERVICES SECTION */}
      <section id="services" className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-2">Our Full Menu</h2>
            <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Explore All Services
            </p>
          </motion.div>

          <motion.div
            className="max-w-2xl mx-auto mb-10"
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
                className="w-full py-4 pl-14 pr-6 text-gray-700 bg-white border-2 border-gray-200 rounded-full outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              )}
            </div>
          </motion.div>

          {loading ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-24 animate-pulse"></div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No services found</h3>
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
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-200/80"
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
                            <h3 className="text-lg font-bold text-emerald-700">{cat.name}</h3>
                            <p className="text-gray-600 text-sm">{cat.services?.length || 0} services</p>
                          </div>
                        </div>
                        <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                          <ChevronRight className="text-emerald-500" />
                        </motion.div>
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-5 pb-5 border-t border-gray-100"
                        >
                          <div className="pt-2">
                            <ul className="space-y-2">
                              {subServices.map((svc) => (
                                <li key={svc.id}>
                                  <Link
                                    href={`/services/${svc.id}`}
                                    className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
                                  >
                                    <span className="font-semibold text-gray-800 text-sm">{svc.name}</span>
                                    {svc.minPrice != null && (
                                      <span className="text-sm text-emerald-600 font-medium whitespace-nowrap">
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

      {/* BOOKING & CONTACT SECTION */}
      <section
        className="py-24 sm:py-32 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/serene-salon-interior.png')" }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-stone-800">Your Escape Awaits</h2>
            <p className="text-lg text-stone-600 mb-8">
              Ready to indulge in a moment of pure bliss? Book your appointment today and let our experts pamper you.
            </p>
            <button
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-500/30"
            >
              Book an Appointment
            </button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-100 text-gray-500 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center gap-6 mb-6 text-xl">
            <a href="tel:+918891467678" className="hover:text-emerald-600 transition-colors">
              <FiPhone />
            </a>
            <a href="mailto:greensalon@gmail.com" className="hover:text-emerald-600 transition-colors">
              <FiMail />
            </a>
            <a
              href="https://instagram.com/greensbeautysalon"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 transition-colors"
            >
              <FiInstagram />
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors">
              <FiMapPin />
            </a>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} Greens Beauty Salon. All Rights Reserved.</p>
          <p className="text-xs mt-2">TC 45/215, Kunjalumood Junction, Karamana PO, Trivandrum</p>
        </div>
      </footer>

      {/* CART BAR */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            className="fixed left-1/2 -translate-x-1/2 bottom-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-6 rounded-full shadow-2xl z-50 flex items-center justify-between w-full max-w-md"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiShoppingCart className="text-xl" />
                <span className="absolute -top-2 -right-2 bg-white text-emerald-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              </div>
              <span className="font-bold">
                {items.length} service{items.length > 1 ? "s" : ""} in cart
              </span>
            </div>
            <motion.button
              className="bg-white text-emerald-600 px-5 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg"
              onClick={() => (window.location.href = "/cart")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Cart
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
