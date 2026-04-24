/**
 * Validation + upload helper for user-supplied images (retailer logos, hero
 * images, flyer artwork). Keeps all security checks in one place so every
 * upload path enforces the same MIME allowlist, size cap, and magic-byte
 * sniff before we hand bytes to Vercel Blob.
 *
 * Why magic-byte sniffing: the browser-reported Content-Type is client-
 * controlled and trivial to spoof. Checking the first few bytes of the
 * buffer against known image signatures rejects renamed .exe files before
 * we ever call put().
 */

export type AllowedImageKind = 'logo' | 'hero' | 'flyer';

export type ImageUpload = {
  /** Browser-reported MIME type. Must be one of ALLOWED_MIME. */
  contentType: string;
  /** File size in bytes. */
  size: number;
  /** First ~16 bytes of the buffer; enough for all magic signatures we check. */
  headerBytes: Uint8Array;
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: 'mime-not-allowed' | 'too-large' | 'magic-mismatch' | 'too-small' };

export const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per image
export const MIN_BYTES = 64; // reject zero-byte / truncated uploads

/**
 * True when the first bytes match a known image signature for the reported
 * MIME type. Accepts PNG, JPEG (baseline + progressive), and WebP (RIFF).
 */
export function matchesMagic(mime: string, bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;

  if (mime === 'image/png') {
    // 89 50 4E 47 0D 0A 1A 0A
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }

  if (mime === 'image/jpeg') {
    // FF D8 FF
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mime === 'image/webp') {
    // RIFF....WEBP
    if (bytes.length < 12) return false;
    return (
      bytes[0] === 0x52 && // R
      bytes[1] === 0x49 && // I
      bytes[2] === 0x46 && // F
      bytes[3] === 0x46 && // F
      bytes[8] === 0x57 && // W
      bytes[9] === 0x45 && // E
      bytes[10] === 0x42 && // B
      bytes[11] === 0x50 //   P
    );
  }

  return false;
}

/**
 * Run every validation check in order. Returns the first failure so the
 * caller can surface a specific error message rather than "invalid upload".
 */
export function validateImageUpload(u: ImageUpload): ValidationResult {
  if (!ALLOWED_MIME.includes(u.contentType as typeof ALLOWED_MIME[number])) {
    return { ok: false, reason: 'mime-not-allowed' };
  }
  if (u.size < MIN_BYTES) return { ok: false, reason: 'too-small' };
  if (u.size > MAX_BYTES) return { ok: false, reason: 'too-large' };
  if (!matchesMagic(u.contentType, u.headerBytes)) {
    return { ok: false, reason: 'magic-mismatch' };
  }
  return { ok: true };
}

/**
 * Deterministic-enough blob path under `uploads/<kind>/<retailerId>/`. The
 * filename is time-seeded + random suffix so racing uploads don't collide
 * and so we don't embed any user-supplied filename (which could carry
 * directory-traversal or encoding weirdness).
 */
export function buildBlobPath(args: {
  kind: AllowedImageKind;
  retailerId: string;
  contentType: string;
  now?: () => number;
  randomSuffix?: () => string;
}): string {
  const { kind, retailerId, contentType, now = Date.now, randomSuffix } = args;
  const ext = contentType === 'image/jpeg'
    ? 'jpg'
    : contentType === 'image/png'
      ? 'png'
      : contentType === 'image/webp'
        ? 'webp'
        : 'bin';
  const suffix = randomSuffix?.() ?? Math.random().toString(36).slice(2, 10);
  const safeRetailer = retailerId.replace(/[^a-zA-Z0-9-]/g, '');
  return `uploads/${kind}/${safeRetailer}/${now()}-${suffix}.${ext}`;
}

export type BlobPutFn = (
  path: string,
  body: Uint8Array,
  options: { access: 'public'; contentType: string },
) => Promise<{ url: string }>;

/**
 * Validate then upload. Returns either a validation failure or the public
 * URL from Vercel Blob. `putFn` is injectable so unit tests don't need the
 * real @vercel/blob module.
 */
export async function uploadImageToBlob(args: {
  upload: ImageUpload & { body: Uint8Array };
  kind: AllowedImageKind;
  retailerId: string;
  putFn: BlobPutFn;
  now?: () => number;
  randomSuffix?: () => string;
}): Promise<{ ok: true; url: string; path: string } | (ValidationResult & { ok: false })> {
  const { upload, kind, retailerId, putFn, now, randomSuffix } = args;
  const v = validateImageUpload(upload);
  if (!v.ok) return v;

  const path = buildBlobPath({
    kind,
    retailerId,
    contentType: upload.contentType,
    now,
    randomSuffix,
  });
  const { url } = await putFn(path, upload.body, {
    access: 'public',
    contentType: upload.contentType,
  });
  return { ok: true, url, path };
}
