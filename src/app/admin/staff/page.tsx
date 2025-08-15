import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import StaffManagement from './StaffManagement'

export default async function StaffPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    redirect('/admin/staff/assignments')
  }
  return <StaffManagement />
}
