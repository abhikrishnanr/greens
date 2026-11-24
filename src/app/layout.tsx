// src/app/layout.tsx
import './globals.css'
import React from 'react'
import { Providers } from './providers'
import { CartProvider } from '../contexts/CartContext'
import { AuthProvider } from '../contexts/AuthContext'
import "react-datepicker/dist/react-datepicker.css";

export const metadata = {
  title: 'Greens Beauty Salon | Kerala’s Leading Beauty & Wellness Destination',
  description: 'Book the best facials, hair, spa, waxing, and bridal services. Kerala’s favorite salon for women and men. Exclusive offers, Deluxe, Premium, and Basic categories.',
  openGraph: {
    title: 'Greens Beauty Salon',
    description: 'Book the best facials, hair, spa, waxing, and bridal services. Kerala’s favorite salon for women and men.',
    images: [
      {
        url: '/logo.png',
        width: 200,
        height: 200,
        alt: 'Greens Beauty Salon Logo',
      },
    ],
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="font-sans">
        <Providers>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
