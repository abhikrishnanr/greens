"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = (
    <>
     <Link href="/" className="hover:text-green-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
        Home {/* Added Home link */}
      </Link>
      <Link href="#" className="hover:text-green-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
        Explore Services
      </Link>
      <Link href="#" className="hover:text-green-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
        Service Rates
      </Link>
      <Link href="#" className="hover:text-green-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
        Current Offers
      </Link>
      <Link href="#" className="hover:text-green-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
        Schedule Visit
      </Link>
      <Link href="#" className="hover:text-green-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
        Academy & Training
      </Link>
      <Link href="#" className="hover:text-green-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
        About Greens
      </Link>
      <Link href="#" className="hover:text-green-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
        Contact Us
      </Link>
      <Link href="#" className="hover:text-green-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
        My Account
      </Link>
    </>
  )

  return (
    <header
      className="text-white py-4 px-6 flex items-center justify-between w-full relative z-50"
      style={{
        backgroundColor: '#052b1e',
        backgroundImage: "url('/grass-texture.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Greens Beauty Salon Logo" width={100} height={30} />
        </Link>
      </div>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">{navLinks}</nav>

      {/* Mobile menu button */}
      <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 text-lg md:hidden"
            style={{
              backgroundColor: '#052b1e',
              backgroundImage: "url('/grass-texture.jpg')",
              backgroundSize: 'cover',
              backgroundRepeat: 'repeat',
            }}
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
