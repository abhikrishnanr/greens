import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { headers } from 'next/headers'

interface Section {
  title?: string
  content?: string
  imageUrl?: string
}

export default async function AboutPage() {
  const headersList = await headers()
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || `http://${headersList.get('host')}`
  const res = await fetch(`${baseUrl}/api/static-pages/about-greens`, {
    cache: 'no-store'
  })
  const page = await res.json()
  let sections: Section[] = []
  try {
    sections = JSON.parse(page?.content || '[]')
  } catch {
    // ignore
  }
  return (
    <main className="bg-emerald-950 min-h-screen text-emerald-50 flex flex-col">
      <Header />
      <div className="container mx-auto max-w-4xl px-5 md:px-8 pt-24 md:pt-28 pb-10 md:pb-14 flex-1 space-y-8">
        <h1 className="text-3xl font-bold mb-6 text-emerald-300">
          {page?.title || 'About Greens'}
        </h1>
        {sections.map((sec, i) => (
          <div key={i} className="space-y-2">
            {sec.title && (
              <h2 className="text-xl font-semibold text-emerald-200">
                {sec.title}
              </h2>
            )}
            {sec.imageUrl && (
              <img
                src={sec.imageUrl}
                alt=""
                className="w-full rounded"
              />
            )}
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sec.content || '' }}
            />
          </div>
        ))}
      </div>
      <Footer />
    </main>
  )
}
