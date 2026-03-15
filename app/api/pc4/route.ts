import { NextRequest, NextResponse } from 'next/server';
import { getVerhuisgraadVoorPc4 } from '@/lib/cbsData';

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

// Geocode via Nominatim (server-side, gecached 30 dagen door Next.js fetch cache)
async function geocodePC4(pc4: string): Promise<{ lat: number; lon: number } | null> {
  const inSample = PC4_SAMPLE.find(([p]) => p === pc4);
  if (inSample) return { lat: inSample[1], lon: inSample[2] };

  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pc4)}&countrycodes=nl&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LokaalKabaal/1.0 (lokaalkabaal.vercel.app)' },
      next: { revalidate: 86400 * 30 },
    } as RequestInit);
    if (res.ok) {
      const data = await res.json();
      if (data[0]?.lat && data[0]?.lon) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        // Sanity check: Nederland 50.7–53.6°N, 3.3–7.3°O
        if (lat > 50.5 && lat < 54 && lon > 3 && lon < 7.5) {
          return { lat, lon };
        }
      }
    }
  } catch { /* valt door naar formule */ }

  // Formule-schatting als laatste redmiddel
  const num = parseInt(pc4, 10);
  if (num >= 1000 && num <= 1299) return { lat: 52.370 + (num - 1000) * 0.001, lon: 4.900 };
  if (num >= 2000 && num <= 2999) return { lat: 52.090 + (num - 2000) * 0.001, lon: 4.350 };
  if (num >= 3000 && num <= 3599) return { lat: 51.920 + (num - 3000) * 0.0005, lon: 4.500 };
  if (num >= 3600 && num <= 3999) return { lat: 52.090 + (num - 3600) * 0.001, lon: 5.100 };
  if (num >= 4000 && num <= 4999) return { lat: 51.700 + (num - 4000) * 0.0003, lon: 4.600 };
  if (num >= 5000 && num <= 5999) return { lat: 51.580 + (num - 5000) * 0.0002, lon: 5.100 };
  if (num >= 6000 && num <= 6999) return { lat: 51.500 + (num - 6000) * 0.0003, lon: 5.800 };
  if (num >= 7000 && num <= 7999) return { lat: 52.300 + (num - 7000) * 0.0002, lon: 6.700 };
  if (num >= 8000 && num <= 8999) return { lat: 52.500 + (num - 8000) * 0.0002, lon: 5.900 };
  if (num >= 9000 && num <= 9999) return { lat: 53.000 + (num - 9000) * 0.0001, lon: 6.550 };
  return null;
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
