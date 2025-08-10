import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text', placeholder: '9999999999' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials.password) return null
        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        })
        if (!user || user.password !== credentials.password) return null
        return {
          id: user.id,
          name: user.name ?? undefined,
          phone: user.phone ?? undefined,
          role: user.role,
        }
      },
    }),
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER!,
      from:   process.env.EMAIL_FROM!,
    }),
  ],
  session: { strategy: 'jwt' },
  pages:   { signIn: '/auth/signin' },
  callbacks: {
    async jwt({ token }) {
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { phone: true, role: true, modules: true },
        })
        ;(token as { phone?: string | null; role?: string | null; modules?: string[] }).phone = dbUser?.phone ?? null
        ;(token as { phone?: string | null; role?: string | null; modules?: string[] }).role = dbUser?.role ?? null
        ;(token as { phone?: string | null; role?: string | null; modules?: string[] }).modules =
          (dbUser?.modules as string[] | null) ?? []
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        ;(session.user as { phone?: string | null; role?: string | null; modules?: string[] }).phone = (token as { phone?: string | null }).phone
        ;(session.user as { phone?: string | null; role?: string | null; modules?: string[] }).role = (token as { role?: string | null }).role
        ;(session.user as { phone?: string | null; role?: string | null; modules?: string[] }).modules = (token as { modules?: string[] }).modules
      }
      return session
    },
    async redirect({ baseUrl }) {
      return baseUrl
    },
  },
}
