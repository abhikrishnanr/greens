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
        {/* Tailwind CDN */}
        <script src="https://cdn.tailwindcss.com/3.4.16"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      primary: '#41eb70',
                      secondary: '#90EE90'
                    }
                  }
                }
              }
            `,
          }}
        />
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        {/* Remixicon */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.6.0/remixicon.min.css" />

        {/* Minimal body style fallback */}
        <style>{`
          body {
            margin: 0;
            background-color: #052b1e;
            color: #90EE90;
            font-family: 'Poppins', sans-serif;
          }
        `}</style>
      </head>
      <body>
        <Providers>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
