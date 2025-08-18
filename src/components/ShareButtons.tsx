'use client'

import { useEffect, useState } from 'react'
import { FaFacebookF, FaWhatsapp } from 'react-icons/fa'
import { FiShare2 } from 'react-icons/fi'

interface ShareButtonsProps {
  path: string
  title: string
  text?: string
  image?: string
}

export default function ShareButtons({ path, title, text, image }: ShareButtonsProps) {
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    setShareUrl(`${window.location.origin}${path}`)
  }, [path])

  const message = `${title}${text ? ` - ${text}` : ''}`
  const encodedMessage = encodeURIComponent(message)
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedMessageWithUrl = encodeURIComponent(`${message} ${shareUrl}`)

  const handleNativeShare = async () => {
    if (!navigator.share) return

    try {
      // Try to include the image if the browser supports file sharing
      if (image && navigator.canShare && navigator.canShare({ files: [] })) {
        const response = await fetch(image)
        const blob = await response.blob()
        const file = new File([blob], 'image', { type: blob.type })
        await navigator.share({
          title,
          text: message,
          url: shareUrl,
          files: [file],
        })
        return
      }

      await navigator.share({
        title,
        text: message,
        url: shareUrl,
      })
    } catch {
      // ignored
    }
  }

  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div className="mt-4 flex items-center gap-4 text-emerald-700">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="hover:text-emerald-900"
      >
        <FaFacebookF />
      </a>
      <a
        href={`https://wa.me/?text=${encodedMessageWithUrl}`}
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

