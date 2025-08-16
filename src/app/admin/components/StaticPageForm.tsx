'use client'

import { useEffect, useState } from 'react'
import WysiwygEditor from '@/app/components/WysiwygEditor'

interface Props {
  slug: string
  heading: string
}

export default function StaticPageForm({ slug, heading }: Props) {
  const [form, setForm] = useState({ title: '', content: '' })
  const [exists, setExists] = useState(false)

  const load = async () => {
    const res = await fetch(`/api/admin/static-pages?slug=${slug}`)
    if (res.ok) {
      const data = await res.json()
      if (data) {
        setForm({ title: data.title || '', content: data.content || '' })
        setExists(true)
      }
    }
  }

  useEffect(() => {
    load()
  }, [slug])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = exists ? 'PUT' : 'POST'
    await fetch('/api/admin/static-pages', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, ...form }),
    })
    setExists(true)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-700">{heading}</h1>
      <form onSubmit={save} className="space-y-4 bg-white p-6 rounded shadow border">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            className="w-full p-2 rounded border"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Content</label>
          <WysiwygEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
        </div>
        <button className="bg-green-600 px-4 py-2 rounded text-white" type="submit">
          Save
        </button>
      </form>
    </div>
  )
}
