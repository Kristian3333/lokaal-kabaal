'use client';
import { useEffect, useRef } from 'react';

interface NLMapProps {
  center: { lat: number; lon: number } | null;
  straalKm: number;
  centrumPc4?: string;
  onPc4sFound?: (pc4s: string[]) => void;
}

function bboxFromCenter(lat: number, lon: number, radiusKm: number) {
  const dLat = radiusKm / 111;
  const dLon = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
  return { minLon: lon - dLon, minLat: lat - dLat, maxLon: lon + dLon, maxLat: lat + dLat };
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Bounding-box middelpunt is veel betrouwbaarder dan vertex-gemiddelde voor
// langgerekte of L-vormige PC4-gebieden.
function ringBboxCenter(ring: [number, number][]): [number, number] {
  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
  for (const [la, lo] of ring) {
    if (la < minLat) minLat = la;
    if (la > maxLat) maxLat = la;
    if (lo < minLon) minLon = lo;
    if (lo > maxLon) maxLon = lo;
  }
  return [(minLat + maxLat) / 2, (minLon + maxLon) / 2];
}

// Ray-casting point-in-polygon — ring is [lat, lon][] (Leaflet formaat)
function pointInRing(lat: number, lon: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [iLat, iLon] = ring[i];
    const [jLat, jLon] = ring[j];
    if (((iLon > lon) !== (jLon > lon)) &&
        lat < (jLat - iLat) * (lon - iLon) / (jLon - iLon) + iLat) {
      inside = !inside;
    }
  }
  return inside;
}

// GeoJSON coordinates zijn [lon, lat]; Leaflet wil [lat, lon]
function ringsFromGeometry(geometry: { type: string; coordinates: unknown }): [number, number][][] {
  const rings: [number, number][][] = [];
  function toLeaflet(ring: unknown[]): [number, number][] {
    return (ring as number[][]).map(([lon, lat]) => [lat, lon]);
  }
  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates as unknown[][];
    if (coords[0]) rings.push(toLeaflet(coords[0]));
  } else if (geometry.type === 'MultiPolygon') {
    const polys = geometry.coordinates as unknown[][][];
    for (const poly of polys) {
      if (poly[0]) rings.push(toLeaflet(poly[0]));
    }
  }
  return rings;
}

// Haal PC4-veldnaam op uit properties — PDOK heeft dit soms hernoemd
function extractPc4(props: Record<string, unknown>): string | null {
  for (const key of ['postcode', 'postcode4', 'pc4', 'PC4', 'Postcode4']) {
    const v = props[key];
    if (v != null) {
      const s = String(v).replace(/\s/g, '').padStart(4, '0');
      if (/^\d{4}$/.test(s)) return s;
    }
  }
  return null;
}

