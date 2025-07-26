import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HeroLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-white min-h-screen font-sans text-gray-900">
      <Header />
      {children}
      <Footer />
    </main>
  )
}
