import { NextRequest, NextResponse } from 'next/server';
import { getVerhuisgraadVoorPc4 } from '@/lib/cbsData';
import { PC4_COORDS } from '@/lib/pc4Coords';

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// PC4 sample voor pc4Count schatting (kleine hardcoded set – kaart gebruikt Overpass)
const PC4_SAMPLE: [string, number, number][] = [
  ['1012', 52.373, 4.893], ['1013', 52.381, 4.876], ['1015', 52.376, 4.878],
  ['1016', 52.366, 4.882], ['1017', 52.360, 4.891], ['1018', 52.363, 4.906],
  ['1054', 52.371, 4.857], ['1055', 52.377, 4.848], ['1056', 52.371, 4.843],
  ['1062', 52.351, 4.828], ['1063', 52.346, 4.837], ['1065', 52.335, 4.847],
  ['1066', 52.326, 4.854], ['1067', 52.323, 4.833], ['1068', 52.326, 4.820],
  ['3011', 51.921, 4.481], ['3012', 51.918, 4.488], ['3013', 51.924, 4.472],
  ['3014', 51.930, 4.465], ['3015', 51.909, 4.469], ['3021', 51.915, 4.459],
  ['3022', 51.910, 4.451], ['3024', 51.905, 4.437], ['3031', 51.928, 4.504],
  ['3032', 51.937, 4.511], ['3033', 51.929, 4.522], ['3034', 51.921, 4.514],
  ['3511', 52.090, 5.124], ['3512', 52.094, 5.111], ['3513', 52.088, 5.135],
  ['3514', 52.082, 5.118], ['3515', 52.075, 5.108], ['3521', 52.070, 5.130],
  ['3522', 52.064, 5.135], ['3524', 52.067, 5.141], ['3531', 52.088, 5.098],
  ['2511', 52.077, 4.307], ['2512', 52.073, 4.316], ['2513', 52.080, 4.323],
  ['2514', 52.086, 4.319], ['2515', 52.093, 4.329], ['2516', 52.084, 4.340],
  ['5611', 51.438, 5.479], ['5612', 51.444, 5.472], ['5613', 51.450, 5.465],
  ['5614', 51.437, 5.465], ['5615', 51.430, 5.473], ['5616', 51.424, 5.480],
  ['9711', 53.218, 6.559], ['9712', 53.213, 6.567], ['9713', 53.207, 6.574],
  ['9714', 53.201, 6.562], ['9715', 53.195, 6.554], ['9716', 53.196, 6.541],
  ['2023', 52.382, 4.636], ['2024', 52.389, 4.640], ['2025', 52.396, 4.645],
  ['2026', 52.374, 4.648], ['2027', 52.367, 4.655],
];

// In-memory geocode cache — overleeft meerdere requests op dezelfde Vercel instance
const GEOCODE_CACHE = new Map<string, { lat: number; lon: number }>();

function isNLCoord(lat: number, lon: number) {
  return lat > 50.5 && lat < 54 && lon > 3 && lon < 7.6;
}

async function nominatimQuery(url: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LokaalKabaal/1.0 (lokaalkabaal.vercel.app)' },
      cache: 'no-store', // eigen in-memory cache vervangt Next.js fetch cache
    });
    if (!res.ok) return null;
    const data = await res.json();
    for (const r of Array.isArray(data) ? data : []) {
      const lat = parseFloat(r.lat), lon = parseFloat(r.lon);
      if (isNLCoord(lat, lon)) return { lat, lon };
    }
  } catch { /* ignore */ }
  return null;
}

