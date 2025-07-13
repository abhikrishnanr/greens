"use client"

import Link from "next/link"
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export default function Header({ cartCount }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-gray-900/90 backdrop-blur-xl text-gray-100 py-4 shadow-lg sticky top-0 z-50 border-b border-green-400/20">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Greens Beauty Salon Logo" className="h-10 w-auto drop-shadow-lg" />
       
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-8">
            <li>
              <Link href="#services" className="hover:text-green-400 transition-colors font-medium">
                Services
              </Link>
            </li>
            <li>
              <Link href="#about" className="hover:text-green-400 transition-colors font-medium">
                About
              </Link>
            </li>
            <li>
              <Link href="#contact" className="hover:text-green-400 transition-colors font-medium">
                Contact
              </Link>
            </li>
            <li>
              <motion.button
                className="relative hover:text-green-400 transition-colors"
                onClick={() => alert("Go to cart page!")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiShoppingCart className="text-2xl" />
                {cartCount > 0 && (
                  <motion.span
                    className="absolute -top-2 -right-2 text-gray-900 rounded-full text-xs font-bold px-2 py-0.5"
                    style={{ backgroundColor: "#41eb70" }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
            </li>
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          {cartCount > 0 && (
            <motion.button
              className="relative hover:text-green-400 transition-colors"
              onClick={() => alert("Go to cart page!")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiShoppingCart className="text-xl" />
              <motion.span
                className="absolute -top-2 -right-2 text-gray-900 rounded-full text-xs font-bold px-2 py-0.5"
                style={{ backgroundColor: "#41eb70" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {cartCount}
              </motion.span>
            </motion.button>
          )}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-2xl hover:text-green-400 transition-colors"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-green-400/20 md:hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <nav className="container mx-auto px-6 py-4">
                <ul className="space-y-4">
                  <li>
                    <Link
                      href="#services"
                      className="block hover:text-green-400 transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#about"
                      className="block hover:text-green-400 transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#contact"
                      className="block hover:text-green-400 transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
