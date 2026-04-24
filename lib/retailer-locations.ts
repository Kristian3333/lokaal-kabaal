/**
 * Pure domain layer for multi-location retailers (one account, many
 * physical shops). Keeps the routing logic, tier gating, and conversion
 * attribution separate from the schema change so the tests can exercise
 * the business rules before we touch Drizzle.
 *
 * Schema change (not applied here -- needs user approval per CLAUDE.md):
 *   retailer_locations (
 *     id uuid primary key,
 *     retailer_id uuid not null references retailers,
 *     naam text not null,
 *     pc4 text not null,
 *     winkel_pincode text not null,
 *     branding_kleur text,
 *     is_primary boolean not null default false
 *   )
 *
 * Until that migration lands, these helpers operate on plain objects so
 * they can be unit-tested without a database.
 */

export type RetailerLocation = {
  id: string;
  retailerId: string;
  naam: string;
  pc4: string;
  winkelPincode: string;
  brandingKleur?: string;
  isPrimary: boolean;
};

export type SubscriptionTier = 'starter' | 'pro' | 'agency';

/**
 * Hard caps on number of locations per tier. Matches the commercial
 * positioning: Starter is single-shop, Pro supports small chains, Agency
 * removes the cap so bureaus + enterprise can onboard freely.
 */
export const LOCATION_LIMITS: Record<SubscriptionTier, number> = {
  starter: 1,
  pro: 3,
  agency: Number.POSITIVE_INFINITY,
};

/**
 * True when the retailer is allowed to create one more location given
 * their current plan.
 */
export function canAddLocation(
  tier: SubscriptionTier,
  currentLocationCount: number,
): boolean {
  if (currentLocationCount < 0) return false;
  return currentLocationCount < LOCATION_LIMITS[tier];
}

/**
 * Pick the location whose PC4 best matches the scanning bewoner's PC4.
 *
 * Strategy: exact PC4 match first; if none, match on PC3 prefix (same
 * broader area); if still none, fall back to the isPrimary location, or
 * the first location as a last resort. Guarantees a non-null return
 * when the list is non-empty so call-sites don't need null handling.
 */
export function findLocationForPc4(
  locations: readonly RetailerLocation[],
  scanPc4: string,
): RetailerLocation | null {
  if (locations.length === 0) return null;

  // Exact-match first.
  const exact = locations.find(l => l.pc4 === scanPc4);
  if (exact) return exact;

  // PC3 prefix match (e.g. 3512 vs 3511 share "351").
  if (scanPc4.length >= 3) {
    const prefix = scanPc4.slice(0, 3);
    const prefixMatch = locations.find(l => l.pc4.startsWith(prefix));
    if (prefixMatch) return prefixMatch;
  }

  // Fall back to the primary location, else the first.
  const primary = locations.find(l => l.isPrimary);
  return primary ?? locations[0];
}

/**
 * Attribute conversions to their most likely shop location. Accepts the
 * full list of conversions and locations for a single retailer and
 * returns a map from locationId to the conversions routed to it.
 */
export function attributeConversions<
  T extends { pc4: string },
>(
  conversions: readonly T[],
  locations: readonly RetailerLocation[],
): Map<string, T[]> {
  const byLocation = new Map<string, T[]>();
  for (const loc of locations) {
    byLocation.set(loc.id, []);
  }
  for (const c of conversions) {
    const loc = findLocationForPc4(locations, c.pc4);
    if (!loc) continue;
    const bucket = byLocation.get(loc.id);
    if (bucket) bucket.push(c);
  }
  return byLocation;
}

/**
 * Detect the primary-location invariant violations:
 *   - exactly one location must have isPrimary=true when the list is
 *     non-empty;
 *   - no two locations may share the same pincode (a shared pincode
 *     would make per-location analytics impossible).
 * Returns a list of human-readable error strings; empty array means the
 * list is valid.
 */
export function validateLocations(
  locations: readonly RetailerLocation[],
): string[] {
  const errors: string[] = [];
  if (locations.length === 0) return errors;

  const primaries = locations.filter(l => l.isPrimary);
  if (primaries.length === 0) {
    errors.push('Geen primaire locatie ingesteld.');
  } else if (primaries.length > 1) {
    errors.push(`${primaries.length} primaire locaties gevonden, er mag er maar 1 zijn.`);
  }

  const seenPincodes = new Set<string>();
  for (const loc of locations) {
    if (seenPincodes.has(loc.winkelPincode)) {
      errors.push(`Dubbele winkel-pincode: ${loc.winkelPincode}`);
    }
    seenPincodes.add(loc.winkelPincode);
  }

  return errors;
}
