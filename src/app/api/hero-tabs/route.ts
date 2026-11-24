import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "@/lib/slugify";
import { HOMEPAGE_CACHE_HEADERS } from "@/lib/http-cache";

export async function GET(req: NextRequest) {
  const host = req.headers.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const base = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
  const tabs = await prisma.heroTab.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      iconUrl: true,
      backgroundUrl: true,
      videoSrc: true,
      heroTitle: true,
      heroDescription: true,
      buttonLabel: true,
      buttonLink: true,
      order: true,
    },
  });

  const result = tabs.map((t) => {
    const iconUrl =
      t.iconUrl && t.iconUrl.startsWith("/")
        ? `${base}${t.iconUrl}`
        : t.iconUrl;
    const backgroundUrl =
      t.backgroundUrl && t.backgroundUrl.startsWith("/")
        ? `${base}${t.backgroundUrl}`
        : t.backgroundUrl;
    const videoSrc =
      t.videoSrc && t.videoSrc.startsWith("/")
        ? `${base}${t.videoSrc}`
        : t.videoSrc;
    const slug = slugify(t.name);

    return {
      id: t.id,
      name: t.name,
      slug,
      iconUrl,
      backgroundUrl,
      videoSrc,
      heroTitle: t.heroTitle,
      heroDescription: t.heroDescription,
      buttonLabel: t.buttonLabel,
      buttonLink: t.buttonLink,
      order: t.order,
    };
  });

  return NextResponse.json(result, { headers: HOMEPAGE_CACHE_HEADERS });
}
