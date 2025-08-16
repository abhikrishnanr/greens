"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, LogOut, Home } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession, signOut } from "next-auth/react"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { data: session } = useSession()
  const dashboardLink =
    session?.user?.role === "customer"
      ? "/customer"
      : session?.user?.role === "staff" || session?.user?.role === "customer_staff"
      ? "/admin/staff/assignments"
      : "/admin/dashboard"

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const closeMenus = () => setIsMobileMenuOpen(false)

  const navLinks = (
    <>
      <Link href="/" className="hover:text-green-400 transition-colors" onClick={closeMenus}>
        Home
      </Link>

      {/* Anchor to sections in Home page */}

      <Link href="#services" className="hover:text-green-400 transition-colors" onClick={closeMenus}>
        Explore Services
      </Link>

    
        <Link href="/beauty-education" className="hover:text-green-400 transition-colors" onClick={closeMenus}>
          Beauty Education
        </Link>
        <Link href="/about" className="hover:text-green-400 transition-colors" onClick={closeMenus}>
          About Greens
        </Link>

        <Link href="/jobs" className="hover:text-green-400 transition-colors" onClick={closeMenus}>
          Jobs @ Greens
        </Link>

        <Link href="/gallery" className="hover:text-green-400 transition-colors" onClick={closeMenus}>
          Gallery
        </Link>

      <Link href="#contact" className="hover:text-green-400 transition-colors" onClick={closeMenus}>
        Contact Us
      </Link>

      {session?.user ? (
        <>
          <Link
            href={dashboardLink}
            className="flex items-center gap-2"
            onClick={closeMenus}
          >
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "avatar"}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <span className="h-8 w-8 rounded-full bg-green-700 flex items-center justify-center text-sm">
                {session.user.name?.[0] || "U"}
              </span>
            )}
            <span>{session.user.name}</span>
          </Link>
          <button
            onClick={() => {
              signOut()
              closeMenus()
            }}
            className="flex items-center gap-1 hover:text-green-400 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </>
      ) : (
        <Link href="/login" className="hover:text-green-400 transition-colors" onClick={closeMenus}>
          Login
        </Link>
      )}
    </>
  )

  return (
    <header
      className={`fixed top-0 left-0 w-full text-white py-4 px-6 flex items-center justify-between z-50 transition-colors duration-300 border-b ${
        isScrolled ? "bg-emerald-950 border-emerald-800" : "bg-transparent border-transparent"
      }`}
      style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Greens Beauty Salon Logo" width={150} height={60} />
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">{navLinks}</nav>

      {/* Mobile actions */}
      <div className="md:hidden flex items-center gap-4">
        <Link href="/" aria-label="Home" className="text-white">
          <Home size={24} />
        </Link>
        <button className="text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 text-lg md:hidden"
            style={{ backgroundColor: "#052b1e" }}
          >
            <button className="absolute top-4 right-4 text-white" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={32} />
            </button>
            <nav className="flex flex-col items-center gap-6">{navLinks}</nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
