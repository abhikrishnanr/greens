import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { FileTextIcon, MailIcon, UserIcon } from "lucide-react"

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      submissions: {
        include: { reviews: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  })

  if (!user) notFound()

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <UserIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-950">{user.name || "Unnamed user"}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <MailIcon className="h-4 w-4" />
                <span>{user.email}</span>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/customers">Back to users</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Linked items</h2>
              <p className="text-sm text-slate-600">
                Remove role actions are now scoped to each linked item card instead of one shared action.
              </p>
            </div>

            {user.submissions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-slate-600">No linked items found for this user.</CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {user.submissions.map((submission) => (
                  <Card key={submission.id} className="border-slate-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-3">
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                          <FileTextIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base text-slate-950">{submission.title}</CardTitle>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="outline">{submission.type}</Badge>
                            <Badge variant="secondary">{submission.status}</Badge>
                            <Badge variant="outline">{submission.reviews.length} reviews</Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
                        Remove role
                      </Button>
                    </CardHeader>
                    {submission.description && (
                      <CardContent className="pt-0 text-sm text-slate-600">{submission.description}</CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div>
                  <div className="font-medium text-slate-900">Email</div>
                  <div className="break-all">{user.email}</div>
                </div>
                <div>
                  <div className="font-medium text-slate-900">Created</div>
                  <div>{user.createdAt.toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  )
}
