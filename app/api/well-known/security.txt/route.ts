import { NextResponse } from 'next/server';

/**
 * GET /api/well-known/security.txt
 *
 * Served at /.well-known/security.txt via a rewrite in next.config.mjs so
 * it lives at the standard RFC 9116 location. Responsible disclosure
 * contact so security researchers don't have to guess the right address.
 */
export function GET(): NextResponse {
  const body = [
    'Contact: mailto:security@lokaalkabaal.agency',
    'Expires: 2027-01-01T00:00:00.000Z',
    'Preferred-Languages: nl, en',
    'Canonical: https://lokaalkabaal.agency/.well-known/security.txt',
    'Policy: https://lokaalkabaal.agency/privacy',
    '',
  ].join('\n');
  return new NextResponse(body, {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
