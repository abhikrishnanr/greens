import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="p-8 text-green-100">
      <h1 className="text-3xl font-bold mb-6 text-primary">Admin Dashboard</h1>
      <ul className="space-y-2">
        <li>
          <Link href="/admin/service-categories" className="underline hover:text-primary">Manage Service Categories</Link>
        </li>
      </ul>
    </div>
  )
}
