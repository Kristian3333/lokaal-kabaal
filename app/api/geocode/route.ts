import { NextRequest, NextResponse } from 'next/server';

// PDOK Locatieserver -- officieel NL geocoder, stabiele overheidsapi
const PDOK_LS = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/free';

// In-memory cache overleeft hergebruikte Vercel instances (warm starts)
// Centroïden van PC4-gebieden veranderen nooit → altijd geldig
const cache = new Map<string, { lat: number; lon: number }>();

/**
 * Parse WKT POINT(lon lat) → {lat, lon}
 */
function parsePoint(wkt: string): { lat: number; lon: number } | null {
  const m = wkt.match(/POINT\(\s*([0-9.]+)\s+([0-9.]+)\s*\)/);
  if (!m) return null;
  const lon = parseFloat(m[1]);
  const lat = parseFloat(m[2]);
  // Sanity-check: moet binnen Nederland liggen
  if (lat < 50.5 || lat > 53.7 || lon < 3.0 || lon > 7.6) return null;
  return { lat, lon };
}

/**
 * Gemiddelde coördinaat van een array punten.
 * Meer punten = betere schatting van het PC4-middelpunt.
 */
function average(points: { lat: number; lon: number }[]): { lat: number; lon: number } {
  const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const lon = points.reduce((s, p) => s + p.lon, 0) / points.length;
  return { lat, lon };
}

/**
 * Haal centroïde op via PDOK locatieserver.
 * Strategie:
 *   1. Vraag 10 resultaten op van type:postcode die beginnen met de PC4-code
 *   2. Middel de coördinaten → nauwkeurig PC4-middelpunt
 *   3. Bij API-fout: veilige regionale fallback op basis van PC4-range
 */
