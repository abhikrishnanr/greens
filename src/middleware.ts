import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // Return false if there is no token or the user is not an admin
      return !!token && (token as { role?: string }).role === 'admin'
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
})

export const config = {
  matcher: ['/admin/:path*'],
}