async function fetchPC4Grenzen(
  lat: number,
  lon: number,
  radiusKm: number,
  signal: AbortSignal,
  centrumPc4?: string,
): Promise<{ pc4: string; rings: [number, number][][] }[]> {
  // Gebruik minimaal 5 km bbox zodat het centrum-polygon altijd gevonden wordt,
  // ook als de geocoder licht afwijkt (bijv. 7761 vs 7766 Schoonebeek).
  const searchRadius = Math.max(radiusKm, 5);
  const { minLon, minLat, maxLon, maxLat } = bboxFromCenter(lat, lon, searchRadius * 1.1);
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

  // Server-side proxy — geen CORS-problemen, cached door Next.js
  const res = await fetch(`/api/pc4grenzen?bbox=${bbox}`, { signal });
  if (!res.ok) {
    console.error(`pc4grenzen: ${res.status} ${await res.text().catch(() => '')}`);
    return [];
  }

  const data = await res.json();
  const features = (data.features ?? []) as Array<{
    geometry: { type: string; coordinates: unknown } | null;
    properties: Record<string, unknown>;
  }>;

  // Dedupliceer: bewaar nieuwste jaarcode per PC4
  const byPc4 = new Map<string, typeof features[0]>();
  for (const f of features) {
    const pc4 = extractPc4(f.properties);
    if (!pc4) continue;
    const existing = byPc4.get(pc4);
    const jaarNieuw = Number(f.properties.jaarcode ?? 0);
    const jaarOud = Number(existing?.properties.jaarcode ?? 0);
    if (!existing || jaarNieuw >= jaarOud) byPc4.set(pc4, f);
  }

  console.log('[fetchPC4Grenzen] lat:', lat, 'lon:', lon, 'radius:', radiusKm, 'centrumPc4:', centrumPc4, 'features found:', byPc4.size, Array.from(byPc4.keys()));

  const results: { pc4: string; rings: [number, number][][] }[] = [];
  for (const [pc4, feature] of Array.from(byPc4)) {
    if (!feature.geometry) { console.log('[fetchPC4Grenzen] skip', pc4, '- geen geometry'); continue; }
    const rings = ringsFromGeometry(feature.geometry);
    if (!rings.length) { console.log('[fetchPC4Grenzen] skip', pc4, '- geen rings'); continue; }

    const containsCenter = rings.some(ring => pointInRing(lat, lon, ring));
    const [cLat, cLon] = ringBboxCenter(rings[0]);
    const dist = haversineKm(lat, lon, cLat, cLon);
    console.log(`[fetchPC4Grenzen] ${pc4}: containsCenter=${containsCenter}, bboxDist=${dist.toFixed(2)}km, threshold=${(radiusKm*1.1).toFixed(2)}km`);

    if (!containsCenter && dist > radiusKm * 1.1) continue;

    results.push({ pc4, rings });
  }

  // Centrum-PC4 altijd in resultaten — ook als polygon ontbreekt in dataset
  if (centrumPc4 && !results.find(r => r.pc4 === centrumPc4)) {
    console.log('[fetchPC4Grenzen] force-add centrumPc4:', centrumPc4);
    results.push({ pc4: centrumPc4, rings: [] });
  }
  console.log('[fetchPC4Grenzen] final results:', results.map(r => r.pc4));

  return results;
}

function isGrensgebied(lat: number, lon: number): boolean {
  return lon > 6.4 || lat < 51.5;
}

