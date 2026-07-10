import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`

    return Response.json({
      connected: true,
      message: "Database connection is healthy.",
    })
  } catch (error) {
    console.error("Database health check failed", error)

    return Response.json(
      {
        connected: false,
        message: "Database connection failed.",
      },
      { status: 503 },
    )
  }
}
