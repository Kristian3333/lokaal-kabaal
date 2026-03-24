import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  generateVerificationCode,
  buildQRUrl,
  buildVerificationPageUrl,
  buildQRImageUrl,
} from '@/lib/verification';

// ── generateVerificationCode ──

describe('generateVerificationCode', () => {
  it('test_generateVerificationCode_default_returns8CharString', () => {
    const code = generateVerificationCode();
    expect(code).toHaveLength(8);
  });

  it('test_generateVerificationCode_default_usesOnlyAllowedChars', () => {
    const allowed = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]+$/;
    for (let i = 0; i < 20; i++) {
      expect(generateVerificationCode()).toMatch(allowed);
    }
  });

  it('test_generateVerificationCode_multipleCalls_producesUniqueValues', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateVerificationCode()));
    // With 30^8 possible values, collisions in 50 samples are essentially impossible
    expect(codes.size).toBe(50);
  });
});

// ── buildQRUrl ──

describe('buildQRUrl', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it('test_buildQRUrl_noEnvVar_usesDefaultBase', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(buildQRUrl('ABC123')).toBe('https://lokaalkabaal.vercel.app/v/ABC123');
  });

  it('test_buildQRUrl_withEnvVar_usesEnvBase', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://custom.example.com';
    expect(buildQRUrl('XYZ')).toBe('https://custom.example.com/v/XYZ');
  });

  it('test_buildQRUrl_emptyCode_returnsPathWithSlash', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(buildQRUrl('')).toBe('https://lokaalkabaal.vercel.app/v/');
  });
});

// ── buildVerificationPageUrl ──

describe('buildVerificationPageUrl', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it('test_buildVerificationPageUrl_noEnvVar_usesDefaultBase', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(buildVerificationPageUrl('CODE1')).toBe('https://lokaalkabaal.vercel.app/verify/CODE1');
  });

  it('test_buildVerificationPageUrl_withEnvVar_usesEnvBase', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://my.app';
    expect(buildVerificationPageUrl('CODE2')).toBe('https://my.app/verify/CODE2');
  });
});

// ── buildQRImageUrl ──

describe('buildQRImageUrl', () => {
  it('test_buildQRImageUrl_simpleUrl_returnsEncodedApiUrl', () => {
    const qrUrl = 'https://lokaalkabaal.vercel.app/v/ABC';
    const result = buildQRImageUrl(qrUrl);
    expect(result).toContain('https://api.qrserver.com/v1/create-qr-code/');
    expect(result).toContain('size=200x200');
    expect(result).toContain(`data=${encodeURIComponent(qrUrl)}`);
    expect(result).toContain('bgcolor=ffffff');
    expect(result).toContain('color=0a0a0a');
    expect(result).toContain('margin=2');
  });

  it('test_buildQRImageUrl_urlWithSpecialChars_properlyEncoded', () => {
    const qrUrl = 'https://example.com/v/A&B=C';
    const result = buildQRImageUrl(qrUrl);
    expect(result).toContain(encodeURIComponent(qrUrl));
    // The raw & should not appear unencoded in the data param
    expect(result).not.toContain('data=https://');
  });
});
