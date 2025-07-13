import { IncomingForm } from 'formidable';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Parse the multipart form
  const { fields, files } = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  // **DEBUG**: see exactly what keys and values we got
  console.log('👉 fields:', Object.keys(fields), fields);
  console.log('👉 files:', Object.keys(files), files);

  // Immediately return them so you can inspect in the browser/console:
  return res.status(200).json({ fields, files });
}
