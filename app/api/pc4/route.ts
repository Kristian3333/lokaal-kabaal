import { NextRequest, NextResponse } from 'next/server';
import { getVerhuisgraadVoorPc4 } from '@/lib/cbsData';

const PDOK_ITEMS = 'https://api.pdok.nl/cbs/postcode4/ogc/v1/collections/postcode4/items';
const CRS84 = 'http://www.opengis.net/def/crs/OGC/1.3/CRS84';

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Centroid from GeoJSON feature -- uses bbox if present, else walks coordinates
function centroidFromFeature(feature: {
  bbox?: number[];
  geometry?: { type: string; coordinates: unknown };
}): { lat: number; lon: number } | null {
  if (feature.bbox && feature.bbox.length >= 4) {
    const [minLon, minLat, maxLon, maxLat] = feature.bbox;
    return { lat: (minLat + maxLat) / 2, lon: (minLon + maxLon) / 2 };
  }
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  function walk(c: unknown) {
    if (!Array.isArray(c)) return;
    if (typeof c[0] === 'number') {
      const [lon, lat] = c as number[];
      if (lon < minLon) minLon = lon; if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
    } else c.forEach(walk);
  }
  walk(feature.geometry?.coordinates);
  if (minLon === Infinity) return null;
  return { lat: (minLat + maxLat) / 2, lon: (minLon + maxLon) / 2 };
}

// Validate coordinate is inside the Netherlands
function isNLCoord(lat: number, lon: number) {
  return lat > 50.5 && lat < 54 && lon > 3 && lon < 7.6;
}

// In-memory centroid cache -- survives multiple requests on same Vercel instance
const centroidCache = new Map<string, { lat: number; lon: number }>();

async function geocodePC4(pc4: string): Promise<{ lat: number; lon: number } | null> {
  if (centroidCache.has(pc4)) return centroidCache.get(pc4)!;

  try {
    // CQL2 filter: postcode is an integer in the CBS dataset
    const url = `${PDOK_ITEMS}?filter=postcode=${parseInt(pc4, 10)}&filter-lang=cql2-text&limit=1&f=json&crs=${encodeURIComponent(CRS84)}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/geo+json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(7000),
    });

    if (res.ok) {
      const data = await res.json();
      const feature = data.features?.[0];
      if (feature) {
        const c = centroidFromFeature(feature);
        if (c && isNLCoord(c.lat, c.lon)) {
          centroidCache.set(pc4, c);
          return c;
        }
      }
    }
  } catch { /* fall through to formula */ }

  // Last-resort formula -- rough regional approximation
  const n = parseInt(pc4, 10);
  let lat = 0, lon = 0;
  if      (n >= 1000 && n <= 1299) { lat = 52.37; lon = 4.89; }
  else if (n >= 1300 && n <= 1999) { lat = 52.38; lon = 4.75; }
  else if (n >= 2000 && n <= 2999) { lat = 52.10; lon = 4.35; }
  else if (n >= 3000 && n <= 3599) { lat = 51.92; lon = 4.50; }
  else if (n >= 3600 && n <= 3999) { lat = 52.09; lon = 5.10; }
  else if (n >= 4000 && n <= 4999) { lat = 51.70; lon = 4.60; }
  else if (n >= 5000 && n <= 5999) { lat = 51.58; lon = 5.10; }
  else if (n >= 6000 && n <= 6999) { lat = 51.50; lon = 5.80; }
  else if (n >= 7000 && n <= 7999) { lat = 52.30; lon = 6.20; }
  else if (n >= 8000 && n <= 8999) { lat = 52.50; lon = 5.90; }
  else if (n >= 9000 && n <= 9999) { lat = 53.10; lon = 6.55; }
  else return null;
  return { lat, lon };
}

export async function POST(req: NextRequest) {
  try {
    const { centrumPc4, straalKm = 10 } = await req.json();

    if (!centrumPc4 || typeof centrumPc4 !== 'string') {
      return NextResponse.json({ error: 'centrumPc4 is verplicht' }, { status: 400 });
    }

    const pc4 = centrumPc4.trim();
    const center = await geocodePC4(pc4);
    if (!center) {
      return NextResponse.json({ error: 'Postcode niet gevonden' }, { status: 400 });
    }

    const oppervlakte = Math.PI * straalKm * straalKm;
    const { rate: verhuisgraad, gm: gemeenteCode } = getVerhuisgraadVoorPc4(pc4);
    const totalAdressen = Math.round(oppervlakte * 580);

    return NextResponse.json({
      center,
      pc4Count: Math.max(1, Math.round(oppervlakte / 11)),
      totalAdressen,
      estAdressenMaand: Math.round(totalAdressen * verhuisgraad / 12),
      referentieVorigjaar: Math.round(totalAdressen * verhuisgraad),
      verhuisgraadPct: Math.round(verhuisgraad * 1000) / 10,
      gemeenteCode,
      dataBron: gemeenteCode ? 'CBS 2023' : 'CBS 2023 (nationaal)',
    });
  } catch (error) {
    console.error('PC4 route error:', error);
    return NextResponse.json({ error: 'PC4 selectie mislukt' }, { status: 500 });
  }
}
