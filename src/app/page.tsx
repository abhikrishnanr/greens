"use client"
import { useState, useEffect, useMemo } from "react"
import { useCart } from "@/contexts/CartContext"
import Link from "next/link"
import { FiShoppingCart, FiPhone, FiMapPin, FiMail, FiInstagram, FiArrowRight } from "react-icons/fi"
import { MdStar, MdDiamond, MdEco } from "react-icons/md"
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
    color: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-300/40",
    label: "Basic",
    icon: <MdEco className="inline mr-1 -mt-0.5 text-green-400" />,
    helper: "Simple, everyday care. Fast & affordable.",
  },
}

const POPULAR_SERVICES = [
  {
    name: "Shahnaz Husain Facials",
    category: "Facial",
    price: "₹2,500",
    image: "/placeholder.svg?height=200&width=300",
  },
  { name: "Loreal Hair Coloring", category: "Hair", price: "₹3,200", image: "/placeholder.svg?height=200&width=300" },
  { name: "Bridal Makeup", category: "Bridal", price: "₹8,000", image: "/placeholder.svg?height=200&width=300" },
  { name: "Men's Grooming", category: "Men", price: "₹1,200", image: "/placeholder.svg?height=200&width=300" },
]

const QUICK_STATS = [
  { number: "15+", label: "Years Experience", icon: "ri-time-line" },
  { number: "10K+", label: "Happy Clients", icon: "ri-user-heart-line" },
  { number: "50+", label: "Services", icon: "ri-service-line" },
  { number: "4.9", label: "Rating", icon: "ri-star-line" },
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

  const subServices = useMemo(() => {
    if (!expandedCat) return []
    const cat = categories.find((c) => c.id === expandedCat)
    return cat ? cat.services : []
  }, [expandedCat, categories])

  function addToCart(service: any) {
    add({ id: service.id, name: service.name, price: service.offerPrice ?? service.mrp })
  }

  const currentHeroContent = useMemo(() => {
    if (heroTabs.length === 0) return {} as any
    return heroTabs.find((cat) => cat.id === selectedHeroCategory) || heroTabs[0]
  }, [selectedHeroCategory, heroTabs])

  return (
    <main className="bg-white min-h-screen font-sans text-gray-900">
      {/* HEADER */}
      <Header />

      {/* HERO SECTION */}
      {heroTabs.length > 0 && (
        <section className="relative flex flex-col overflow-hidden min-h-[70vh] md:min-h-[70vh]">
          {heroLoading || heroTabs.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-gray-400">Loading hero content...</div>
          ) : (
            <>
              {/* Categories Section (Light Grey Bar) */}
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

              {/* Dynamic Hero Content Area */}
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

      {/* QUICK STATS SECTION */}
      <section className="py-12 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {QUICK_STATS.map((stat, idx) => (
              <motion.div
                key={idx}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <i className={`${stat.icon} text-white text-2xl`}></i>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">{stat.number}</div>
                <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR SERVICES FROM ACTUAL DATA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#41eb70" }}>
              Popular Services
            </h2>
            <p className="text-gray-600 text-lg">Most loved treatments by our clients</p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-64 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {categories.slice(0, 4).map((category, idx) => {
                const firstService = category.services?.[0]
                return (
                  <motion.div
                    key={category.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={category.imageUrl || "/placeholder.svg?height=200&width=300"}
                        alt={category.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {category.services?.length || 0} Services
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-gray-900">{category.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{category.caption}</p>
                      <div className="flex items-center justify-between">
                        {firstService?.minPrice && (
                          <span className="text-green-600 font-bold text-lg">From ₹{firstService.minPrice}</span>
                        )}
                        <Link
                          href={`/services/${category.id}`}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          View Services
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg"
            >
              View All Services
              <FiArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* SERVICE TIERS SECTION */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#41eb70" }}>
              Choose Your Experience
            </h2>
            <p className="text-gray-600 text-lg">Three tiers of service to match your needs and budget</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {Object.entries(TIER_LABELS).map(([k, { label, icon }], idx) => (
              <motion.div
                key={k}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                <div className="text-3xl mb-4 flex justify-center">{icon}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "#41eb70" }}>
                  {label}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {k === "deluxe" && "Premium brands like Shahnaz Husain & L'Oréal for luxury experience"}
                  {k === "premium" && "Quality brands like Biotique & Matrix for excellent results"}
                  {k === "basic" && "Essential care with proven techniques at affordable prices"}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPACT SERVICES SECTION */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#41eb70" }}>
              All Services
            </h2>
            <p className="text-gray-600 text-lg">Explore our complete range of beauty and wellness services</p>
          </motion.div>

          {loading ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-20 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {categories.map((cat, idx) => {
                const isOpen = expandedCat === cat.id
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200"
                  >
                    <motion.button
                      onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                      className="w-full p-6 focus:outline-none"
                      whileHover={{ backgroundColor: "rgba(65, 235, 112, 0.02)" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={cat.imageUrl || "/placeholder.svg?height=60&width=60"}
                            alt={cat.name}
                            className="w-16 h-16 rounded-lg object-cover shadow-sm"
                          />
                          <div className="text-left">
                            <h3 className="text-xl font-bold mb-1" style={{ color: "#41eb70" }}>
                              {cat.name}
                            </h3>
                            <p className="text-gray-600 text-sm">{cat.caption}</p>
                            <p className="text-gray-500 text-xs mt-1">{cat.services?.length || 0} services available</p>
                          </div>
                        </div>
                        <motion.div
                          className="flex items-center gap-2"
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-sm text-gray-500 hidden md:block">
                            {isOpen ? "Hide" : "View"} Services
                          </span>
                          <FiArrowRight className="text-green-500 text-xl" />
                        </motion.div>
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                          className="px-6 pb-6 border-t border-gray-100"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            {subServices.map((svc) => (
                              <div
                                key={svc.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <img
                                  src={svc.imageUrl || "/placeholder.svg?height=40&width=40"}
                                  alt={svc.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{svc.name}</h4>
                                  <p className="text-gray-600 text-xs line-clamp-1">{svc.caption}</p>
                                  {svc.minPrice != null && (
                                    <span className="text-green-600 font-bold text-sm">From ₹{svc.minPrice}</span>
                                  )}
                                </div>
                                <Link
                                  href={`/services/${svc.id}`}
                                  className="text-green-500 hover:text-green-600 font-medium text-sm whitespace-nowrap"
                                >
                                  View Details
                                </Link>
                              </div>
                            ))}
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

      {/* CONTACT & FOOTER COMBINED */}
      <section className="py-16 bg-gradient-to-b from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#41eb70" }}>
              Ready to Book?
            </h2>
            <p className="text-gray-300 text-lg">Get in touch with us today</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <motion.div
              className="text-center md:text-left"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center justify-center md:justify-start gap-2">
                <FiMapPin style={{ color: "#41eb70" }} />
                Visit Our Salon
              </h3>
              <p className="text-gray-300 leading-relaxed">
                TC 45/215, Kunjalumood Junction
                <br />
                Karamana PO, Trivandrum
              </p>
            </motion.div>

            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.a
                href="tel:+918891467678"
                className="flex items-center gap-3 p-3 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-all group"
                whileHover={{ scale: 1.02 }}
              >
                <FiPhone className="text-green-400 text-lg" />
                <span>+91 8891 467678</span>
              </motion.a>

              <motion.a
                href="mailto:greensalon@gmail.com"
                className="flex items-center gap-3 p-3 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-all group"
                whileHover={{ scale: 1.02 }}
              >
                <FiMail className="text-blue-400 text-lg" />
                <span>greensalon@gmail.com</span>
              </motion.a>

              <motion.a
                href="https://instagram.com/greensbeautysalon"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-pink-500/20 rounded-lg hover:bg-pink-500/30 transition-all group"
                whileHover={{ scale: 1.02 }}
              >
                <FiInstagram className="text-pink-400 text-lg" />
                <span>@greensbeautysalon</span>
              </motion.a>
            </motion.div>
          </div>

          <div className="text-center pt-8 border-t border-gray-700">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Greens Beauty Salon. All rights reserved.</p>
          </div>
        </div>
      </section>

      {/* CART BAR */}
      <AnimatePresence>
        {items.length > 0 && (
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
                  {items.length} service{items.length > 1 ? "s" : ""} selected
                </span>
                <p className="text-sm opacity-90">Ready to book your appointment</p>
              </div>
            </div>
            <motion.button
              className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
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
