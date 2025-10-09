import { MAX_PHOTO_BYTES, MAX_VIDEO_BYTES } from './env';

const PHOTO_MIME_WHITELIST = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
]);

const VIDEO_MIME_WHITELIST = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/mpeg',
  'video/x-m4v',
  'video/x-msvideo',
  'video/3gpp',
  'video/3gpp2',
]);

type FileType = 'photo' | 'video';

type FileLimitsInput = {
  type: FileType;
  mime: string | null | undefined;
  sizeBytes: number;
};

function getWhitelist(type: FileType): Set<string> {
  return type === 'photo' ? PHOTO_MIME_WHITELIST : VIDEO_MIME_WHITELIST;
}

function getMaxBytes(type: FileType): number {
  return type === 'photo' ? MAX_PHOTO_BYTES : MAX_VIDEO_BYTES;
}

export function safeMime(mime: string | null | undefined): string {
  return (mime ?? '').split(';')[0].trim().toLowerCase();
}

export function assertFileLimits({ type, mime, sizeBytes }: FileLimitsInput): void {
  if (sizeBytes <= 0) {
    throw new Error('File size is invalid. ഫയലിന്റെ വലുപ്പം അസാധുവാണ്.');
  }

  const normalizedMime = safeMime(mime);

  if (!normalizedMime) {
    throw new Error('File type is required. ഫയൽ തരം ആവശ്യമാണ്.');
  }

  const whitelist = getWhitelist(type);

  if (!whitelist.has(normalizedMime)) {
    throw new Error('Unsupported file format. പിന്തുണയ്ക്കാത്ത ഫയൽ ഫോർമാറ്റ്.');
  }

  const maxBytes = getMaxBytes(type);

  if (sizeBytes > maxBytes) {
    const limitInMb = (maxBytes / (1024 * 1024)).toFixed(0);
    throw new Error(
      `File is too large (max ${limitInMb} MB). ഫയൽ വളരെ വലുതാണ് (പരമാവധി ${limitInMb} എംബി).`,
    );
  }
}
