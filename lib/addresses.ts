/**
 * Address lookup service for new residents in Dutch postcodes.
 * Uses Altum AI API when configured; falls back to a realistic stub
 * based on pc4 data for development and testing.
 */

const ALTUM_BASE = 'https://api.altum.ai/v1';

/** A new resident's address record */
export interface ResidentAddress {
  name: string;
  address: string;
  postcode: string;
  city: string;
  overdrachtDatum: string;
}

/** Raw transaction record from Altum API */
interface AltumTransaction {
  id?: unknown;
  transaction_id?: unknown;
  street?: unknown;
  straat?: unknown;
  house_number?: unknown;
  huisnummer?: unknown;
  postal_code?: unknown;
  postcode?: unknown;
  city?: unknown;
  stad?: unknown;
  transaction_date?: unknown;
  datum?: unknown;
}

/** Altum API response wrapper */
interface AltumApiResponse {
  transactions?: AltumTransaction[];
  addresses?: AltumTransaction[];
}

/**
 * Map of PC4 -> city name for the stub implementation.
 * Covers major Dutch cities with realistic names.
 */
const PC4_CITY_STUBS: Record<string, string> = {
  '1': 'Amsterdam',
  '2': 'Haarlem',
  '3': 'Utrecht',
  '4': 'Breda',
  '5': 'Eindhoven',
  '6': 'Nijmegen',
  '7': 'Zwolle',
  '8': 'Leeuwarden',
  '9': 'Groningen',
};

/**
 * Generate a stub street name based on postcode for deterministic results.
 * Used only when ALTUM_API_KEY is not configured.
 */
function stubStreet(pc4: string): string {
  const streets = [
    'Kerkstraat', 'Hoofdstraat', 'Schoolstraat', 'Molenstraat',
    'Dorpsstraat', 'Nieuweweg', 'Parkweg', 'Lindenlaan',
    'Veldweg', 'Bosweg',
  ];
  const idx = parseInt(pc4.slice(-1), 10) % streets.length;
  return streets[idx];
}

/**
 * Derive a city name from a PC4 code.
 * Uses the first digit as a rough regional indicator.
 */
function cityFromPc4(pc4: string): string {
  return PC4_CITY_STUBS[pc4[0]] ?? 'Nederland';
}

/**
 * Normalize a PC4 string to 4-digit numeric form.
 * Strips trailing letter extensions if any.
 */
function normalizePostcode(pc4: string): string {
  return pc4.trim().replace(/\s+/g, '').toUpperCase();
}

/**
 * Fetch new resident addresses from Altum AI for the given PC4 list and month.
 * Uses a stub implementation when ALTUM_API_KEY is not configured.
 *
 * @param pc4List - Array of 4-digit Dutch postcodes
 * @param maandStr - Month string in YYYY-MM-DD format (first day of month)
 * @returns Array of new resident addresses
 */
export async function getNewResidents(
  pc4List: string[],
  maandStr: string,
): Promise<ResidentAddress[]> {
  const key = process.env.ALTUM_API_KEY;

  if (!key) {
    return buildStubResidents(pc4List, maandStr);
  }

  const van = new Date(maandStr);
  const tot = new Date(van.getFullYear(), van.getMonth() + 1, 0);
  const totStr = tot.toISOString().slice(0, 10);

  try {
    const res = await fetch(`${ALTUM_BASE}/transactions/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postal_codes: pc4List,
        filters: {
          transaction_date: { after: maandStr, before: totStr },
        },
        limit: 500,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Altum ${res.status}: ${text}`);
    }

    const data: AltumApiResponse = await res.json();
    const raw: AltumTransaction[] = data.transactions ?? data.addresses ?? [];

    return raw.map((t): ResidentAddress => {
      const street = String(t.street ?? t.straat ?? '');
      const houseNumber = String(t.house_number ?? t.huisnummer ?? '');
      const fullAddress = houseNumber ? `${street} ${houseNumber}` : street;
      return {
        name: `Bewoners ${normalizePostcode(String(t.postal_code ?? t.postcode ?? ''))}`,
        address: fullAddress,
        postcode: normalizePostcode(String(t.postal_code ?? t.postcode ?? '')),
        city: String(t.city ?? t.stad ?? ''),
        overdrachtDatum: String(t.transaction_date ?? t.datum ?? maandStr),
      };
    });
  } catch (err) {
    console.error('[addresses] Altum API request failed:', err);
    throw err;
  }
}

/**
 * Build a realistic stub set of resident addresses for development use.
 * Generates 2-5 addresses per postcode based on the postcode value.
 *
 * @param pc4List - Array of 4-digit Dutch postcodes
 * @param maandStr - Month string in YYYY-MM-DD format
 * @returns Stub resident addresses
 */
export function buildStubResidents(
  pc4List: string[],
  maandStr: string,
): ResidentAddress[] {
  const results: ResidentAddress[] = [];

  for (const pc4 of pc4List) {
    const count = 2 + (parseInt(pc4.slice(-1), 10) % 4);
    const street = stubStreet(pc4);
    const city = cityFromPc4(pc4);

    for (let i = 1; i <= count; i++) {
      results.push({
        name: `Bewoners ${pc4}`,
        address: `${street} ${i * 10}`,
        postcode: pc4,
        city,
        overdrachtDatum: maandStr,
      });
    }
  }

  return results;
}
