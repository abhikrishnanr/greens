import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminClientLayout from './AdminClientLayout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'admin') {
    redirect('/login')
  }
  return <AdminClientLayout>{children}</AdminClientLayout>
}
