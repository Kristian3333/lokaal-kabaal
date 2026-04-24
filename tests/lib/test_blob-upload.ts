import { describe, it, expect } from 'vitest';
import {
  buildBlobPath,
  matchesMagic,
  uploadImageToBlob,
  validateImageUpload,
  MAX_BYTES,
  MIN_BYTES,
  type ImageUpload,
} from '@/lib/blob-upload';

const PNG_HEADER = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_HEADER = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
const WEBP_HEADER = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, // RIFF
  0x00, 0x00, 0x00, 0x00, // size
  0x57, 0x45, 0x42, 0x50, // WEBP
]);

const validPng = (over: Partial<ImageUpload> = {}): ImageUpload => ({
  contentType: 'image/png',
  size: 1024,
  headerBytes: PNG_HEADER,
  ...over,
});

describe('matchesMagic', () => {
  it('test_magic_png_matches', () => {
    expect(matchesMagic('image/png', PNG_HEADER)).toBe(true);
  });

  it('test_magic_jpeg_matches', () => {
    expect(matchesMagic('image/jpeg', JPEG_HEADER)).toBe(true);
  });

  it('test_magic_webp_matches', () => {
    expect(matchesMagic('image/webp', WEBP_HEADER)).toBe(true);
  });

  it('test_magic_pngClaimedButJpegHeader_doesNotMatch', () => {
    expect(matchesMagic('image/png', JPEG_HEADER)).toBe(false);
  });

  it('test_magic_truncatedBytes_returnsFalse', () => {
    expect(matchesMagic('image/png', new Uint8Array([0x89, 0x50]))).toBe(false);
  });
});

describe('validateImageUpload', () => {
  it('test_validate_happyPath_returnsOk', () => {
    expect(validateImageUpload(validPng())).toEqual({ ok: true });
  });

  it('test_validate_disallowedMime_returnsMimeNotAllowed', () => {
    expect(
      validateImageUpload(validPng({ contentType: 'image/gif' })),
    ).toEqual({ ok: false, reason: 'mime-not-allowed' });
  });

  it('test_validate_zeroBytes_returnsTooSmall', () => {
    expect(validateImageUpload(validPng({ size: 0 }))).toEqual({
      ok: false,
      reason: 'too-small',
    });
  });

  it('test_validate_underMinBytes_returnsTooSmall', () => {
    expect(validateImageUpload(validPng({ size: MIN_BYTES - 1 }))).toEqual({
      ok: false,
      reason: 'too-small',
    });
  });

  it('test_validate_overMaxBytes_returnsTooLarge', () => {
    expect(validateImageUpload(validPng({ size: MAX_BYTES + 1 }))).toEqual({
      ok: false,
      reason: 'too-large',
    });
  });

  it('test_validate_pngClaimedButJpegHeader_returnsMagicMismatch', () => {
    expect(
      validateImageUpload(validPng({ headerBytes: JPEG_HEADER })),
    ).toEqual({ ok: false, reason: 'magic-mismatch' });
  });
});

describe('buildBlobPath', () => {
  it('test_buildBlobPath_png_usesDotPng', () => {
    const p = buildBlobPath({
      kind: 'logo',
      retailerId: 'abc123',
      contentType: 'image/png',
      now: () => 1_700_000_000_000,
      randomSuffix: () => 'xyz',
    });
    expect(p).toBe('uploads/logo/abc123/1700000000000-xyz.png');
  });

  it('test_buildBlobPath_jpeg_usesDotJpgNotJpeg', () => {
    const p = buildBlobPath({
      kind: 'hero',
      retailerId: 'abc',
      contentType: 'image/jpeg',
      now: () => 1,
      randomSuffix: () => 's',
    });
    expect(p).toBe('uploads/hero/abc/1-s.jpg');
  });

  it('test_buildBlobPath_webp_usesDotWebp', () => {
    const p = buildBlobPath({
      kind: 'flyer',
      retailerId: 'r',
      contentType: 'image/webp',
      now: () => 1,
      randomSuffix: () => 's',
    });
    expect(p).toBe('uploads/flyer/r/1-s.webp');
  });

  it('test_buildBlobPath_retailerIdWithTraversal_isSanitized', () => {
    const p = buildBlobPath({
      kind: 'logo',
      retailerId: '../../etc/passwd',
      contentType: 'image/png',
      now: () => 1,
      randomSuffix: () => 's',
    });
    // Only [a-zA-Z0-9-] survives, so the path lands under the cleaned ID.
    expect(p).toBe('uploads/logo/etcpasswd/1-s.png');
  });
});

describe('uploadImageToBlob', () => {
  it('test_upload_happyPath_callsPutAndReturnsUrl', async () => {
    const seen: Array<{ path: string; contentType: string; size: number }> = [];
    const putFn = async (
      path: string,
      body: Uint8Array,
      options: { access: 'public'; contentType: string },
    ) => {
      seen.push({ path, contentType: options.contentType, size: body.byteLength });
      return { url: `https://blob.vercel-storage.com/${path}` };
    };
    const body = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    const res = await uploadImageToBlob({
      upload: { contentType: 'image/png', size: 256, headerBytes: PNG_HEADER, body },
      kind: 'logo',
      retailerId: 'abc',
      putFn,
      now: () => 1,
      randomSuffix: () => 's',
    });
    expect(res).toEqual({
      ok: true,
      path: 'uploads/logo/abc/1-s.png',
      url: 'https://blob.vercel-storage.com/uploads/logo/abc/1-s.png',
    });
    expect(seen).toEqual([
      { path: 'uploads/logo/abc/1-s.png', contentType: 'image/png', size: body.byteLength },
    ]);
  });

  it('test_upload_validationFails_doesNotCallPut', async () => {
    let called = false;
    const putFn = async () => {
      called = true;
      return { url: 'nope' };
    };
    const body = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const res = await uploadImageToBlob({
      upload: {
        contentType: 'image/gif',
        size: 256,
        headerBytes: PNG_HEADER,
        body,
      },
      kind: 'logo',
      retailerId: 'abc',
      putFn,
    });
    expect(res).toEqual({ ok: false, reason: 'mime-not-allowed' });
    expect(called).toBe(false);
  });

  it('test_upload_magicMismatch_doesNotCallPut', async () => {
    let called = false;
    const putFn = async () => {
      called = true;
      return { url: 'nope' };
    };
    const body = new Uint8Array([0x4d, 0x5a, 0x00, 0x00]); // MZ (Windows .exe)
    const res = await uploadImageToBlob({
      upload: {
        contentType: 'image/png',
        size: 256,
        headerBytes: body,
        body,
      },
      kind: 'logo',
      retailerId: 'abc',
      putFn,
    });
    expect(res).toEqual({ ok: false, reason: 'magic-mismatch' });
    expect(called).toBe(false);
  });
});
