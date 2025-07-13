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

    // Required ID
    const id = form.get('id') as string;
    if (!id) throw new Error('Missing staff ID');

    // Extract other fields
    const data: any = {
      name:        form.get('name') as string,
      email:       form.get('email') as string,
      phone:       form.get('phone') as string,
      gender:      form.get('gender') as string,
      dob:         form.get('dob')    ? new Date(form.get('dob')    as string) : undefined,
      address:     form.get('address') as string,
      designation: form.get('designation') as string,
      experience:  form.get('experience') as string,
      startDate:   form.get('startDate') ? new Date(form.get('startDate') as string) : undefined,
      role:        form.get('role') as string,
      branchId:    form.get('branchId') as string,
    };

    // If a new image was uploaded, overwrite
    const imageFile = form.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `${Date.now()}_${imageFile.name}`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'staff', fileName);
      await fs.writeFile(filePath, buffer);
      data.imageUrl = `/uploads/staff/${fileName}`;
    }

    await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Update staff error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
