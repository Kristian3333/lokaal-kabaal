import { NextRequest, NextResponse } from 'next/server';

const PDOK_LS = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/free';

// Regionale fallback als locatieserver uitvalt — grof maar beter dan niets
function fallbackCoords(pc4: string): { lat: number; lon: number } | null {
  const n = parseInt(pc4, 10);
  if      (n >= 1000 && n <= 1108) return { lat: 52.36, lon: 4.91 }; // Amsterdam-C
  else if (n >= 1000 && n <= 1299) return { lat: 52.37, lon: 4.89 }; // Amsterdam
  else if (n >= 1300 && n <= 1999) return { lat: 52.30, lon: 4.75 }; // Noord-Holland
  else if (n >= 2000 && n <= 2299) return { lat: 52.07, lon: 4.31 }; // Den Haag
  else if (n >= 2300 && n <= 2999) return { lat: 52.10, lon: 4.35 }; // Zuid-Holland
  else if (n >= 3000 && n <= 3099) return { lat: 51.92, lon: 4.47 }; // Rotterdam-C
  else if (n >= 3100 && n <= 3299) return { lat: 51.85, lon: 4.55 }; // ZH-Zuid
  else if (n >= 3300 && n <= 3499) return { lat: 51.97, lon: 4.95 }; // Utrecht-W
  else if (n >= 3500 && n <= 3599) return { lat: 52.09, lon: 5.12 }; // Utrecht
  else if (n >= 3600 && n <= 3999) return { lat: 52.05, lon: 5.05 }; // Utrecht-prov
  else if (n >= 4000 && n <= 4499) return { lat: 51.70, lon: 4.55 }; // Zeeland/NB-W
  else if (n >= 4500 && n <= 4999) return { lat: 51.46, lon: 3.93 }; // Zeeland
  else if (n >= 5000 && n <= 5299) return { lat: 51.56, lon: 5.09 }; // Tilburg
  else if (n >= 5300 && n <= 5699) return { lat: 51.70, lon: 5.31 }; // Den Bosch
  else if (n >= 5700 && n <= 5999) return { lat: 51.46, lon: 5.47 }; // Eindhoven
  else if (n >= 6000 && n <= 6299) return { lat: 51.22, lon: 5.90 }; // Venlo/Roermond
  else if (n >= 6300 && n <= 6599) return { lat: 50.85, lon: 5.70 }; // Maastricht
  else if (n >= 6600 && n <= 6999) return { lat: 51.85, lon: 5.85 }; // Nijmegen
  else if (n >= 7000 && n <= 7299) return { lat: 52.27, lon: 6.15 }; // Zutphen/Doetinchem
  else if (n >= 7300 && n <= 7599) return { lat: 52.22, lon: 6.90 }; // Enschede/Hengelo
  else if (n >= 7600 && n <= 7999) return { lat: 52.51, lon: 6.10 }; // Zwolle
  else if (n >= 8000 && n <= 8299) return { lat: 52.51, lon: 5.47 }; // Zwolle/Flevo
  else if (n >= 8300 && n <= 8999) return { lat: 52.63, lon: 5.05 }; // Friesland
  else if (n >= 9000 && n <= 9299) return { lat: 53.21, lon: 6.57 }; // Groningen
  else if (n >= 9300 && n <= 9699) return { lat: 53.00, lon: 6.55 }; // Drenthe
  else if (n >= 9700 && n <= 9999) return { lat: 53.10, lon: 6.90 }; // Groningen-O
  return null;
}

export async function GET(req: NextRequest) {
  const pc4 = req.nextUrl.searchParams.get('pc4')?.trim();
  if (!pc4 || !/^\d{4}$/.test(pc4)) {
    return NextResponse.json({ error: 'pc4 moet 4 cijfers zijn' }, { status: 400 });
  }

  try {
    const url = `${PDOK_LS}?q=postcode:${pc4}&rows=1&fq=type:postcode4&fl=centroide_ll`;
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      const centroide: string | undefined = data?.response?.docs?.[0]?.centroide_ll;
      if (centroide) {
        const match = centroide.match(/POINT\(([0-9.]+)\s+([0-9.]+)\)/);
        if (match) {
          const lon = parseFloat(match[1]);
          const lat = parseFloat(match[2]);
          if (lat > 50.5 && lat < 54 && lon > 3 && lon < 7.6) {
            return NextResponse.json({ lat, lon }, {
              headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
            });
          }
        }
      }
    }
  } catch { /* fall through */ }

  const fallback = fallbackCoords(pc4);
  if (fallback) {
    return NextResponse.json(fallback, {
      headers: { 'Cache-Control': 'public, s-maxage=3600' },
    });
  }

  return NextResponse.json({ error: 'Postcode niet gevonden' }, { status: 404 });
}
