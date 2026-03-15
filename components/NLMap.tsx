'use client';
import { useEffect, useRef } from 'react';

interface NLMapProps {
  center: { lat: number; lon: number } | null;
  straalKm: number;
  onPc4sFound?: (pc4s: string[]) => void;
}

const PDOK_ITEMS = 'https://api.pdok.nl/cbs/postcode4/ogc/v1/collections/postcode4/items';
const CRS84 = 'http://www.opengis.net/def/crs/OGC/1.3/CRS84';

// Bereken bbox in graden vanuit centrum + straal
function bboxFromCenter(lat: number, lon: number, radiusKm: number) {
  const dLat = radiusKm / 111;
  const dLon = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
  return {
    minLon: lon - dLon, minLat: lat - dLat,
    maxLon: lon + dLon, maxLat: lat + dLat,
  };
}

// Haal Leaflet rings ([lat,lon]) op uit GeoJSON Polygon of MultiPolygon
function ringsFromGeometry(geometry: { type: string; coordinates: unknown }): [number, number][][] {
  const rings: [number, number][][] = [];

  function processRing(ring: unknown[]): [number, number][] {
    return (ring as number[][]).map(([lon, lat]) => [lat, lon]);
  }

  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates as unknown[][];
    if (coords[0]) rings.push(processRing(coords[0]));
  } else if (geometry.type === 'MultiPolygon') {
    const polys = geometry.coordinates as unknown[][][];
    for (const poly of polys) {
      if (poly[0]) rings.push(processRing(poly[0]));
    }
  }

  return rings;
}

// Haal PC4-grenzen op via PDOK Kadaster OGC API Features (CBS postcode4 dataset)
async function fetchPC4Grenzen(
  lat: number,
  lon: number,
  radiusKm: number,
  signal: AbortSignal
): Promise<{ pc4: string; rings: [number, number][][] }[]> {
  const { minLon, minLat, maxLon, maxLat } = bboxFromCenter(lat, lon, radiusKm * 1.25);
  const url =
    `${PDOK_ITEMS}?bbox=${minLon},${minLat},${maxLon},${maxLat}` +
    `&f=json&limit=500&crs=${encodeURIComponent(CRS84)}`;

  const res = await fetch(url, {
    headers: { Accept: 'application/geo+json' },
    signal,
  });
  if (!res.ok) return [];

  const data = await res.json();
  const features = (data.features ?? []) as Array<{
    geometry: { type: string; coordinates: unknown } | null;
    properties: Record<string, unknown>;
  }>;

  // Dedupliceer: per postcode de meest recente jaarcode bewaren
  const byPc4 = new Map<string, typeof features[0]>();
  for (const f of features) {
    const pc4 = String(f.properties.postcode).padStart(4, '0');
    if (!/^\d{4}$/.test(pc4)) continue;
    const existing = byPc4.get(pc4);
    if (!existing || Number(f.properties.jaarcode) > Number(existing.properties.jaarcode)) {
      byPc4.set(pc4, f);
    }
  }

  const results: { pc4: string; rings: [number, number][][] }[] = [];
  for (const [pc4, feature] of Array.from(byPc4)) {
    if (!feature.geometry) continue;
    const rings = ringsFromGeometry(feature.geometry);
    if (rings.length) results.push({ pc4, rings });
  }

  return results;
}

// Controleer of het centrum nabij de grens ligt (< 30 km van DE of BE)
function isGrensgebied(lat: number, lon: number): boolean {
  return lon > 6.4 || lat < 51.5;
}

export default function NLMap({ center, straalKm, onPc4sFound }: NLMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);
  const baseLayersRef = useRef<unknown[]>([]);   // cirkel + stip — update direct
  const pc4LayersRef = useRef<unknown[]>([]);    // polygonen + labels — bewaar tot nieuwe klaar
  // Keep backward compat alias used elsewhere in the component
  const layersRef = { current: [] as unknown[] }; // unused stub

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

  // Cirkel + PC4-grenzen updaten als center of straal wijzigt
  useEffect(() => {
    if (!leafletMapRef.current || !center) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet') as typeof import('leaflet');
    const map = leafletMapRef.current as import('leaflet').Map;
    const coords: [number, number] = [center.lat, center.lon];

    // Verwijder alleen base lagen (cirkel + stip) — PC4 blijft staan tot nieuwe klaar zijn
    baseLayersRef.current.forEach(l => (l as import('leaflet').Layer).remove());
    baseLayersRef.current = [];

    // Dekkingscirkel
    const circle = L.circle(coords, {
      radius: straalKm * 1000,
      color: '#00E87A', fillColor: '#00E87A',
      fillOpacity: 0.07, weight: 2, dashArray: '8 5',
    }).addTo(map);
    baseLayersRef.current.push(circle);

    // Centrum-stip
    const dot = L.circleMarker(coords, {
      radius: 5, color: '#00E87A', fillColor: '#00E87A', fillOpacity: 1, weight: 2,
    }).addTo(map);
    baseLayersRef.current.push(dot);

    // Zoom naar het gebied (geen animatie — voorkomt flicker bij snel aanpassen)
    const zoom = straalKm <= 5 ? 12 : straalKm <= 10 ? 11 : straalKm <= 20 ? 10 : 9;
    map.setView(coords, zoom);

    // PC4-polygonen asynchroon laden — pas vervangen als nieuwe data klaar is
    const controller = new AbortController();
    fetchPC4Grenzen(center.lat, center.lon, straalKm, controller.signal)
      .then(gebieden => {
        if (!leafletMapRef.current || controller.signal.aborted) return;

        // Nu pas oude PC4 lagen verwijderen en nieuwe toevoegen (geen flicker)
        pc4LayersRef.current.forEach(l => (l as import('leaflet').Layer).remove());
        pc4LayersRef.current = [];

        if (onPc4sFound) onPc4sFound(gebieden.map(g => g.pc4).sort());
        for (const { pc4, rings } of gebieden) {
          for (const ring of rings) {
            const poly = L.polygon(ring as [number, number][], {
              color: '#00E87A', weight: 1.5, opacity: 0.9,
              fillColor: '#00E87A', fillOpacity: 0.08,
            }).addTo(map);
            pc4LayersRef.current.push(poly);

            // PC4-label op centroid van de bounding box
            const polyCenter = poly.getBounds().getCenter();
            const label = L.marker(polyCenter, {
              interactive: false,
              icon: L.divIcon({
                html: `<span style="font:700 9px/1 monospace;color:#00E87A;background:rgba(10,10,10,0.75);padding:2px 5px;border-radius:2px;white-space:nowrap;pointer-events:none">${pc4}</span>`,
                iconAnchor: [18, 7], className: '',
              }),
            }).addTo(map);
            pc4LayersRef.current.push(label);
          }
        }
      })
      .catch(() => {});

    return () => { controller.abort(); };
  }, [center, straalKm, onPc4sFound]);

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
            {straalKm} km straal · PC4-grenzen laden…
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
