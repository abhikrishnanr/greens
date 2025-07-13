check// GET /api/users/check?phone=XXXXXXXXXX
export async function GET(req: NextRequest) {
  const phone = new URL(req.url).searchParams.get('phone');
  if (!phone || !/^\d{10}$/.test(phone)) return Response.json({ user: null });
  const user = await prisma.user.findUnique({
    where: { phone },
    select: { id: true, name: true, gender: true }
  });
  return Response.json({ user });
}
