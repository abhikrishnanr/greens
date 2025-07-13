import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Only accept images
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const uploaded: UploadApiResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve(result);
        }
      );
      stream.end(buffer);
    });
    return NextResponse.json({ url: uploaded.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
