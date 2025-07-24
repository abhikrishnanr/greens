import { Suspense } from 'react'
import BookingClient from './BookingClient'

export const dynamic = 'force-dynamic'

export default function AdminBooking() {
  return (
    <Suspense fallback={null}>
      <BookingClient />
    </Suspense>
  )
}
