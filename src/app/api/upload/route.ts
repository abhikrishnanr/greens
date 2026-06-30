import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";
import { requireRole } from "@/lib/authz";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_PHOTO_BYTES = (Number(process.env.MAX_PHOTO_MB) || 25) * 1024 * 1024;
const MAX_VIDEO_BYTES = (Number(process.env.MAX_VIDEO_MB) || 250) * 1024 * 1024;

export async function POST(req: NextRequest) {
  // Only staff/admin may upload media.
  const guard = await requireRole(["admin", "staff", "customer_staff"]);
  if (guard instanceof Response) return guard;

  // Fail loudly (and usefully) when Cloudinary isn't configured — the most
  // common reason hero-banner / image uploads "don't work" locally or on a
  // fresh Vercel deploy.
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      { error: "Image storage is not configured (missing CLOUDINARY_* env vars)." },
      { status: 503 }
    );
  }

  try {
    const data = await req.formData();
    const file = data.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "No file" }, { status: 400 });

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isImage && !isVideo)
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

    const limit = isVideo ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES;
    if (file.size > limit) {
      const mb = Math.round(limit / (1024 * 1024));
      return NextResponse.json(
        { error: `File too large. Max ${mb} MB for ${isVideo ? "videos" : "images"}.` },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded: UploadApiResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: isVideo ? "video" : "image", folder: "services" },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve(result);
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });

    return NextResponse.json({ url: uploaded.secure_url, publicId: uploaded.public_id });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
