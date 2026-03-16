import { NextRequest, NextResponse } from 'next/server';

const PDOK = 'https://api.pdok.nl/cbs/postcode4/ogc/v1/collections/postcode4/items';
const CRS84 = 'http://www.opengis.net/def/crs/OGC/1.3/CRS84';

export async function GET(req: NextRequest) {
  const bbox = req.nextUrl.searchParams.get('bbox');
  if (!bbox) return NextResponse.json({ error: 'missing bbox' }, { status: 400 });

  const url = `${PDOK}?bbox=${bbox}&f=json&limit=500&crs=${encodeURIComponent(CRS84)}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/geo+json' },
      // Next.js server-side cache: 1 uur
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error(`PDOK pc4grenzen: HTTP ${res.status} for bbox=${bbox}`);
      return NextResponse.json({ error: `PDOK ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (err) {
    console.error('PDOK pc4grenzen fetch failed:', err);
    return NextResponse.json({ error: 'PDOK niet bereikbaar' }, { status: 502 });
  }
}
