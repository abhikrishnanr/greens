import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { role } = await req.json()
  const res = NextResponse.json({ success: true })
  res.cookies.set('role', role, { path: '/' })
  return res
}
