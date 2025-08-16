import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { headers } from 'next/headers'

export default async function GalleryPage() {
  const headersList = await headers()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${headersList.get('host')}`
  const res = await fetch(`${baseUrl}/api/galleries`, { cache: 'no-store' })
  const galleries = await res.json()
  return (
    <main className="bg-emerald-950 min-h-screen text-emerald-50 flex flex-col">
      <Header />
      <div className="container mx-auto max-w-6xl px-5 md:px-8 pt-24 md:pt-28 pb-10 md:pb-14 flex-1">
        {galleries.map((g: any) => (
          <section key={g.id} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-emerald-300">{g.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {g.images.map((img: any) => (
                <img key={img.id} src={img.imageUrl} alt="" className="w-full h-40 object-cover rounded" />
              ))}
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </main>
  )
}
