/**
 * Proef-flyer lead magnet logic.
 *
 * Visitors enter their email + bedrijfsnaam + address on a landing-page
 * form. We:
 *   1. Validate the shape (server-side, so we can trust it in the cron).
 *   2. Enqueue the request (table insert) for a daily batch job that
 *      picks up <=10 free proef-flyers per day -- a hard cap keeps the
 *      free-tier from becoming a bottomless print budget.
 *   3. Send an immediate confirmation email so the visitor doesn't
 *      think the form did nothing.
 *
 * The enqueue schema + actual PrintOne call live in the API route +
 * cron; this module only has the pure validation + formatter.
 */

import { isValidEmail } from '@/lib/validation';

export interface ProefFlyerInput {
  email: string;
  bedrijfsnaam: string;
  adres: string;
  branche: string;
}

export interface ValidationResult {
  ok: boolean;
  /** Field-level error map when ok=false; empty when ok=true */
  errors: Partial<Record<keyof ProefFlyerInput, string>>;
  /** Normalized copy ready to store */
  normalized?: ProefFlyerInput;
}

/** Dutch daily cap to keep free-tier cost bounded */
export const PROEF_FLYER_DAILY_CAP = 10;

export function validateProefFlyerInput(raw: unknown): ValidationResult {
  const errors: Partial<Record<keyof ProefFlyerInput, string>> = {};
  const obj = (raw ?? {}) as Record<string, unknown>;

  const email = typeof obj.email === 'string' ? obj.email.trim() : '';
  const bedrijfsnaam = typeof obj.bedrijfsnaam === 'string' ? obj.bedrijfsnaam.trim() : '';
  const adres = typeof obj.adres === 'string' ? obj.adres.trim() : '';
  const branche = typeof obj.branche === 'string' ? obj.branche.trim() : '';

  if (!isValidEmail(email)) errors.email = 'Ongeldig e-mailadres';
  if (bedrijfsnaam.length < 2 || bedrijfsnaam.length > 120) errors.bedrijfsnaam = 'Bedrijfsnaam 2-120 tekens';
  if (adres.length < 8 || adres.length > 200) errors.adres = 'Volledig adres (straat + huisnr + postcode + stad)';
  if (branche.length < 2 || branche.length > 60) errors.branche = 'Kies een branche';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    errors: {},
    normalized: { email, bedrijfsnaam, adres, branche },
  };
}
