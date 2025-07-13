import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

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
    const branchId    = form.get('branchId') as string;

    // 2) Handle the image Blob
    let imageUrl: string | undefined;
    const imageFile = form.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      // Read binary data
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      // Unique filename: timestamp + original name
      const fileName = `${Date.now()}_${imageFile.name}`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'staff', fileName);
      // Write to disk
      await fs.writeFile(filePath, buffer);
      imageUrl = `/uploads/staff/${fileName}`;
    }

    // 3) Create record
    const newStaff = await prisma.user.create({
      data: {
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
        branchId,
        active:  true,
        removed: false,
        imageUrl,
      },
    });

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (err: any) {
    console.error('Add staff error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
