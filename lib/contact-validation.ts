/**
 * Pure validator for the public contact form.
 *
 * The contact form posts {naam, email, bericht} plus a hidden honeypot
 * field (`website`) that real humans never fill in. Bots that auto-fill
 * every input get caught here without seeing a CAPTCHA.
 *
 * The route handler trusts this output: anything coming back with
 * `ok: true` is safe to forward to Resend.
 */

import { isValidEmail } from '@/lib/validation';

export interface ContactInput {
  naam: string;
  email: string;
  bericht: string;
}

export type ContactErrorKey = keyof ContactInput | '_spam';

export interface ContactValidationResult {
  ok: boolean;
  errors: Partial<Record<ContactErrorKey, string>>;
  normalized?: ContactInput;
}

export const CONTACT_NAAM_MAX = 120;
export const CONTACT_BERICHT_MAX = 5000;

export function validateContactInput(raw: unknown): ContactValidationResult {
  const errors: Partial<Record<ContactErrorKey, string>> = {};
  const obj = (raw ?? {}) as Record<string, unknown>;

  const naam = typeof obj.naam === 'string' ? obj.naam.trim() : '';
  const email = typeof obj.email === 'string' ? obj.email.trim() : '';
  const bericht = typeof obj.bericht === 'string' ? obj.bericht.trim() : '';

  // Honeypot short-circuits everything else: bots filling auto-completes
  // never see a generic 400. The field is display:none so any non-empty
  // value (including whitespace pasted by a script) is suspicious -- real
  // humans literally cannot type into it.
  if (typeof obj.website === 'string' && obj.website.length > 0) {
    return { ok: false, errors: { _spam: 'spam-detected' } };
  }

  if (typeof obj.naam !== 'string' || naam.length === 0) {
    errors.naam = 'Naam is verplicht';
  } else if (naam.length > CONTACT_NAAM_MAX) {
    errors.naam = `Naam max ${CONTACT_NAAM_MAX} tekens`;
  }

  if (typeof obj.email !== 'string' || !isValidEmail(email)) {
    errors.email = 'Ongeldig e-mailadres';
  }

  if (typeof obj.bericht !== 'string' || bericht.length === 0) {
    errors.bericht = 'Bericht is verplicht';
  } else if (bericht.length > CONTACT_BERICHT_MAX) {
    errors.bericht = `Bericht max ${CONTACT_BERICHT_MAX} tekens`;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    errors: {},
    normalized: { naam, email, bericht },
  };
}
