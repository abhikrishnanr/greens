export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import SignInClient from './SignInClient'

export default function LoginPage() {
  return (
    <Suspense>
      <SignInClient />
    </Suspense>
  )
}
