"use client"
import { useState, useEffect, useMemo } from "react"
import { useCart } from "@/contexts/CartContext"
import Link from "next/link"
import Image from "next/image"
import { FiShoppingCart, FiPhone, FiMapPin, FiMail, FiInstagram } from "react-icons/fi"
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

const HERO_CATEGORIES = [
  {
    id: "home",
    name: "Home",
    iconUrl: "/icons/home-green-gray.png",
    backgroundImage: "/salon_bg_poster.jpg",
    videoSrc: "/home-bg-video.mp4",
    heroTitle: "Welcome to Greens Beauty Salon",
    heroDescription: "Here Beauty Begins with Peace of Mind", // Re-added description
    buttonLink: "#services",
    heroTitleColor: "text-white",
    heroDescriptionColor: "text-white",
    buttonBgColor: "bg-white",
    buttonTextColor: "text-[#522B8C]",
  },
  {
    id: "family-salon",
    name: "Family Salon",
    iconUrl: "/icons/users-green-gray.png",
    backgroundImage: "/family-salon-interior.png",
    heroTitle: "Family Salon",
    heroDescription:
      "Complete care for the whole family, offering a wide range of services for all ages and preferences.",
    buttonLink: "#services",
    heroTitleColor: "text-white",
    heroDescriptionColor: "text-white",
    buttonBgColor: "bg-white",
    buttonTextColor: "text-[#522B8C]",
  },
  {
    id: "beauty-studio",
    name: "Beauty Studio",
    iconUrl: "/icons/sparkles-green-gray.png",
    backgroundImage: "/beauty-studio-glam.png",
    heroTitle: "Beauty Studio",
    heroDescription:
      "Premium beauty treatments including facials, makeup, and skincare for a radiant and refreshed look.",
    buttonLink: "#services",
    heroTitleColor: "text-white",
    heroDescriptionColor: "text-white",
    buttonBgColor: "bg-white",
    buttonTextColor: "text-[#522B8C]",
  },
  {
    id: "celebrity-salon",
    name: "Celebrity Salon",
    iconUrl: "/icons/crown-green-gray.png",
    backgroundImage: "/celebrity-hair-styling.png",
    heroTitle: "Celebrity Salon",
    heroDescription:
      "Experience luxury styling and exclusive services fit for a celebrity, with top-tier products and experts.",
    buttonLink: "#services",
    heroTitleColor: "text-white",
    heroDescriptionColor: "text-white",
    buttonBgColor: "bg-white",
    buttonTextColor: "text-[#522B8C]",
  },
  {
    id: "makeover-studio",
    name: "Makeover Studio",
    iconUrl: "/icons/paintbrush-green-gray.png",
    backgroundImage: "/makeover-studio-transformation.png",
    heroTitle: "Makeover Studio",
    heroDescription: "Complete transformation services, from hair to makeup, for any occasion or personal desire.",
    buttonLink: "#services",
    heroTitleColor: "text-white",
    heroDescriptionColor: "text-white",
    buttonBgColor: "bg-white",
    buttonTextColor: "text-[#522B8C]",
  },
  {
    id: "bridal-lounge",
    name: "Bridal Lounge",
    iconUrl: "/icons/heart-green-gray.png",
    backgroundImage: "/bridal-makeup-lounge.png",
    heroTitle: "Bridal Lounge",
    heroDescription:
      "Specialized bridal services to make your big day unforgettable, ensuring you look your absolute best.",
    buttonLink: "#services",
    heroTitleColor: "text-white",
    heroDescriptionColor: "text-white",
    buttonBgColor: "bg-white",
    buttonTextColor: "text-[#522B8C]",
  },
  {
    id: "floral-studio",
    name: "Floral Studio",
    iconUrl: "/icons/flower-green-gray.png",
    backgroundImage: "/floral-arrangement-studio.png",
    heroTitle: "Floral Studio",
    heroDescription:
      "Artistic floral designs for all your events and special moments, crafted with passion and precision.",
    buttonLink: "#services",
    heroTitleColor: "text-white",
    heroDescriptionColor: "text-white",
    buttonBgColor: "bg-white",
    buttonTextColor: "text-[#522B8C]",
  },
  {
    id: "floral-decor",
    name: "Floral Decor",
    iconUrl: "/icons/leaf-green-gray.png",
    backgroundImage: "/elegant-floral-event.png",
    heroTitle: "Floral Decor",
    heroDescription:
      "Comprehensive event decoration services with stunning floral arrangements to elevate any celebration.",
    buttonLink: "#services",
    heroTitleColor: "text-white",
    heroDescriptionColor: "text-white",
    buttonBgColor: "bg-white",
    buttonTextColor: "text-[#522B8C]",
  },
  {
    id: "event-portfolio",
    name: "Event Portfolio",
    iconUrl: "/icons/gallery-green-gray.png",
    backgroundImage: "/event.jpg",
    heroTitle: "Event Portfolio",
    heroDescription:
      "Complete event solutions, from meticulous planning to flawless execution, for seamless celebrations.",
    buttonLink: "#services",
    heroTitleColor: "text-white",
    heroDescriptionColor: "text-white",
    buttonBgColor: "bg-white",
    buttonTextColor: "text-[#522B8C]",
  },
]

