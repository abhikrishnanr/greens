export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import SignInClient from './SignInClient'

export default function SignInPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  return (
    <Suspense>
      <SignInClient type={searchParams.type} />
    </Suspense>
  )
}
