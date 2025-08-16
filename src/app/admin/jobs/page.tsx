'use client'
import { useEffect, useState } from 'react'
import WysiwygEditor from '@/app/components/WysiwygEditor'

interface Section {
  title: string
  content: string
}

export default function AdminJobsPage() {
  const [pageTitle, setPageTitle] = useState('')
  const [sections, setSections] = useState<Section[]>([{ title: '', content: '' }])
  const [exists, setExists] = useState(false)

  const load = async () => {
    const res = await fetch('/api/admin/static-pages?slug=jobs')
    if (res.ok) {
      const data = await res.json()
      if (data) {
        setPageTitle(data.title || '')
        try {
          const parsed = JSON.parse(data.content || '[]')
          if (Array.isArray(parsed) && parsed.length) setSections(parsed)
        } catch {
          if (data.content) setSections([{ title: '', content: data.content }])
        }
        setExists(true)
      }
    }
  }

  useEffect(() => {
    load()
  }, [])

  const addSection = () => setSections([...sections, { title: '', content: '' }])
  const updateSection = (idx: number, field: keyof Section, value: string) => {
    const copy = [...sections]
    copy[idx] = { ...copy[idx], [field]: value }
    setSections(copy)
  }
  const removeSection = (idx: number) =>
    setSections(sections.filter((_, i) => i !== idx))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = exists ? 'PUT' : 'POST'
    await fetch('/api/admin/static-pages', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'jobs',
        title: pageTitle,
        content: JSON.stringify(sections)
      })
    })
    setExists(true)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Jobs @ Greens</h1>
      <form onSubmit={save} className="space-y-4 bg-white p-6 rounded shadow border">
        <div>
          <label className="block font-medium mb-1">Page Title</label>
          <input
            className="w-full p-2 rounded border"
            value={pageTitle}
            onChange={e => setPageTitle(e.target.value)}
            required
          />
        </div>
        {sections.map((sec, idx) => (
          <div key={idx} className="border rounded p-4 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-medium">Section {idx + 1}</label>
              {sections.length > 1 && (
                <button
                  type="button"
                  className="text-red-600 text-sm"
                  onClick={() => removeSection(idx)}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              className="w-full p-2 rounded border"
              value={sec.title}
              onChange={e => updateSection(idx, 'title', e.target.value)}
              placeholder="Title"
              required
            />
            <WysiwygEditor
              value={sec.content}
              onChange={v => updateSection(idx, 'content', v)}
            />
          </div>
        ))}
        <button
          type="button"
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={addSection}
        >
          Add Section
        </button>
        <button
          className="bg-green-600 px-4 py-2 rounded text-white"
          type="submit"
        >
          Save
        </button>
      </form>
    </div>
  )
}
