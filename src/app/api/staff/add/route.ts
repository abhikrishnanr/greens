import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});
import type { Prisma } from '@prisma/client';

export const config = {
  api: { bodyParser: false }, 
};

export async function POST(req: Request) {
  try {
    const form = await (req as any).formData();

    // 1) Extract fields
    const name        = form.get('name') as string;
    const email       = form.get('email') as string;
    const phone       = form.get('phone') as string;
    const gender      = form.get('gender') as string;
    const dobRaw      = form.get('dob') as string;
    const address     = form.get('address') as string;
    const designation = form.get('designation') as string;
    const experience  = form.get('experience') as string;
    const startRaw    = form.get('startDate') as string;
    const role        = form.get('role') as string;
    const branchId    = (form.get('branchId') as string) || undefined;

    // 2) Handle the image Blob
    let imageUrl: string | undefined;
    const imageFile = form.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploaded: UploadApiResponse = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'staff' },
          (err, result) => {
            if (err || !result) return reject(err);
            resolve(result);
          }
        );
        stream.end(buffer);
      });
      imageUrl = uploaded.secure_url;
    }

    // 3) Create record
    const data: Prisma.UserUncheckedCreateInput = {
      id:        crypto.randomUUID(),
      name,
      email,
      phone,
      gender,
      dob:       dobRaw   ? new Date(dobRaw)   : undefined,
      address,
      designation,
      experience,
      startDate: startRaw ? new Date(startRaw) : undefined,
      role,
      removed: false,
      imageUrl,
    };

    if (branchId) {
      data.branchId = branchId;
    }

    const newStaff = await prisma.user.create({ data });

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (err: any) {
    console.error('Add staff error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
