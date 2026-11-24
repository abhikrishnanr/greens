// Public catalogue data changes infrequently. Let Vercel's edge cache serve
// repeat homepage visits immediately while it refreshes stale data in the
// background.
export const HOMEPAGE_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
} as const
