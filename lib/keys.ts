import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');

function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_ROOT)) {
    fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
  }
}

function randomKey(bytes = 16): string {
  return randomBytes(bytes).toString('hex');
}

function normalizeExtension(extension?: string): string {
  if (!extension) {
    return '';
  }

  const trimmed = extension.trim();

  if (!trimmed) {
    return '';
  }

  return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
}

export function buildUploadPaths(extension?: string): { key: string; relative: string; absolute: string } {
  ensureUploadDir();

  const key = randomKey();
  const normalizedExtension = normalizeExtension(extension);
  const filename = `${key}${normalizedExtension}`;
  const relative = path.join('uploads', filename);
  const absolute = path.join(UPLOAD_ROOT, filename);

  return { key, relative, absolute };
}
