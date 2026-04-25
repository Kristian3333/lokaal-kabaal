/**
 * Single source of truth for outbound mailto-links and the central
 * support inbox.
 *
 * Decision (april 2026): every public mailto on lokaalkabaal.agency
 * routes to support@verbouwpro.nl with a category-prefixed subject so
 * the receiving inbox can filter by reason. No dedicated mailbox
 * infra on lokaalkabaal.agency yet -- one founder, one inbox.
 *
 * Migrating to a dedicated agency inbox later is a single-file change:
 * flip CONTACT_SUPPORT_EMAIL and the mailto helper picks up everywhere.
 */

/** Central support inbox where all human-replied mail lands. */
export const CONTACT_SUPPORT_EMAIL = 'support@verbouwpro.nl';

/** Where the auto-forward + auto-reply originates from (Resend domain). */
export const CONTACT_FORM_FROM_ADDRESS = 'LokaalKabaal <noreply@lokaalkabaal.agency>';

/** Where the contact-form forwards land (kept separate so we can later
 * route /design or /partners to specialised aliases without touching every
 * call-site). */
export const CONTACT_FORM_FORWARD_TO = CONTACT_SUPPORT_EMAIL;

/**
 * Categories for mailto-links scattered across the marketing pages.
 * Each entry produces `mailto:<email>?subject=<encoded subject>` so the
 * support inbox can filter on the bracketed prefix.
 */
export type ContactCategory =
  | 'partners'
  | 'design'
  | 'data'
  | 'integraties'
  | 'gemeenten'
  | 'overheid'
  | 'bureaus'
  | 'retargeting'
  | 'be-waitlist'
  | 'de-waitlist'
  | 'custom-pricing'
  | 'general';

const CATEGORY_SUBJECT: Record<ContactCategory, string> = {
  'partners':         '[partners] Samenwerking lokaalkabaal',
  'design':           '[design] Aanvraag flyer-design',
  'data':             '[data] Vraag over data-product',
  'integraties':      '[integraties] Plugin / API integratie',
  'gemeenten':        '[gemeente] Vraag over gemeentepartner',
  'overheid':         '[overheid] Welkomstpakket gemeenten',
  'bureaus':          '[bureau] White-label aanvraag',
  'retargeting':      '[retargeting] Pilot digital ads',
  'be-waitlist':      '[BE-waitlist] LokaalKabaal België',
  'de-waitlist':      '[DE-waitlist] LokaalKabaal Deutschland',
  'custom-pricing':   '[custom-pricing] Vraag over volume-tarief',
  'general':          '[lokaalkabaal] Algemene vraag',
};

/**
 * Build a `mailto:` URL that lands in the support inbox with the
 * category-prefixed subject set.
 */
export function buildMailto(category: ContactCategory): string {
  const subject = CATEGORY_SUBJECT[category];
  return `mailto:${CONTACT_SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
