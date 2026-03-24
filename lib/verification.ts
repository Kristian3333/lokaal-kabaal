import { customAlphabet } from 'nanoid';

// Alleen duidelijk leesbare tekens -- geen 0/O, 1/I verwarring
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

export function generateVerificationCode(): string {
  return nanoid(); // bijv. "A3F9K2XY"
}

export function buildQRUrl(code: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://lokaalkabaal.vercel.app';
  return `${base}/v/${code}`;
}

export function buildVerificationPageUrl(code: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://lokaalkabaal.vercel.app';
  return `${base}/verify/${code}`;
}

export function buildQRImageUrl(qrUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}&bgcolor=ffffff&color=0a0a0a&margin=2`;
}
