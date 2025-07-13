'use client';
import { useState, useEffect, useMemo } from "react";
import { FiShoppingCart, FiPhone, FiSearch, FiMapPin, FiMail, FiInstagram } from "react-icons/fi";
import { MdMale, MdFemale, MdStar, MdDiamond, MdEco } from "react-icons/md";
import Header from "@/components/Header";

// ---- Tier/Type labels & badge colors ----
const TIER_LABELS = {
  deluxe: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    label: "Deluxe",
    icon: <MdStar className="inline mr-1 -mt-0.5 text-yellow-500" />,
    helper: "Luxury & exclusive brands for the best experience.",
  },
  premium: {
    color: "bg-blue-100 text-blue-700 border-blue-300",
    label: "Premium",
    icon: <MdDiamond className="inline mr-1 -mt-0.5 text-blue-400" />,
    helper: "Best value—trusted brands & great results.",
  },
  basic: {
    color: "bg-green-100 text-green-800 border-green-300",
    label: "Basic",
    icon: <MdEco className="inline mr-1 -mt-0.5 text-green-400" />,
    helper: "Simple, everyday care. Fast & affordable.",
  },
};

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCat, setExpandedCat] = useState(null);
  const [expandedService, setExpandedService] = useState(null);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);
  const [gender, setGender] = useState('all');
  const [tier, setTier] = useState('all');
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/services/all")
      .then(res => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then(data => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(e => {
        setError("Unable to fetch services.");
        setLoading(false);
      });
  }, []);

  // --- Filtering logic ---
  const filteredServices = useMemo(() => {
    return services.filter(s =>
      (gender === 'all' || (s.applicable_to && s.applicable_to.toLowerCase() === gender)) &&
      (tier === 'all' || (s.tier && s.tier.toLowerCase() === tier)) &&
      (
        !search ||
        (s.main_service_name && s.main_service_name.toLowerCase().includes(search.toLowerCase())) ||
        (s.sub_category && s.sub_category.toLowerCase().includes(search.toLowerCase())) ||
        (s.caption && s.caption.toLowerCase().includes(search.toLowerCase()))
      )
    );
  }, [services, gender, tier, search]);

  const categories = useMemo(() => {
    const map = new Map();
    filteredServices.forEach(s => {
      if (!map.has(s.main_service_name)) {
        map.set(s.main_service_name, {
          name: s.main_service_name,
          caption: s.main_service_name_description || s.caption,
          image: s.category_image_url,
          tiers: new Set(s.tier ? [s.tier] : [])
        });
      } else if (s.tier) {
        map.get(s.main_service_name).tiers.add(s.tier);
      }
    });
    return Array.from(map.values()).map(c => ({
      ...c,
      tiers: Array.from(c.tiers)
    }));
  }, [filteredServices]);

  const subServices = useMemo(() => {
    if (!expandedCat) return [];
    return filteredServices.filter(s => s.main_service_name === expandedCat);
  }, [expandedCat, filteredServices]);

  function addToCart(service) {
    setCart(prev =>
      prev.find(item => item.id === service.id)
        ? prev
        : [...prev, { ...service, qty: 1 }]
    );
  }

  // ---- PAGE STARTS HERE ----
  return (
    <main className="bg-[#052b1e] min-h-screen font-sans text-green-50">
      {/* HEADER */}
      <Header cartCount={cart.length} />

      {/* HERO SECTION WITH VIDEO */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden text-center">
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
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 space-y-4 px-4">
          <img src="/logo.png" alt="Greens Beauty Salon Logo" className="h-20 mx-auto drop-shadow-lg" />
          <h1 className="text-5xl font-bold tracking-wide text-primary font-[Pacifico]">Greens Beauty Salon</h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Discover a world of premium beauty treatments and services designed to enhance your natural beauty and provide ultimate relaxation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#services"
              className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-[#03150d] transition-colors font-medium"
            >
              Explore Services
            </a>
            <a
              href="tel:+918891467678"
              className="px-6 py-2 rounded-full bg-primary text-[#03150d] font-medium hover:bg-opacity-90 transition-colors"
            >
              Book Now
            </a>
          </div>
        </div>
      </section>



<section className="py-16 bg-[#0e3524] pattern-bg-1 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">
          Our Service Divisions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
 
          <div className="service-card bg-[#163020] rounded-lg p-6 text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full icon-gradient-1 flex items-center justify-center"
            >
              <i className="ri-group-line text-white ri-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Family Salon</h3>
            <p className="text-gray-400 text-sm">
              Complete care for the whole family
            </p>
          </div>
    
          <div className="service-card bg-[#163020] rounded-lg p-6 text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full icon-gradient-2 flex items-center justify-center"
            >
              <i className="ri-magic-line text-white ri-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Beauty Studio</h3>
            <p className="text-gray-400 text-sm">Premium beauty treatments</p>
          </div>
        
          <div className="service-card bg-[#163020] rounded-lg p-6 text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full icon-gradient-3 flex items-center justify-center"
            >
              <i className="ri-vip-crown-line text-white ri-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Celebrity Salon
            </h3>
            <p className="text-gray-400 text-sm">Luxury styling experience</p>
          </div>
       
          <div className="service-card bg-[#163020] rounded-lg p-6 text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full icon-gradient-4 flex items-center justify-center"
            >
              <i className="ri-brush-line text-white ri-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Makeover Studio
            </h3>
            <p className="text-gray-400 text-sm">Complete transformation</p>
          </div>
    
          <div className="service-card bg-[#163020] rounded-lg p-6 text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full icon-gradient-5 flex items-center justify-center"
            >
              <i className="ri-hearts-line text-white ri-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Bridal Lounge</h3>
            <p className="text-gray-400 text-sm">Special bridal services</p>
          </div>
        
          <div className="service-card bg-[#163020] rounded-lg p-6 text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full icon-gradient-6 flex items-center justify-center"
            >
              <i className="ri-flower-line text-white ri-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Floral Studio</h3>
            <p className="text-gray-400 text-sm">Artistic floral designs</p>
          </div>

          <div className="service-card bg-[#163020] rounded-lg p-6 text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full icon-gradient-7 flex items-center justify-center"
            >
              <i className="ri-plant-line text-white ri-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Floral Decor</h3>
            <p className="text-gray-400 text-sm">Event decoration services</p>
          </div>
       
          <div className="service-card bg-[#163020] rounded-lg p-6 text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full icon-gradient-8 flex items-center justify-center"
            >
              <i className="ri-gallery-line text-white ri-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Event Portfolio
            </h3>
            <p className="text-gray-400 text-sm">Complete event solutions</p>
          </div>
        </div>
      </div>
    </section>



      {/* FILTERS */}
      <section className="max-w-xl mx-auto w-full px-2 pt-2">
        <div className="flex flex-col gap-4 mb-5 mt-3 items-center">
          {/* Gender */}
          <div className="w-full flex flex-col items-center gap-1">
            <div className="text-green-100 text-xs mb-0.5 tracking-wide text-center font-semibold">Filter by Gender</div>
            <div className="flex gap-1 justify-center">
              <FilterTab
                icon={<MdMale />}
                label="Male"
                active={gender === 'male'}
                onClick={() => setGender('male')}
                size="lg"
                color="bg-[#183929]"
                text="text-green-100"
                activeColor="bg-[#60aaf9] text-[#031016]"
              />
              <FilterTab
                icon={<MdFemale />}
                label="Female"
                active={gender === 'female'}
                onClick={() => setGender('female')}
                size="lg"
                color="bg-[#183929]"
                text="text-green-100"
                activeColor="bg-[#f5a7ce] text-[#320f1f]"
              />
              <FilterTab
                label="All"
                active={gender === 'all'}
                onClick={() => setGender('all')}
                size="lg"
                color="bg-[#183929]"
                text="text-green-100"
                activeColor="bg-[#2eea86] text-[#033018]"
              />
            </div>
          </div>
          {/* Service Type */}
          <div className="w-full flex flex-col items-center gap-1">
            <div className="text-blue-100 text-xs mb-0.5 tracking-wide text-center font-semibold">Filter by Service Type</div>
            <div className="flex gap-2 justify-center">
              <FilterTab
                label="All"
                active={tier === 'all'}
                onClick={() => setTier('all')}
                size="sm"
                color="bg-[#213438]"
                text="text-blue-100"
                activeColor="bg-[#97f6b9] text-[#02240b]"
              />
              <FilterTab
                icon={<MdStar className="text-yellow-500"/>}
                label="Deluxe"
                active={tier === 'deluxe'}
                onClick={() => setTier('deluxe')}
                size="sm"
                color="bg-yellow-100"
                text="text-yellow-800"
                activeColor="bg-yellow-300 text-yellow-900"
              />
              <FilterTab
                icon={<MdDiamond className="text-blue-400"/>}
                label="Premium"
                active={tier === 'premium'}
                onClick={() => setTier('premium')}
                size="sm"
                color="bg-blue-100"
                text="text-blue-800"
                activeColor="bg-blue-300 text-blue-900"
              />
              <FilterTab
                icon={<MdEco className="text-green-400"/>}
                label="Basic"
                active={tier === 'basic'}
                onClick={() => setTier('basic')}
                size="sm"
                color="bg-green-100"
                text="text-green-800"
                activeColor="bg-green-300 text-green-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="max-w-xl mx-auto w-full px-2">
        <div className="flex items-center w-full bg-[#232a23] rounded-2xl px-4 py-2 border border-gray-800 shadow mb-3">
          <FiSearch className="text-green-400 text-xl mr-2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services or categories…"
            className="bg-transparent focus:outline-none text-base text-green-50 flex-1"
          />
          {search && <button onClick={() => setSearch('')} className="text-gray-400 ml-2">Clear</button>}
        </div>
      </section>

      {/* SERVICES (REDESIGNED SECTION) */}
      <section id="services" className="max-w-2xl mx-auto w-full px-2 mb-16">
        <h2 className="text-2xl font-bold text-primary mb-3 text-center">Our Services</h2>
        {tier!=='all' && (
          <div className="text-xs text-green-200 mb-1 text-center italic min-h-5">
            {TIER_LABELS[tier]?.helper}
          </div>
        )}
        {loading && (
          <div className="w-full text-center text-green-200 py-8">Loading services...</div>
        )}
        {error && (
          <div className="w-full text-center text-red-300 py-8">{error}</div>
        )}
        {!loading && !error && categories.length === 0 && (
          <div className="w-full text-center text-green-200 py-8">No services found.</div>
        )}

        {/* Category Cards */}
        <div className="flex flex-col gap-6">
          {categories.map(cat => {
            const isOpen = expandedCat === cat.name;
            return (
              <div
                key={cat.name}
                className={`rounded-2xl shadow bg-[#11281d] border border-[#24432a] mb-2`}
              >
                <button
                  onClick={() => setExpandedCat(isOpen ? null : cat.name)}
                  className="w-full flex items-center justify-between px-4 py-4 focus:outline-none"
                  aria-expanded={isOpen}
                  aria-controls={`svc-cat-${cat.name}`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image || "/placeholder-service.png"}
                      alt={cat.name}
                      className="w-14 h-14 object-cover rounded-xl bg-gray-900"
                    />
                    <div>
                      <div className="font-bold text-lg text-primary">{cat.name}</div>
                      <div className="text-xs text-green-200">{cat.caption}</div>
                      <div className="flex gap-1 mt-1">
                        {cat.tiers.map(tier => (
                          <span key={tier} className={`px-2 py-0.5 border font-semibold rounded text-xs flex items-center ${TIER_LABELS[tier]?.color}`}>
                            {TIER_LABELS[tier]?.icon}{TIER_LABELS[tier]?.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className={`transition-transform text-green-200 text-xl ${isOpen ? "rotate-90" : ""}`}>▶</span>
                </button>
                {isOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 pb-4" id={`svc-cat-${cat.name}`}>
                    {subServices.map(svc => (
                      <div
                        key={svc.id}
                        className="bg-[#163020] rounded-xl shadow border border-[#28563c] flex flex-col justify-between p-3"
                      >
                        <div className="flex gap-3 items-start">
                          <img
                            src={svc.image_url || "/placeholder-service.png"}
                            alt={svc.sub_category}
                            className="w-12 h-12 object-cover rounded-lg bg-gray-900 mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-primary text-base">{svc.sub_category}</div>
                            <div className="flex items-center gap-2 mb-1">
                              {svc.tier && (
                                <span className={`px-2 py-0.5 border font-semibold rounded text-xs flex items-center ${TIER_LABELS[svc.tier]?.color}`}>
                                  {TIER_LABELS[svc.tier]?.icon}{TIER_LABELS[svc.tier]?.label}
                                </span>
                              )}
                        {svc.offer_price && svc.offer_price < svc.original_price && (
                                <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">OFFER</span>
                              )}
                            </div>
                            <div className="text-xs text-green-100 mb-1 line-clamp-2">
                              <span dangerouslySetInnerHTML={{ __html: svc.description?.replace(/<[^>]+>/g, '').substring(0, 60) + "..." }} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          {/* Price display */}
                            {(svc.offer_price && svc.offer_price < svc.original_price) ? (
                            <div>
                              <span className="line-through text-sm text-green-100 opacity-60">₹{svc.original_price}</span>
                              <span className="font-bold text-yellow-200 ml-2">₹{svc.offer_price}</span>
                            </div>
                          ) : (
                              <span className="font-bold text-yellow-200 text-base">₹{svc.original_price}</span>
                          )}
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1.5 border border-primary text-primary rounded-full text-xs font-semibold bg-transparent shadow hover:bg-primary/10 transition"
                              onClick={() => setExpandedService(svc)}
                              type="button"
                            >View</button>
                            <button
                              className="px-3 py-1.5 bg-yellow-300 text-black rounded-full text-xs font-bold shadow hover:bg-yellow-400 transition flex items-center gap-1"
                              onClick={() => addToCart(svc)}
                              type="button"
                            ><FiShoppingCart />Book</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- SERVICE DETAILS MODAL ---- */}
      {expandedService && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setExpandedService(null)}
          aria-modal="true" role="dialog"
        >
          <div
            className="bg-[#162f20] rounded-2xl max-w-xs w-[95vw] p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute right-3 top-3 text-green-200 text-xl"
              onClick={() => setExpandedService(null)}
              aria-label="Close details"
            >×</button>
            <img
              src={expandedService.image_url || "/placeholder-service.png"}
              alt={expandedService.sub_category}
              className="w-24 h-24 object-cover rounded-2xl bg-gray-700 mx-auto mb-3"
            />
            <div className="font-bold text-primary text-lg text-center mb-1">{expandedService.sub_category}</div>
            <div className="flex items-center gap-2 justify-center mb-3 flex-wrap">
              {expandedService.tier && (
                <span className={`px-2 py-0.5 border font-semibold rounded text-xs flex items-center ${TIER_LABELS[expandedService.tier]?.color}`}>
                  {TIER_LABELS[expandedService.tier]?.icon}
                  {TIER_LABELS[expandedService.tier]?.label}
                </span>
              )}
              {expandedService.offer_price && expandedService.offer_price < expandedService.original_price && (
                <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">OFFER</span>
              )}
              {(expandedService.offer_price && expandedService.offer_price < expandedService.original_price) ? (
                <>
                  <span className="text-green-100 line-through opacity-70 ml-2">₹{expandedService.original_price}</span>
                  <span className="text-yellow-200 font-extrabold text-base">₹{expandedService.offer_price}</span>
                </>
              ) : (
                <span className="text-yellow-200 font-bold text-base ml-2">₹{expandedService.original_price}</span>
              )}
            </div>
            <div className="text-xs text-green-100 mb-4 text-center" dangerouslySetInnerHTML={{ __html: expandedService.description }} />
            <button
              className="w-full py-2 rounded-full bg-yellow-300 text-black font-bold text-base shadow hover:bg-yellow-400 transition flex items-center gap-2 justify-center"
              onClick={() => { addToCart(expandedService); setExpandedService(null); }}
              type="button"
            >
              <FiShoppingCart /> Book Now
            </button>
          </div>
        </div>
      )}

      {/* ---- CART BAR ---- */}
      {cart.length > 0 && (
        <div
          className="fixed left-0 right-0 bottom-0 bg-gradient-to-r from-green-700 via-green-800 to-green-700 text-white py-3 px-4 shadow-2xl flex items-center justify-between z-50"
          aria-label="Floating Cart Bar"
        >
          <div className="flex items-center gap-3">
            <FiShoppingCart className="text-xl" />
            <span className="font-bold">{cart.length} service{cart.length > 1 ? 's' : ''} added</span>
          </div>
          <button
            className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-full ml-4 shadow-md hover:bg-yellow-300 transition"
            onClick={() => alert('Go to cart page!')}
          >Go to Cart</button>
        </div>
      )}

      {/* ---- ABOUT ---- */}
      <section className="max-w-2xl mx-auto w-full px-4 mt-8">
        <div className="bg-[#0e3524] rounded-2xl shadow-xl p-6 mb-6 border-2 border-[#25442a]">
          <h2 className="text-primary text-2xl font-bold mb-2 flex items-center gap-2">
            <span role="img" aria-label="Sparkle">💫</span> About Greens Beauty Salon
          </h2>
          <div className="text-green-100 text-base leading-relaxed">
            <div className="flex gap-3 flex-col md:flex-row md:gap-6 mb-2">
              <div className="bg-[#2e4e3a] rounded-xl p-3 flex-1 shadow-md">
                <b className="text-primary text-lg flex items-center gap-1 mb-1"><MdStar className="text-yellow-500"/> Deluxe</b>
                <span className="text-green-100">Luxury brands and exclusive treatments. For those who demand the best in care and results. Shahnaz Husain, L'Oréal and more.</span>
              </div>
              <div className="bg-[#23405b] rounded-xl p-3 flex-1 shadow-md">
                <b className="text-blue-300 text-lg flex items-center gap-1 mb-1"><MdDiamond className="text-blue-400"/> Premium</b>
                <span className="text-green-100">Leading brands, superior results, great value. We use Biotique, Matrix, Nature’s Way, Oxyglow, and more.</span>
              </div>
              <div className="bg-[#2c4533] rounded-xl p-3 flex-1 shadow-md">
                <b className="text-green-300 text-lg flex items-center gap-1 mb-1"><MdEco className="text-green-400"/> Basic</b>
                <span className="text-green-100">Effective, everyday self-care using classic techniques and creams. Fast and budget-friendly.</span>
              </div>
            </div>
            <div className="mt-4 text-green-50 text-sm">
              <b>We believe in comfort, care, and giving you the best advice—always. <br/>Ask us anything, and our team will guide you for the perfect service and product choice.</b>
            </div>
          </div>
        </div>
      </section>

      {/* ---- CONTACT ---- */}
      <section className="max-w-2xl mx-auto w-full px-4 mb-10">
        <div className="bg-[#0e3524] rounded-2xl shadow-xl p-6 border-2 border-[#20412a]">
          <h2 className="text-primary text-2xl font-bold mb-3 flex items-center gap-2">
            <FiPhone className="text-xl text-[#41eb70]" /> Contact Us
          </h2>
          <div className="flex flex-col gap-4 text-green-100 text-base">
            <div className="flex items-center gap-3">
              <FiMapPin className="text-primary" />
              <span className="flex-1">TC 45/215, Kunjalumood, Karamana PO, Trivandrum</span>
            </div>
            <a href="tel:+918891467678" className="flex items-center gap-3 bg-[#25442a] rounded-lg px-4 py-2 font-medium hover:bg-[#35734b] transition">
              <FiPhone className="text-primary" />
              <span>+91 8891 467678</span>
              <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">Call</span>
            </a>
            <a href="mailto:greensalon@gmail.com" className="flex items-center gap-3 bg-[#25442a] rounded-lg px-4 py-2 font-medium hover:bg-[#35734b] transition">
              <FiMail className="text-primary" />
              <span>greensalon@gmail.com</span>
              <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">Email</span>
            </a>
            <a href="https://instagram.com/greensbeautysalon" target="_blank" rel="noopener" className="flex items-center gap-3 bg-[#23405b] rounded-lg px-4 py-2 font-medium hover:bg-[#365c87] transition">
              <FiInstagram className="text-[#e399ed]" />
              <span>@greensbeautysalon</span>
              <span className="ml-auto text-xs bg-[#e399ed]/20 text-[#e399ed] px-2 py-0.5 rounded-full font-bold">Instagram</span>
            </a>
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="text-center py-5 text-green-200 text-xs bg-[#082012]">
        &copy; {new Date().getFullYear()} Greens Beauty Salon. All rights reserved.
      </footer>
      <style>{`
        .text-primary { color: #41eb70 !important; }
        .bg-primary { background: #41eb70 !important; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </main>
  );
}

// ---- FILTER TAB COMPONENT (Compact & Accessible) ----
function FilterTab({ icon, label, active, onClick, size, color, text, activeColor }) {
  // size: "lg" (pill, tall, for gender) or "sm" (small rectangle, for type)
  let base = size === "lg"
    ? "px-4 py-2 rounded-full font-semibold text-base min-w-[74px] min-h-[40px] transition border-2 focus:outline-none"
    : "px-3 py-1.5 rounded-lg font-semibold text-xs min-w-[56px] min-h-[28px] transition border-2 focus:outline-none";
  let style = active
    ? `${activeColor} border-2 border-opacity-80 ring-2 ring-primary/40 shadow`
    : `${color} ${text} border-[#253828] hover:bg-[#1e4935]/80`;

  return (
    <button
      className={`${base} ${style} flex items-center justify-center gap-1`}
      onClick={e => { e.preventDefault(); onClick(); }}
      aria-pressed={active}
      tabIndex={0}
      type="button"
      style={{marginRight:'2px',marginLeft:'2px'}}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