const WOMEN_SERVICES = [
  "Shahnaz Husain Facials",
  "Loreal Hair Coloring",
  "Loreal Hair Styling",
  "Premium Facials",
  "Basic Facials",
  "Threading",
  "Waxing",
  "Hair Cutting",
]

const MEN_SERVICES = [
  "Men's Haircut & Styling",
  "Beard Trim & Shave",
  "Men's Facials",
  "Hair Coloring for Men",
  "Manicure & Pedicure for Men",
  "Body Grooming",
  "Head Massage",
  "Hair Treatment",
]

export default function HomePage() {
  const { items, add } = useCart()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedHeroCategory, setSelectedHeroCategory] = useState<string>("home") // Default to 'home'
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

  const subServices = useMemo(() => {
    if (!expandedCat) return []
    const cat = categories.find((c) => c.id === expandedCat)
    return cat ? cat.services : []
  }, [expandedCat, categories])

  function addToCart(service: any) {
    add({ id: service.id, name: service.name, price: service.offerPrice ?? service.mrp })
  }

  const currentHeroContent = useMemo(() => {
    return HERO_CATEGORIES.find((cat) => cat.id === selectedHeroCategory) || HERO_CATEGORIES[0]
  }, [selectedHeroCategory])

  const currentGenderServices = useMemo(() => {
    return selectedGenderTab === "WOMEN" ? WOMEN_SERVICES : MEN_SERVICES
  }, [selectedGenderTab])

  return (
    <main className="bg-gray-900 min-h-screen font-sans text-gray-100">
      {/* HEADER */}
      <Header />

      {/* HERO SECTION */}
      <section className="relative flex flex-col overflow-hidden min-h-[70vh] md:min-h-[70vh]">
        {/* Categories Section (Light Grey Bar) */}
        <div className="w-full overflow-x-auto py-2 scrollbar-hide bg-gray-100 shadow-lg">
          <div className="flex gap-0 justify-start px-4 md:justify-center">
            {HERO_CATEGORIES.filter((cat) => cat.id !== "home").map((cat, idx) => (
              <motion.button
                key={cat.id}
                className={`flex flex-col items-center justify-center p-3 min-w-[100px] text-center transition-all duration-300 relative
                  ${
                    selectedHeroCategory === cat.id
                      ? `bg-white text-black shadow-md rounded-t-lg`
                      : "bg-transparent text-gray-600 hover:bg-gray-200"
                  }
                  ${idx === 0 ? "rounded-tl-lg" : ""}
                  ${idx === HERO_CATEGORIES.length - 1 ? "rounded-tr-lg" : ""}
                `}
                onClick={() => setSelectedHeroCategory(cat.id)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
              >
                <Image
                  src={cat.iconUrl || "/placeholder.svg"}
                  alt={cat.name}
                  width={32} // Increased icon size
                  height={32} // Increased icon size
                  className="w-8 h-8 mb-1" // Tailwind classes for size
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
            className="relative flex-1 w-full flex items-end justify-center p-8 text-center overflow-hidden pb-7" // Adjusted padding-bottom to pb-28
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
                poster={currentHeroContent.backgroundImage}
              >
                <source src={currentHeroContent.videoSrc} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={currentHeroContent.backgroundImage || "/placeholder.svg"}
                alt={currentHeroContent.name || "Background"}
                layout="fill"
                objectFit="cover"
                priority
                className="absolute inset-0 z-0"
              />
            )}
            {/* Dark gradient overlay for the bottom 50% */}
            <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-gray-900 to-transparent z-10" />{" "}
            {/* Increased height and intensity */}
            <div className="relative z-20 text-white max-w-3xl space-y-2">
              <h1 className={`text-2xl md:text-3xl font-bold tracking-wide ${currentHeroContent.heroTitleColor}`}>
                {currentHeroContent.heroTitle}
              </h1>
              {selectedHeroCategory === "home" ? (
                <p className={`text-base md:text-lg leading-relaxed ${currentHeroContent.heroDescriptionColor}`}>
                  {currentHeroContent.heroDescription}
                </p>
              ) : (
                <Link
                  href={currentHeroContent.buttonLink || "#"}
                  className="inline-flex px-8 py-2 font-semibold text-md shadow-lg transition-all duration-300 bg-transparent border-white text-[#ffffff] hover:scale-105"
                  style={{ border: "2px solid #fff" }}
                >
                  {"24 items | Rs. 300 onwards >"}
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* DISCOVER OUR RATES SECTION */}
      <section className="bg-gray-100 py-8 text-gray-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Discover Our Rates</h2>
          <div className="flex justify-center gap-4 mb-6">
            <button
              className={`px-6 py-3 rounded-md font-bold transition-colors duration-300 ${
                selectedGenderTab === "WOMEN"
                  ? "bg-pink-500 text-white"
                  : "bg-transparent text-pink-500 border border-pink-500"
              }`}
              onClick={() => setSelectedGenderTab("WOMEN")}
            >
              For WOMEN
            </button>
            <button
              className={`px-6 py-3 rounded-md font-bold transition-colors duration-300 ${
                selectedGenderTab === "MEN"
                  ? "bg-blue-500 text-white"
                  : "bg-transparent text-blue-500 border border-blue-500"
              }`}
              onClick={() => setSelectedGenderTab("MEN")}
            >
              For MEN
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-lg">
            {currentGenderServices.map((service, idx) => (
              <Link
                key={idx}
                href="#" // You might want to replace '#' with actual service links
                className={`whitespace-nowrap ${
                  selectedGenderTab === "WOMEN" ? "text-pink-500" : "text-blue-500"
                } hover:underline`}
              >
                {service}
                {idx < currentGenderServices.length - 1 && <span className="mx-2 text-gray-400">•</span>}
              </Link>
            ))}
          </div>
        </div>
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
          </motion.div>
          <div className="space-y-8">
            <AnimatePresence>
              {categories.map((cat, idx) => {
                const isOpen = expandedCat === cat.id
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-md rounded-3xl shadow-lg border border-gray-700/50 overflow-hidden hover:shadow-green-400/20 hover:border-green-400/40 transform hover:scale-[1.02] transition-all duration-300"
                  >
                    <motion.button
                      onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                      className="w-full p-8 focus:outline-none"
                      whileHover={{ backgroundColor: "rgba(65, 235, 112, 0.05)" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <img
                              src={cat.imageUrl || "/placeholder.svg?height=240&width=320"}
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
                          <div className="space-y-6">
                            {subServices.map((svc) => (
                              <div
                                key={svc.id}
                                className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-6">
                                  <img
                                    src={svc.imageUrl || "/placeholder.svg?height=240&width=320"}
                                    alt={svc.name}
                                    className="w-24 h-18 object-cover rounded-xl shadow-lg border border-gray-600/50"
                                    style={{ aspectRatio: "4/3" }}
                                  />
                                  <div>
                                    <h4 className="font-bold text-xl" style={{ color: "#41eb70" }}>
                                      {svc.name}
                                    </h4>
                                    <p className="text-gray-300 text-sm mb-1">{svc.caption}</p>
                                    {svc.minPrice != null && (
                                      <span className="font-bold" style={{ color: "#41eb70" }}>
                                        From ₹{svc.minPrice}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Link
                                  href={`/services/${svc.id}`}
                                  prefetch={false}
                                  className="text-green-400 underline text-sm font-semibold hover:text-green-300"
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
            </AnimatePresence>
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
              Experience the difference with our premium service variants and professional expertise
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
              <p className="text-gray-300 text-lg leading-relaxed">
                TC 45/215, Kunjalumood Junction, Karamana PO, Trivandrum
              </p>
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
                  rel="noopener noreferrer"
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
