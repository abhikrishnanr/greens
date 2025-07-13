"use client"

import { useState, useEffect, useMemo } from "react"
import { FiShoppingCart, FiPhone, FiSearch, FiMapPin, FiMail, FiInstagram, FiX, FiEye } from "react-icons/fi"
import { MdMale, MdFemale, MdStar, MdDiamond, MdEco } from "react-icons/md"
import { motion, AnimatePresence } from "framer-motion"
import Header from "@/components/Header"

// ---- Tier/Type labels & badge colors ----
const TIER_LABELS = {
  deluxe: {
    color: "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/40",
    label: "Deluxe",
    icon: <MdStar className="inline mr-1 -mt-0.5 text-yellow-400" />,
    helper: "Luxury & exclusive brands for the best experience.",
  },
  premium: {
    color: "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/40",
    label: "Premium",
    icon: <MdDiamond className="inline mr-1 -mt-0.5 text-blue-400" />,
    helper: "Best value—trusted brands & great results.",
  },
  basic: {
    color: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/40",
    label: "Basic",
    icon: <MdEco className="inline mr-1 -mt-0.5 text-green-400" />,
    helper: "Simple, everyday care. Fast & affordable.",
  },
}

export default function HomePage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedCat, setExpandedCat] = useState(null)
  const [expandedService, setExpandedService] = useState(null)
  const [cart, setCart] = useState([])
  const [error, setError] = useState(null)
  const [gender, setGender] = useState("all")
  const [tier, setTier] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    setLoading(true)
    fetch("/api/services/all")
      .then((res) => {
        if (!res.ok) throw new Error("API error")
        return res.json()
      })
      .then((data) => {
        setServices(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((e) => {
        setError("Unable to fetch services.")
        setLoading(false)
      })
  }, [])

  // --- Filtering logic ---
  const filteredServices = useMemo(() => {
    return services.filter(
      (s) =>
        (gender === "all" || (s.applicable_to && s.applicable_to.toLowerCase() === gender)) &&
        (tier === "all" || (s.tier && s.tier.toLowerCase() === tier)) &&
        (!search ||
          (s.main_service_name && s.main_service_name.toLowerCase().includes(search.toLowerCase())) ||
          (s.sub_category && s.sub_category.toLowerCase().includes(search.toLowerCase())) ||
          (s.caption && s.caption.toLowerCase().includes(search.toLowerCase()))),
    )
  }, [services, gender, tier, search])

  const categories = useMemo(() => {
    const map = new Map()
    filteredServices.forEach((s) => {
      if (!map.has(s.main_service_name)) {
        map.set(s.main_service_name, {
          name: s.main_service_name,
          caption: s.main_service_name_description || s.caption,
          image: s.category_image_url,
          tiers: new Set(s.tier ? [s.tier] : []),
        })
      } else if (s.tier) {
        map.get(s.main_service_name).tiers.add(s.tier)
      }
    })
    return Array.from(map.values()).map((c) => ({
      ...c,
      tiers: Array.from(c.tiers),
    }))
  }, [filteredServices])

  const subServices = useMemo(() => {
    if (!expandedCat) return []
    return filteredServices.filter((s) => s.main_service_name === expandedCat)
  }, [expandedCat, filteredServices])

  function addToCart(service) {
    setCart((prev) => (prev.find((item) => item.id === service.id) ? prev : [...prev, { ...service, qty: 1 }]))
  }

  return (
    <main className="bg-gray-900 min-h-screen font-sans text-gray-100">
      {/* HEADER */}
      <Header cartCount={cart.length} />

      {/* HERO SECTION WITH VIDEO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/salon_bg_poster.jpg"
        >
          <source src="/home-bg-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/70 to-gray-900/80" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400/30 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + i * 8}%`,
              }}
            />
          ))}
        </div>

        <motion.div
          className="relative z-10 text-center px-6 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.img
            src="/logo.png"
            alt="Greens Beauty Salon Logo"
            className="h-24 mx-auto drop-shadow-2xl mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.5, type: "spring" }}
          />
          <motion.h1
            className="text-6xl md:text-8xl font-bold tracking-wide mb-8 font-[Pacifico]"
            style={{ color: "#41eb70" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Greens Beauty Salon
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            Discover premium beauty treatments and services designed to enhance your natural beauty and provide ultimate
            relaxation.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <motion.a
              href="#services"
              className="px-8 py-4 rounded-full border-2 font-semibold text-lg shadow-lg transition-all duration-300"
              style={{
                borderColor: "#41eb70",
                color: "#41eb70",
              }}
              whileHover={{
                scale: 1.05,
                y: -2,
                backgroundColor: "#41eb70",
                color: "#1f2937",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Services
            </motion.a>
            <motion.a
              href="tel:+918891467678"
              className="px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: "#41eb70",
                color: "#1f2937",
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Book Now
            </motion.a>
          </motion.div>
        </motion.div>
      </section>

      {/* SERVICE DIVISIONS */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "#41eb70" }}>
              Our Service Divisions
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience comprehensive beauty and wellness services in our luxurious environment
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: "ri-group-line",
                title: "Family Salon",
                desc: "Complete care for the whole family",
                gradient: "from-blue-500 to-blue-600",
              },
              {
                icon: "ri-magic-line",
                title: "Beauty Studio",
                desc: "Premium beauty treatments",
                gradient: "from-purple-500 to-purple-600",
              },
              {
                icon: "ri-vip-crown-line",
                title: "Celebrity Salon",
                desc: "Luxury styling experience",
                gradient: "from-amber-500 to-amber-600",
              },
              {
                icon: "ri-brush-line",
                title: "Makeover Studio",
                desc: "Complete transformation",
                gradient: "from-pink-500 to-pink-600",
              },
              {
                icon: "ri-hearts-line",
                title: "Bridal Lounge",
                desc: "Special bridal services",
                gradient: "from-rose-500 to-rose-600",
              },
              {
                icon: "ri-flower-line",
                title: "Floral Studio",
                desc: "Artistic floral designs",
                gradient: "from-green-500 to-green-600",
              },
              {
                icon: "ri-plant-line",
                title: "Floral Decor",
                desc: "Event decoration services",
                gradient: "from-emerald-500 to-emerald-600",
              },
              {
                icon: "ri-gallery-line",
                title: "Event Portfolio",
                desc: "Complete event solutions",
                gradient: "from-indigo-500 to-indigo-600",
              },
            ].map((svc, idx) => (
              <motion.div
                key={idx}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700/50 h-full group-hover:border-green-400/30">
                  <motion.div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${svc.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 5 }}
                  >
                    <i className={`${svc.icon} text-white text-2xl`}></i>
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{svc.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#41eb70" }}>
              Our Services
            </h2>
            {tier !== "all" && <p className="text-lg text-gray-400 italic">{TIER_LABELS[tier]?.helper}</p>}
          </motion.div>

          {/* FILTERS & SEARCH - POSITIONED BELOW "OUR SERVICES" HEADING */}
          <motion.div
            className="max-w-6xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50">
              {/* Desktop Layout: Search centered above, filters side-by-side below */}
              <div className="hidden lg:block">
                {/* Search Bar - Centered Above */}
                <div className="flex justify-center mb-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-green-300 text-sm font-semibold tracking-wide">Search Services</div>
                    <div className="relative w-96">
                      <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 text-lg" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search services..."
                        className="w-full bg-gray-700/50 backdrop-blur-sm rounded-full px-12 py-3 border border-gray-600/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                      />
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
                        >
                          <FiX />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Filters Side-by-Side */}
                <div className="grid grid-cols-2 gap-12">
                  {/* Gender Filters */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-green-300 text-sm font-semibold tracking-wide">Filter by Gender</div>
                    <div className="flex gap-3">
                      <CompactFilterTab
                        icon={<MdMale />}
                        label="Male"
                        active={gender === "male"}
                        onClick={() => setGender("male")}
                        activeColor="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      />
                      <CompactFilterTab
                        icon={<MdFemale />}
                        label="Female"
                        active={gender === "female"}
                        onClick={() => setGender("female")}
                        activeColor="bg-gradient-to-r from-pink-500 to-pink-600 text-white"
                      />
                      <CompactFilterTab
                        label="All"
                        active={gender === "all"}
                        onClick={() => setGender("all")}
                        activeColor="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      />
                    </div>
                  </div>

                  {/* Service Type Filters */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-green-300 text-sm font-semibold tracking-wide">Filter by Service Type</div>
                    <div className="flex gap-2 flex-wrap justify-center">
                      <CompactFilterTab
                        label="All"
                        active={tier === "all"}
                        onClick={() => setTier("all")}
                        activeColor="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      />
                      <CompactFilterTab
                        icon={<MdStar className="text-yellow-400" />}
                        label="Deluxe"
                        active={tier === "deluxe"}
                        onClick={() => setTier("deluxe")}
                        activeColor="bg-gradient-to-r from-yellow-500 to-amber-600 text-white"
                      />
                      <CompactFilterTab
                        icon={<MdDiamond className="text-blue-400" />}
                        label="Premium"
                        active={tier === "premium"}
                        onClick={() => setTier("premium")}
                        activeColor="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                      />
                      <CompactFilterTab
                        icon={<MdEco className="text-green-400" />}
                        label="Basic"
                        active={tier === "basic"}
                        onClick={() => setTier("basic")}
                        activeColor="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Layout: Stacked */}
              <div className="lg:hidden space-y-6">
                {/* Search Bar */}
                <div className="flex flex-col items-center gap-3">
                  <div className="text-green-300 text-sm font-semibold tracking-wide">Search Services</div>
                  <div className="relative w-full max-w-sm">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 text-lg" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search services..."
                      className="w-full bg-gray-700/50 backdrop-blur-sm rounded-full px-12 py-3 border border-gray-600/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                </div>

                {/* Gender Filters */}
                <div className="flex flex-col items-center gap-3">
                  <div className="text-green-300 text-sm font-semibold tracking-wide">Filter by Gender</div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <CompactFilterTab
                      icon={<MdMale />}
                      label="Male"
                      active={gender === "male"}
                      onClick={() => setGender("male")}
                      activeColor="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                    />
                    <CompactFilterTab
                      icon={<MdFemale />}
                      label="Female"
                      active={gender === "female"}
                      onClick={() => setGender("female")}
                      activeColor="bg-gradient-to-r from-pink-500 to-pink-600 text-white"
                    />
                    <CompactFilterTab
                      label="All"
                      active={gender === "all"}
                      onClick={() => setGender("all")}
                      activeColor="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    />
                  </div>
                </div>

                {/* Service Type Filters */}
                <div className="flex flex-col items-center gap-3">
                  <div className="text-green-300 text-sm font-semibold tracking-wide">Filter by Service Type</div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <CompactFilterTab
                      label="All"
                      active={tier === "all"}
                      onClick={() => setTier("all")}
                      activeColor="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    />
                    <CompactFilterTab
                      icon={<MdStar className="text-yellow-400" />}
                      label="Deluxe"
                      active={tier === "deluxe"}
                      onClick={() => setTier("deluxe")}
                      activeColor="bg-gradient-to-r from-yellow-500 to-amber-600 text-white"
                    />
                    <CompactFilterTab
                      icon={<MdDiamond className="text-blue-400" />}
                      label="Premium"
                      active={tier === "premium"}
                      onClick={() => setTier("premium")}
                      activeColor="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                    />
                    <CompactFilterTab
                      icon={<MdEco className="text-green-400" />}
                      label="Basic"
                      active={tier === "basic"}
                      onClick={() => setTier("basic")}
                      activeColor="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="max-w-7xl mx-auto">
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-gray-600 border-t-green-400 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 text-lg">Loading services...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-20">
                <p className="text-red-400 text-lg">{error}</p>
              </div>
            )}

            {!loading && !error && categories.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No services found.</p>
              </div>
            )}

            {/* Category Cards */}
            <div className="space-y-8">
              <AnimatePresence>
                {categories.map((cat, idx) => {
                  const isOpen = expandedCat === cat.name
                  return (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden hover:shadow-green-400/10 transition-all duration-300"
                    >
                      <motion.button
                        onClick={() => setExpandedCat(isOpen ? null : cat.name)}
                        className="w-full p-8 focus:outline-none"
                        whileHover={{ backgroundColor: "rgba(65, 235, 112, 0.05)" }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="relative">
                              <img
                                src={cat.image || "/placeholder.svg?height=240&width=320"}
                                alt={cat.name}
                                className="w-24 h-18 rounded-2xl object-cover shadow-xl border border-gray-600/50"
                                style={{ aspectRatio: "4/3" }}
                              />
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                <MdStar className="text-white text-sm" />
                              </div>
                            </div>
                            <div className="text-left">
                              <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#41eb70" }}>
                                {cat.name}
                              </h3>
                              <p className="text-gray-300 text-lg mb-4">{cat.caption}</p>
                              <div className="flex flex-wrap gap-2">
                                {cat.tiers.map((tier) => (
                                  <span
                                    key={tier}
                                    className={`px-3 py-1 border font-semibold rounded-full text-sm flex items-center ${TIER_LABELS[tier]?.color}`}
                                  >
                                    {TIER_LABELS[tier]?.icon}
                                    {TIER_LABELS[tier]?.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <motion.span
                            className="text-3xl"
                            style={{ color: "#41eb70" }}
                            animate={{ rotate: isOpen ? 90 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            ▶
                          </motion.span>
                        </div>
                      </motion.button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4 }}
                            className="px-8 pb-8"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {subServices.map((svc, svcIdx) => (
                                <motion.div
                                  key={svc.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.4, delay: svcIdx * 0.1 }}
                                  className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30 hover:shadow-xl hover:shadow-green-400/10 transition-all duration-300 group"
                                  whileHover={{ y: -5 }}
                                >
                                  <div className="mb-4">
                                    <img
                                      src={svc.image_url || "/placeholder.svg?height=240&width=320"}
                                      alt={svc.sub_category}
                                      className="w-full h-32 object-cover rounded-xl shadow-lg border border-gray-600/50 group-hover:scale-105 transition-transform duration-300"
                                      style={{ aspectRatio: "4/3" }}
                                    />
                                  </div>

                                  <div className="mb-4">
                                    <h4
                                      className="font-bold text-xl mb-2 group-hover:text-green-300 transition-colors"
                                      style={{ color: "#41eb70" }}
                                    >
                                      {svc.sub_category}
                                    </h4>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {svc.tier && (
                                        <span
                                          className={`px-2 py-1 border font-semibold rounded-full text-xs flex items-center ${TIER_LABELS[svc.tier]?.color}`}
                                        >
                                          {TIER_LABELS[svc.tier]?.icon}
                                          {TIER_LABELS[svc.tier]?.label}
                                        </span>
                                      )}
                                      {svc.offer_price && svc.offer_price < svc.original_price && (
                                        <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                          OFFER
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
                                      {svc.description?.replace(/<[^>]+>/g, "").substring(0, 80)}...
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div>
                                      {svc.offer_price && svc.offer_price < svc.original_price ? (
                                        <div className="flex items-center gap-2">
                                          <span className="line-through text-gray-400 text-sm">
                                            ₹{svc.original_price}
                                          </span>
                                          <span className="font-bold text-xl" style={{ color: "#41eb70" }}>
                                            ₹{svc.offer_price}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="font-bold text-xl" style={{ color: "#41eb70" }}>
                                          ₹{svc.original_price}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <motion.button
                                        className="px-3 py-2 border-2 rounded-full text-sm font-semibold hover:bg-green-400/10 transition-all flex items-center gap-1"
                                        style={{
                                          borderColor: "#41eb70",
                                          color: "#41eb70",
                                        }}
                                        onClick={() => setExpandedService(svc)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <FiEye className="text-xs" />
                                        View
                                      </motion.button>
                                      <motion.button
                                        className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold shadow-lg hover:shadow-green-500/25 transition-all flex items-center gap-1"
                                        onClick={() => addToCart(svc)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <FiShoppingCart className="text-xs" />
                                        Book
                                      </motion.button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE DETAILS MODAL */}
      <AnimatePresence>
        {expandedService && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedService(null)}
          >
            <motion.div
              className="bg-gray-800 rounded-3xl max-w-lg w-full p-8 relative shadow-2xl border border-gray-700/50"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute right-4 top-4 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                onClick={() => setExpandedService(null)}
              >
                <FiX />
              </button>

              <div className="text-center mb-8">
                <img
                  src={expandedService.image_url || "/placeholder.svg?height=240&width=320"}
                  alt={expandedService.sub_category}
                  className="w-40 h-30 rounded-2xl mx-auto mb-6 shadow-xl object-cover border border-gray-600/50"
                  style={{ aspectRatio: "4/3" }}
                />
                <h3 className="font-bold text-2xl mb-4" style={{ color: "#41eb70" }}>
                  {expandedService.sub_category}
                </h3>

                <div className="flex items-center gap-3 justify-center mb-6 flex-wrap">
                  {expandedService.tier && (
                    <span
                      className={`px-3 py-1 border font-semibold rounded-full text-sm flex items-center ${TIER_LABELS[expandedService.tier]?.color}`}
                    >
                      {TIER_LABELS[expandedService.tier]?.icon}
                      {TIER_LABELS[expandedService.tier]?.label}
                    </span>
                  )}
                  {expandedService.offer_price && expandedService.offer_price < expandedService.original_price && (
                    <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      SPECIAL OFFER
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  {expandedService.offer_price && expandedService.offer_price < expandedService.original_price ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-gray-400 line-through text-lg">₹{expandedService.original_price}</span>
                      <span className="font-extrabold text-3xl" style={{ color: "#41eb70" }}>
                        ₹{expandedService.offer_price}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-3xl" style={{ color: "#41eb70" }}>
                      ₹{expandedService.original_price}
                    </span>
                  )}
                </div>
              </div>

              <div
                className="text-gray-300 mb-8 text-center leading-relaxed"
                dangerouslySetInnerHTML={{ __html: expandedService.description }}
              />

              <motion.button
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-xl hover:shadow-green-500/25 transition-all flex items-center gap-2 justify-center"
                onClick={() => {
                  addToCart(expandedService)
                  setExpandedService(null)
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiShoppingCart /> Book This Service
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART BAR */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            className="fixed left-6 right-6 bottom-6 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white py-4 px-6 rounded-2xl shadow-2xl z-50 flex items-center justify-between backdrop-blur-sm"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FiShoppingCart className="text-xl" />
              </div>
              <div>
                <span className="font-bold text-lg">
                  {cart.length} service{cart.length > 1 ? "s" : ""} selected
                </span>
                <p className="text-sm opacity-90">Ready to book your appointment</p>
              </div>
            </div>
            <motion.button
              className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
              onClick={() => alert("Proceeding to cart!")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Cart
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ABOUT SECTION */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "#41eb70" }}>
              💫 Why Choose Greens Beauty?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the difference with our premium service tiers and professional expertise
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {Object.entries(TIER_LABELS).map(([k, { label, icon }], idx) => (
              <motion.div
                key={k}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl hover:shadow-green-400/10 transition-all duration-300 border border-gray-700/50"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="text-4xl mb-6 flex justify-center">{icon}</div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: "#41eb70" }}>
                  {label}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {k === "deluxe" &&
                    "Luxury brands and exclusive treatments. For those who demand the best in care and results. Shahnaz Husain, L'Oréal and more."}
                  {k === "premium" &&
                    "Leading brands, superior results, great value. We use Biotique, Matrix, Nature's Way, Oxyglow, and more."}
                  {k === "basic" &&
                    "Effective, everyday self-care using classic techniques and creams. Fast and budget-friendly."}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4" style={{ color: "#41eb70" }}>
              Our Promise
            </h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              We believe in comfort, care, and giving you the best advice—always. Ask us anything, and our team will
              guide you for the perfect service and product choice.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "#41eb70" }}>
              Get In Touch
            </h2>
            <p className="text-xl text-gray-400">Ready to book your appointment? We're here to help!</p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: "#41eb70" }}>
                <FiMapPin style={{ color: "#41eb70" }} /> Visit Us
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">TC 45/215, Kunjalumood, Karamana PO, Trivandrum</p>
            </motion.div>

            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6" style={{ color: "#41eb70" }}>
                Get In Touch
              </h3>
              <div className="space-y-4">
                <motion.a
                  href="tel:+918891467678"
                  className="flex items-center gap-4 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 hover:bg-green-500/20 transition-all group"
                  whileHover={{ scale: 1.02 }}
                >
                  <FiPhone
                    className="text-xl group-hover:scale-110 transition-transform"
                    style={{ color: "#41eb70" }}
                  />
                  <span className="text-gray-200 font-medium">+91 8891 467678</span>
                  <span
                    className="ml-auto text-xs px-2 py-1 rounded-full font-bold"
                    style={{ backgroundColor: "rgba(65, 235, 112, 0.2)", color: "#41eb70" }}
                  >
                    Call
                  </span>
                </motion.a>

                <motion.a
                  href="mailto:greensalon@gmail.com"
                  className="flex items-center gap-4 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3 hover:bg-blue-500/20 transition-all group"
                  whileHover={{ scale: 1.02 }}
                >
                  <FiMail className="text-blue-400 text-xl group-hover:scale-110 transition-transform" />
                  <span className="text-gray-200 font-medium">greensalon@gmail.com</span>
                  <span className="ml-auto text-xs bg-blue-400/20 text-blue-400 px-2 py-1 rounded-full font-bold">
                    Email
                  </span>
                </motion.a>

                <motion.a
                  href="https://instagram.com/greensbeautysalon"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-4 bg-pink-500/10 border border-pink-500/30 rounded-xl px-4 py-3 hover:bg-pink-500/20 transition-all group"
                  whileHover={{ scale: 1.02 }}
                >
                  <FiInstagram className="text-pink-400 text-xl group-hover:scale-110 transition-transform" />
                  <span className="text-gray-200 font-medium">@greensbeautysalon</span>
                  <span className="ml-auto text-xs bg-pink-400/20 text-pink-400 px-2 py-1 rounded-full font-bold">
                    Instagram
                  </span>
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-8 text-gray-400 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <p className="text-sm">&copy; {new Date().getFullYear()} Greens Beauty Salon. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

// COMPACT FILTER TAB COMPONENT
function CompactFilterTab({ icon, label, active, onClick, activeColor }) {
  const baseStyle =
    "px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 border focus:outline-none shadow-md"
  const inactiveStyle = "bg-gray-800/50 text-gray-300 border-gray-700/50 hover:bg-gray-700/50 hover:scale-105"
  const style = active ? `${activeColor} border-transparent shadow-lg` : inactiveStyle

  return (
    <motion.button
      className={`${baseStyle} ${style} flex items-center justify-center gap-1 min-w-[70px]`}
      onClick={onClick}
      whileHover={{ scale: active ? 1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon && <span className="text-sm">{icon}</span>}
      <span>{label}</span>
    </motion.button>
  )
}
