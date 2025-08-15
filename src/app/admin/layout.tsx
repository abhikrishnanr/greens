import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminClientLayout from './AdminClientLayout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  const allowed = ['admin', 'staff', 'customer_staff']
  if (!session || !role || !allowed.includes(role)) {
    redirect('/login')
  }
  return <AdminClientLayout>{children}</AdminClientLayout>
}
