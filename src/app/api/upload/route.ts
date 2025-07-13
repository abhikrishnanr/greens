import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Only accept images
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = Date.now() + "-" + file.name.replace(/\s+/g, "");
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);
  return NextResponse.json({ url: "/uploads/" + filename });
}
