import { NextResponse } from 'next/server'
import { getDashboardData } from '@/lib/dashboard'

export async function GET() {
  try {
    const data = await getDashboardData()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('dashboard api error', err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

