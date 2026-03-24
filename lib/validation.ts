/**
 * Shared input validation functions for API routes.
 * All validators are type guards that narrow `unknown` to the expected type.
 */

/** Validate email format */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/** Validate Dutch postcode (4 digits) */
export function isValidPc4(pc4: unknown): pc4 is string {
  if (typeof pc4 !== 'string') return false;
  return /^\d{4}$/.test(pc4);
}

/** Validate array of PC4 postcodes */
export function isValidPc4List(list: unknown): list is string[] {
  if (!Array.isArray(list)) return false;
  return list.every(isValidPc4);
}

/** Validate URL (must be http/https, no internal IPs) */
export function isValidExternalUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    // Block internal/private IPs to prevent SSRF
    const hostname = parsed.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') return false;
    if (hostname.startsWith('10.') || hostname.startsWith('192.168.')) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return false;
    if (hostname === '[::1]') return false;
    if (hostname.startsWith('169.254.')) return false;
    return true;
  } catch {
    return false;
  }
}

/** Validate hex color (#RRGGBB) */
export function isValidHexColor(color: unknown): color is string {
  if (typeof color !== 'string') return false;
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/** Validate number in range */
export function isInRange(value: unknown, min: number, max: number): value is number {
  if (typeof value !== 'number' || isNaN(value)) return false;
  return value >= min && value <= max;
}

/** Validate flyer format */
export function isValidFormaat(formaat: unknown): formaat is 'a6' | 'a5' | 'sq' {
  return formaat === 'a6' || formaat === 'a5' || formaat === 'sq';
}

/** Validate campaign duration (1-24 months) */
export function isValidDuration(months: unknown): months is number {
  return isInRange(months, 1, 24);
}

/** Validate pin code (4-6 digits) */
export function isValidPincode(pin: unknown): pin is string {
  if (typeof pin !== 'string') return false;
  return /^\d{4,6}$/.test(pin);
}

/** Validate branche (industry) -- non-empty string, max 100 chars */
export function isValidBranche(branche: unknown): branche is string {
  if (typeof branche !== 'string') return false;
  return branche.length > 0 && branche.length <= 100;
}

/** Safe error response -- never expose internal details */
export function validationError(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}
