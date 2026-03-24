import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SESSION_COOKIE = 'lk_session';

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET environment variable is not set');
  return secret;
}

/** Session data stored in the signed cookie token */
interface SessionData {
  email: string;
  retailerId: string;
  tier: string;
  exp: number;
}

/** Sign a payload with HMAC-SHA256 */
function sign(payload: string): string {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
}

/** Create a signed session token from session data */
export function createSessionToken(data: Omit<SessionData, 'exp'>): string {
  const payload = JSON.stringify({ ...data, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const signature = sign(payload);
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

/** Verify and decode a session token. Returns null if invalid or expired. */
export function verifySessionToken(token: string): SessionData | null {
  try {
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return null;
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const expected = sign(payload);
    const sigBuf = Buffer.from(sig, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
    const data: SessionData = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

/** Extract session from request cookies. Returns null if not authenticated. */
export function getSession(req: NextRequest): SessionData | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Create a response that sets the session cookie */
export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}

/** Create a response that clears the session cookie */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

/**
 * Helper: require auth and return session or 401 response.
 * Use with: const authResult = requireAuth(req); if (authResult instanceof NextResponse) return authResult;
 */
export function requireAuth(req: NextRequest): SessionData | NextResponse {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }
  return session;
}

/**
 * Helper: get authenticated email from session only.
 * Returns the email string, or null if not authenticated.
 */
export function getAuthEmail(req: NextRequest): string | null {
  const session = getSession(req);
  return session?.email ?? null;
}

/**
 * Helper: get authenticated retailerId from session only.
 * Returns the retailerId string, or null if not authenticated.
 */
export function getAuthRetailerId(req: NextRequest): string | null {
  const session = getSession(req);
  return session?.retailerId ?? null;
}

export type { SessionData };