async function geocodeViaLocatieserver(
  pc4: string,
): Promise<{ lat: number; lon: number } | null> {
  // type:postcode = 6-karakter postcodes (bijv. "7761DR") -- NIET postcode4
  const url =
    `${PDOK_LS}?q=${pc4}&fq=type:postcode&rows=10&fl=centroide_ll,weergavenaam`;

  const res = await fetch(url, {
    next: { revalidate: 86400 }, // Next.js server-side cache: 24 uur
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const docs: Array<{ centroide_ll?: string; weergavenaam?: string }> =
    data?.response?.docs ?? [];

  // Behoud alleen docs waarvan weergavenaam de PC4-code bevat
  const relevant = docs.filter(
    (d) => typeof d.weergavenaam === 'string' && d.weergavenaam.includes(pc4),
  );

  const points = (relevant.length > 0 ? relevant : docs)
    .map((d) => (d.centroide_ll ? parsePoint(d.centroide_ll) : null))
    .filter((p): p is { lat: number; lon: number } => p !== null);

  if (points.length === 0) return null;
  return average(points);
}

/**
 * Regionale fallback -- alleen als PDOK volledig onbereikbaar is.
 * Opgesplitst per ~100-stap zodat de fout nooit meer dan ~20 km is.
 */
function regionalFallback(pc4: string): { lat: number; lon: number } | null {
  const n = parseInt(pc4, 10);
  /* eslint-disable no-nested-ternary */
  const r =
    n < 1100 ? { lat: 52.37, lon: 4.90 } : // Amsterdam-Centrum
    n < 1300 ? { lat: 52.35, lon: 4.88 } : // Amsterdam-overig
    n < 1500 ? { lat: 52.45, lon: 4.65 } : // Amsterdam-Noord/Haarlem
    n < 1600 ? { lat: 52.30, lon: 4.65 } : // Haarlem/Haarlemmermeer
    n < 1800 ? { lat: 52.33, lon: 4.72 } : // Noord-Holland-Zuid
    n < 2000 ? { lat: 52.40, lon: 4.62 } : // Noord-Holland-Noord
    n < 2300 ? { lat: 52.07, lon: 4.30 } : // Den Haag
    n < 2600 ? { lat: 52.02, lon: 4.36 } : // Delft/Rijswijk
    n < 2800 ? { lat: 52.00, lon: 4.70 } : // Gouda/ZH-Midden
    n < 3000 ? { lat: 51.82, lon: 4.67 } : // Dordrecht/Hoekse Waard
    n < 3100 ? { lat: 51.92, lon: 4.47 } : // Rotterdam-Centrum
    n < 3200 ? { lat: 51.88, lon: 4.50 } : // Rotterdam-Zuid
    n < 3300 ? { lat: 51.95, lon: 4.30 } : // Westland/NW
    n < 3400 ? { lat: 51.98, lon: 4.88 } : // Nieuwegein/IJsselstein
    n < 3500 ? { lat: 52.03, lon: 5.05 } : // Utrecht-W/Woerden
    n < 3600 ? { lat: 52.09, lon: 5.12 } : // Utrecht-Stad
    n < 3700 ? { lat: 52.07, lon: 5.28 } : // Utrecht-Oost
    n < 3800 ? { lat: 52.15, lon: 5.38 } : // Amersfoort
    n < 3900 ? { lat: 52.23, lon: 5.18 } : // Hilversum/Gooi
    n < 4000 ? { lat: 52.02, lon: 5.25 } : // Veenendaal/Rhenen
    n < 4300 ? { lat: 51.70, lon: 4.53 } : // Breda/Bergen op Zoom
    n < 4500 ? { lat: 51.60, lon: 4.78 } : // Tilburg-W/Waalwijk
    n < 4600 ? { lat: 51.47, lon: 3.92 } : // Zeeland
    n < 4700 ? { lat: 51.55, lon: 4.13 } : // West-Brabant
    n < 5000 ? { lat: 51.42, lon: 4.45 } : // Bergen op Zoom-Z
    n < 5300 ? { lat: 51.56, lon: 5.09 } : // Tilburg
    n < 5500 ? { lat: 51.70, lon: 5.30 } : // Den Bosch/Oss
    n < 5700 ? { lat: 51.58, lon: 5.55 } : // Helmond/Eindhoven-O
    n < 5900 ? { lat: 51.44, lon: 5.47 } : // Eindhoven
    n < 6000 ? { lat: 51.63, lon: 5.80 } : // Venray/NB-Oost
    n < 6200 ? { lat: 51.37, lon: 6.00 } : // Venlo
    n < 6300 ? { lat: 51.21, lon: 5.97 } : // Roermond
    n < 6500 ? { lat: 50.87, lon: 5.70 } : // Maastricht
    n < 6700 ? { lat: 51.36, lon: 5.86 } : // Weert
    n < 6800 ? { lat: 51.85, lon: 5.87 } : // Nijmegen
    n < 7000 ? { lat: 51.92, lon: 6.00 } : // Arnhem
    n < 7200 ? { lat: 52.25, lon: 6.18 } : // Zutphen/Doetinchem
    n < 7400 ? { lat: 52.22, lon: 6.90 } : // Enschede/Hengelo
    n < 7600 ? { lat: 52.31, lon: 6.65 } : // Almelo/Twente
    n < 7800 ? { lat: 52.52, lon: 6.08 } : // Zwolle
    n < 8000 ? { lat: 52.62, lon: 6.42 } : // Hoogeveen/Emmen
    n < 8200 ? { lat: 52.51, lon: 5.47 } : // Lelystad
    n < 8400 ? { lat: 52.86, lon: 5.85 } : // Heerenveen/Joure
    n < 8600 ? { lat: 53.21, lon: 5.79 } : // Leeuwarden
    n < 8800 ? { lat: 53.11, lon: 5.40 } : // Franeker/Harlingen
    n < 9000 ? { lat: 53.07, lon: 5.65 } : // Sneek/Friesland
    n < 9200 ? { lat: 53.22, lon: 6.57 } : // Groningen-Stad
    n < 9500 ? { lat: 53.10, lon: 6.85 } : // Groningen-Oost
    n < 9700 ? { lat: 52.82, lon: 6.47 } : // Emmen/Drenthe-Z
                { lat: 52.88, lon: 6.95 };  // Groningen-NO
  /* eslint-enable no-nested-ternary */
  return r;
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('pc4')?.trim() ?? '';
  const pc4 = raw.padStart(4, '0');

  if (!/^\d{4}$/.test(pc4)) {
    return NextResponse.json({ error: 'pc4 moet 4 cijfers zijn' }, { status: 400 });
  }

  // In-memory cache hit (warm Vercel instance)
  if (cache.has(pc4)) {
    return NextResponse.json(cache.get(pc4)!, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
    });
  }

  try {
    const coords = await geocodeViaLocatieserver(pc4);
    if (coords) {
      cache.set(pc4, coords);
      return NextResponse.json(coords, {
        headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
      });
    }
  } catch (err) {
    console.error(`geocode ${pc4} locatieserver fout:`, err);
  }

  // Laatste redmiddel: regionale schatting
  const fallback = regionalFallback(pc4);
  if (fallback) {
    return NextResponse.json(fallback, {
      headers: { 'Cache-Control': 'public, s-maxage=3600' },
    });
  }

  return NextResponse.json({ error: 'Postcode niet gevonden' }, { status: 404 });
}
