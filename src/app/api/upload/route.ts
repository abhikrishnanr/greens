import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "No file" }, { status: 400 });

    if (!file.type.startsWith("image/"))
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded: UploadApiResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "services" },
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