export default function NLMap({ center, straalKm, centrumPc4, onPc4sFound }: NLMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);
  const baseLayersRef = useRef<unknown[]>([]);
  const pc4LayersRef = useRef<unknown[]>([]);

  const onPc4sFoundRef = useRef(onPc4sFound);
  useEffect(() => { onPc4sFoundRef.current = onPc4sFound; });
  const centrumPc4Ref = useRef(centrumPc4);
  useEffect(() => { centrumPc4Ref.current = centrumPc4; });

  // Kaart initialiseren (eenmalig)
  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet') as typeof import('leaflet');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('leaflet/dist/leaflet.css');

    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: [52.25, 5.25], zoom: 7,
        scrollWheelZoom: false, zoomControl: true,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      leafletMapRef.current = map;
    }

    return () => {
      if (leafletMapRef.current) {
        (leafletMapRef.current as import('leaflet').Map).remove();
        leafletMapRef.current = null;
        baseLayersRef.current = [];
        pc4LayersRef.current = [];
      }
    };
  }, []);

  // Cirkel + PC4 updaten als center of straal wijzigt
  useEffect(() => {
    if (!leafletMapRef.current || !center) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet') as typeof import('leaflet');
    const map = leafletMapRef.current as import('leaflet').Map;
    const coords: [number, number] = [center.lat, center.lon];

    baseLayersRef.current.forEach(l => (l as import('leaflet').Layer).remove());
    baseLayersRef.current = [];

    const circle = L.circle(coords, {
      radius: straalKm * 1000,
      color: '#00E87A', fillColor: '#00E87A',
      fillOpacity: 0.07, weight: 2, dashArray: '6 4',
    }).addTo(map);
    baseLayersRef.current.push(circle);

    const dot = L.circleMarker(coords, {
      radius: 5, color: '#00E87A', fillColor: '#00E87A', fillOpacity: 1, weight: 2,
    }).addTo(map);
    baseLayersRef.current.push(dot);

    const zoom = straalKm <= 5 ? 12 : straalKm <= 10 ? 11 : straalKm <= 20 ? 10 : 9;
    map.setView(coords, zoom);

    const controller = new AbortController();

    fetchPC4Grenzen(center.lat, center.lon, straalKm, controller.signal, centrumPc4)
      .then(gebieden => {
        if (!leafletMapRef.current || controller.signal.aborted) return;

        // Atomische swap: eerst oud verwijderen, dan nieuw toevoegen
        pc4LayersRef.current.forEach(l => (l as import('leaflet').Layer).remove());
        pc4LayersRef.current = [];

        const foundPc4s = gebieden.map(g => g.pc4);
        console.log('[NLMap] fetchPC4Grenzen result:', foundPc4s, '| centrumPc4:', centrumPc4, '| ref:', centrumPc4Ref.current);
        // Centrum-PC4 altijd in de lijst — ook als grenzen-dataset hem niet bevat
        const cp = centrumPc4Ref.current;
        if (cp && !foundPc4s.includes(cp)) foundPc4s.push(cp);
        if (onPc4sFoundRef.current) onPc4sFoundRef.current(foundPc4s.sort());

        for (const { pc4, rings } of gebieden) {
          for (const ring of rings) {
            const poly = L.polygon(ring as [number, number][], {
              color: '#00E87A', weight: 1.5, opacity: 0.9,
              fillColor: '#00E87A', fillOpacity: 0.10,
            }).addTo(map);
            pc4LayersRef.current.push(poly);

            const polyCenter = poly.getBounds().getCenter();
            const label = L.marker(polyCenter, {
              interactive: false,
              icon: L.divIcon({
                html: `<span style="font:700 9px/1 monospace;color:#00E87A;background:rgba(10,10,10,0.78);padding:2px 5px;border-radius:2px;white-space:nowrap;pointer-events:none">${pc4}</span>`,
                iconAnchor: [18, 7], className: '',
              }),
            }).addTo(map);
            pc4LayersRef.current.push(label);
          }
        }
      })
      .catch(err => {
        if (err?.name === 'AbortError') return;
        console.error('NLMap PC4 laden mislukt:', err);
      });

    return () => { controller.abort(); };
  }, [center, straalKm, centrumPc4]);

  const toonGrensWaarschuwing = center && isGrensgebied(center.lat, center.lon);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ position: 'relative' }}>
        <div
          ref={mapRef}
          style={{ height: '280px', width: '100%', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--line)' }}
        />
        {!center ? (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'rgba(250,250,248,0.8)',
            borderRadius: '6px', pointerEvents: 'none',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>
              Voer een postcode in om het gebied te zien
            </span>
          </div>
        ) : (
          <div style={{
            position: 'absolute', bottom: '8px', left: '8px',
            background: 'rgba(10,10,10,0.75)', color: '#fff',
            fontSize: '10px', fontFamily: 'var(--font-mono)',
            padding: '3px 8px', borderRadius: '3px', pointerEvents: 'none',
          }}>
            {straalKm} km straal
          </div>
        )}
      </div>
      {toonGrensWaarschuwing && (
        <div style={{
          background: 'rgba(255,200,50,0.08)', border: '1px solid rgba(255,200,50,0.3)',
          borderRadius: 'var(--radius)', padding: '7px 10px',
          fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(200,160,0,0.9)',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span>⚠</span>
          <span>
            De cirkel kan over de grens vallen. LokaalKabaal bezorgt uitsluitend in Nederland —
            adressen in Duitsland en België worden automatisch uitgesloten.
          </span>
        </div>
      )}
    </div>
  );
}
