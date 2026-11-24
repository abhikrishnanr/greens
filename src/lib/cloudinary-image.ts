export type CloudinaryCrop = "fill" | "limit" | "fit"

export interface CloudinaryImageOptions {
  height?: number
  /** Output width divided by output height (for example, 2 for a 2:1 card). */
  aspectRatio?: number
  crop?: CloudinaryCrop
  quality?: "auto" | "auto:eco" | "auto:good" | "auto:best"
}

const CLOUDINARY_UPLOAD_URL =
  /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i

function normalizeDimension(value: number) {
  return Math.max(1, Math.min(4000, Math.round(value)))
}

/**
 * Adds Cloudinary's delivery transformations to an existing image URL.
 * Non-Cloudinary URLs are returned unchanged so this is safe at API/UI
 * boundaries where local placeholders and remote images can be mixed.
 */
export function getCloudinaryImageUrl(
  src: string | null | undefined,
  width: number,
  options: CloudinaryImageOptions = {},
) {
  if (!src) return src ?? ""

  const match = src.match(CLOUDINARY_UPLOAD_URL)
  if (!match) return src

  const safeWidth = normalizeDimension(width)
  const height = options.aspectRatio
    ? normalizeDimension(safeWidth / Math.max(0.1, options.aspectRatio))
    : options.height
  const quality = options.quality ?? "auto:eco"
  const crop = options.crop ?? (height ? "fill" : "limit")
  const transformations = ["f_auto", `q_${quality}`, `c_${crop}`, `w_${safeWidth}`]

  if (height) {
    transformations.push(`h_${normalizeDimension(height)}`, "g_auto")
  }

  return `${match[1]}${transformations.join(",")}/${match[2]}`
}

/** Build a responsive srcset while keeping local/non-Cloudinary URLs valid. */
export function getCloudinarySrcSet(
  src: string | null | undefined,
  widths: readonly number[],
  options: CloudinaryImageOptions = {},
) {
  if (!src || !CLOUDINARY_UPLOAD_URL.test(src)) return undefined

  const uniqueWidths = [...new Set(widths.map(normalizeDimension))].sort((a, b) => a - b)
  return uniqueWidths
    .map((width) => `${getCloudinaryImageUrl(src, width, options)} ${width}w`)
    .join(", ")
}
