import React from 'react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="text-center py-8 text-gray-600 bg-gray-200 border-t border-gray-300">
      <div className="container mx-auto px-6">
        <p className="text-sm">&copy; {year} Greens Beauty Salon. All rights reserved.</p>
      </div>
    </footer>
  )
}
