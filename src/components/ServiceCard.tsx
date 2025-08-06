'use client'
import { useState } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import slugify from '@/lib/slugify'

interface Variant {
  id: string
  serviceId: string
  name: string
  serviceName: string
  categoryName: string
  caption: string | null
  description: string | null
  imageUrl: string | null
  price: number
  actualPrice: number
  offerPrice: number | null
  applicableTo?: string
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '')
}

export default function ServiceCard({
  variant,
  hideDetails = false,
}: {
  variant: Variant
  hideDetails?: boolean
}) {
  const [open, setOpen] = useState(false)
  const desc = variant.description ? stripHtml(variant.description) : ''
  const short = desc.slice(0, 160)
  const hasMore = desc.length > 160
  const borderColor =
    variant.applicableTo === 'female'
      ? 'border-pink-400'
      : variant.applicableTo === 'male'
        ? 'border-blue-400'
        : variant.applicableTo === 'children'
          ? 'border-yellow-400'
          : 'border-slate-200'

  return (
    <div className={`bg-white rounded-2xl shadow flex flex-col md:flex-row overflow-hidden border-4 ${borderColor}`}>
      <img
        src={variant.imageUrl || '/placeholder-service.png'}
        alt={variant.serviceName}
        className="h-48 w-full md:w-60 object-cover"
      />
      <div className="p-6 flex flex-col flex-1 gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-green-600 flex-1">
            {variant.serviceName}
          </h3>
          <Badge variant="secondary">{variant.name}</Badge>
        </div>
        {variant.caption && (
          <p className="text-sm text-gray-600">{variant.caption}</p>
        )}
        {variant.description && (
          <p className="text-sm text-gray-500">
            {open ? desc : short}
            {hasMore && !open && '...'}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="text-lg font-bold">
            {variant.offerPrice && variant.offerPrice < variant.actualPrice ? (
              <>
                <span className="line-through text-gray-500 mr-2">
                  ₹{variant.actualPrice}
                </span>
                <span className="text-pink-600">₹{variant.offerPrice}</span>
              </>
            ) : (
              <span className="text-green-600">₹{variant.actualPrice}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasMore && (
              <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
                {open ? 'View Less' : 'View More'}
              </Button>
            )}
            {!hideDetails && (
              <Link
                href={`/services/${slugify(variant.serviceName)}`}
                className="text-blue-600 underline text-sm"
              >
                Details
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
