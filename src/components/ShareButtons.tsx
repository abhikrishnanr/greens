'use client'

import { useEffect, useState } from 'react'
import { FaFacebookF, FaWhatsapp } from 'react-icons/fa'
import { FiShare2 } from 'react-icons/fi'

interface ShareButtonsProps {
  path: string
  title: string
  text?: string
}

export default function ShareButtons({ path, title, text }: ShareButtonsProps) {
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    setShareUrl(`${window.location.origin}${path}`)
  }, [path])

  const message = `${title}${text ? ` - ${text}` : ''}`
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedMessage = encodeURIComponent(`${message} ${shareUrl}`)

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: message,
          url: shareUrl,
        })
      } catch {
        // ignored
      }
    }
  }

  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div className="mt-4 flex items-center gap-4 text-emerald-700">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="hover:text-emerald-900"
      >
        <FaFacebookF />
      </a>
      <a
        href={`https://wa.me/?text=${encodedMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="hover:text-emerald-900"
      >
        <FaWhatsapp />
      </a>
      {canShare && (
        <button
          onClick={handleNativeShare}
          aria-label="Share"
          className="hover:text-emerald-900"
        >
          <FiShare2 />
        </button>
      )}
    </div>
  )
}

