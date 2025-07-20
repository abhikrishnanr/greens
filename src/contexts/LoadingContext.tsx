'use client'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface LoadingValue {
  loading: boolean
  progress: number
  start: () => void
  set: (p: number) => void
  done: () => void
}

const LoadingContext = createContext<LoadingValue | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(0)

  const start = () => {
    setActive(n => n + 1)
    if (!loading) {
      setProgress(0)
      setLoading(true)
    }
  }

  const done = () => {
    setActive(n => {
      const next = n - 1
      if (next <= 0) {
        setProgress(100)
        setTimeout(() => {
          setLoading(false)
          setProgress(0)
        }, 300)
        return 0
      }
      return next
    })
  }

  const set = (p: number) => setProgress(p)

  // auto progress animation
  useEffect(() => {
    if (!loading) return
    const timer = setInterval(() => {
      setProgress(p => (p < 90 ? p + 5 : p))
    }, 200)
    return () => clearInterval(timer)
  }, [loading])

  // patch fetch to show loader for all requests
  useEffect(() => {
    const orig = window.fetch
    window.fetch = async (...args) => {
      start()
      try {
        const res = await orig(...args)
        return res
      } finally {
        done()
      }
    }
    return () => {
      window.fetch = orig
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ loading, progress, start, set, done }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) throw new Error('useLoading must be inside LoadingProvider')
  return ctx
}
