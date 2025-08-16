import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { headers } from 'next/headers'

interface GalleryImage {
  id: string
  imageUrl: string
  caption?: string | null
}

interface Gallery {
  id: string
  title: string
  images: GalleryImage[]
}

async function loadGalleries(baseUrl: string): Promise<Gallery[]> {
  try {
    const res = await fetch(`${baseUrl}/api/galleries`, { cache: 'no-store' })
    if (!res.ok) return []
    return (await res.json()) as Gallery[]
  } catch {
    return []
  }
}

export default async function GalleryPage() {
  const headerList = headers()
  const host = headerList.get('host') ?? 'localhost:3000'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${host}`
  const galleries = await loadGalleries(baseUrl)

  return (
    <main className="bg-emerald-950 min-h-screen text-emerald-50 flex flex-col">
      <Header />
      <div className="container mx-auto max-w-6xl px-5 md:px-8 pt-24 md:pt-28 pb-10 md:pb-14 flex-1">
        {galleries.length === 0 && (
          <p className="text-center text-gray-300">No galleries found.</p>
        )}
        {galleries.map((g) => (
          <section key={g.id} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-emerald-300">{g.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {g.images.map((img) => (
                <div key={img.id} className="relative w-full h-40">
                  <Image
                    src={img.imageUrl}
                    alt={img.caption ?? ''}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </main>
  )
}

