import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const roleCookie = req.cookies.get('role')?.value
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) {
    const role = (token as { role?: string | null })?.role
    const allowedAdminRoles = ['admin', 'staff', 'customer_staff']
    if (!token || !role || !allowedAdminRoles.includes(role)) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  if (pathname.startsWith('/staff')) {
    const role = (token as { role?: string | null })?.role
    const allowed = ['beautician', 'receptionist', 'manager', 'owner']
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    if (!role || !allowed.includes(role)) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  if (pathname.startsWith('/customer')) {
    if (!token || ((token as { role?: string }).role !== 'customer' && roleCookie !== 'customer')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/customer/:path*'],
}
