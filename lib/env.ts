const MB_IN_BYTES = 1024 * 1024;

type RuntimeEnv = 'local' | 'vercel' | 'preview';

function getEnvNumber(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);

  if (Number.isNaN(value) || value <= 0) {
    throw new Error(`Invalid numeric environment variable: ${name}`);
  }

  return value;
}

export const MAX_PHOTO_BYTES = getEnvNumber('MAX_PHOTO_MB', 25) * MB_IN_BYTES;
export const MAX_VIDEO_BYTES = getEnvNumber('MAX_VIDEO_MB', 250) * MB_IN_BYTES;

const runtimeEnv = (process.env.NEXT_PUBLIC_ENV ?? 'local').trim();

if (!['local', 'vercel', 'preview'].includes(runtimeEnv)) {
  throw new Error(`Unexpected NEXT_PUBLIC_ENV value: ${runtimeEnv}`);
}

export const RUNTIME_ENV = runtimeEnv as RuntimeEnv;