async function geocodePC4(pc4: string): Promise<{ lat: number; lon: number } | null> {
  // 1. Uitgebreide CBS/Kadaster lookup (hoogste prioriteit — ~600 PC4s)
  const fromCoords = PC4_COORDS[pc4];
  if (fromCoords) return { lat: fromCoords[0], lon: fromCoords[1] };

  // 2. Kleine hardcoded sample als extra backup
  const inSample = PC4_SAMPLE.find(([p]) => p === pc4);
  if (inSample) return { lat: inSample[1], lon: inSample[2] };

  // 3. In-memory cache
  if (GEOCODE_CACHE.has(pc4)) return GEOCODE_CACHE.get(pc4)!;

  // 3. Nominatim gestructureerde query
  let result = await nominatimQuery(
    `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pc4)}&countrycodes=nl&format=json&limit=3`
  );

  // 4. Nominatim vrije-tekst query als fallback (werkt beter voor kleine PC4s)
  if (!result) {
    result = await nominatimQuery(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pc4 + ' Nederland')}&format=json&limit=5&countrycodes=nl`
    );
  }

  if (result) {
    GEOCODE_CACHE.set(pc4, result);
    return result;
  }

  // 5. Formule per PC4-subbereik als laatste redmiddel
  const n = parseInt(pc4, 10);
  let coords: { lat: number; lon: number } | null = null;
  if (n >= 1000 && n <= 1299) coords = { lat: 52.370 + (n - 1000) * 0.001, lon: 4.900 };
  else if (n >= 1300 && n <= 1999) coords = { lat: 52.380 + (n - 1300) * 0.0005, lon: 4.750 };
  else if (n >= 2000 && n <= 2599) coords = { lat: 52.090 + (n - 2000) * 0.001, lon: 4.350 };
  else if (n >= 2600 && n <= 2999) coords = { lat: 52.010 + (n - 2600) * 0.0004, lon: 4.380 };
  else if (n >= 3000 && n <= 3599) coords = { lat: 51.920 + (n - 3000) * 0.0005, lon: 4.500 };
  else if (n >= 3600 && n <= 3999) coords = { lat: 52.090 + (n - 3600) * 0.001, lon: 5.100 };
  else if (n >= 4000 && n <= 4999) coords = { lat: 51.700 + (n - 4000) * 0.0003, lon: 4.600 };
  else if (n >= 5000 && n <= 5999) coords = { lat: 51.580 + (n - 5000) * 0.0002, lon: 5.100 };
  else if (n >= 6000 && n <= 6999) coords = { lat: 51.500 + (n - 6000) * 0.0003, lon: 5.800 };
  else if (n >= 7000 && n <= 7699) coords = { lat: 52.220 + (n - 7000) * 0.0002, lon: 6.180 };
  else if (n >= 7700 && n <= 7799) coords = { lat: 52.570 + (n - 7700) * 0.0003, lon: 6.590 }; // Hardenberg/Coevorden
  else if (n >= 7800 && n <= 7999) coords = { lat: 52.770 + (n - 7800) * 0.0001, lon: 6.890 }; // Emmen
  else if (n >= 8000 && n <= 8999) coords = { lat: 52.500 + (n - 8000) * 0.0002, lon: 5.900 };
  else if (n >= 9000 && n <= 9999) coords = { lat: 53.000 + (n - 9000) * 0.0001, lon: 6.550 };
  if (coords) GEOCODE_CACHE.set(pc4, coords);
  return coords;
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

    const buffer = 2;
    const selected = PC4_SAMPLE
      .filter(([, lat, lon]) => haversine(center.lat, center.lon, lat, lon) <= straalKm + buffer)
      .map(([p]) => p);

    const oppervlakte = Math.PI * straalKm * straalKm;
    const estimatedPc4Count = Math.max(selected.length, Math.round(oppervlakte / 11));

    // CBS-gebaseerde verhuisgraad — synchroon uit gecached embedded dataset
    const { rate: verhuisgraad, gm: gemeenteCode } = getVerhuisgraadVoorPc4(pc4);

    const totalAdressen = Math.round(oppervlakte * 580);
    return NextResponse.json({
      center,
      pc4Gebieden: selected,
      pc4Count: estimatedPc4Count,
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
