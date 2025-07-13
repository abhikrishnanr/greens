import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const { id } = params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }
  return new Response(JSON.stringify(service), { status: 200 });
}
