'use client';
import { useEffect, useRef } from 'react';

interface NLMapProps {
  center: { lat: number; lon: number } | null;
  straalKm: number;
  onPc4sFound?: (pc4s: string[]) => void;
}

type OverpassElement = {
  type: 'relation' | 'way';
  tags?: Record<string, string>;
  members?: { role: string; geometry?: { lat: number; lon: number }[] }[];
  geometry?: { lat: number; lon: number }[];
};

// Haal PC4-grenzen op via Overpass (OpenStreetMap)
// Zoekt zowel relations als ways met een 4-cijferig postal_code tag
async function fetchPC4Grenzen(
  lat: number,
  lon: number,
  radiusKm: number,
  signal: AbortSignal
): Promise<{ pc4: string; rings: [number, number][][] }[]> {
  const radiusM = Math.round(radiusKm * 1000 * 1.3);
  // Zoek zowel relations (standaard) als ways (kleinere gebieden) met 4-cijferig pc4
  const query = `[out:json][timeout:30];
(
  relation["postal_code"~"^[0-9]{4}$"](around:${radiusM},${lat},${lon});
  way["postal_code"~"^[0-9]{4}$"](around:${radiusM},${lat},${lon});
);
out geom;`;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    signal,
  });
  if (!res.ok) return [];
  const data = await res.json();

  const results: { pc4: string; rings: [number, number][][] }[] = [];

  for (const el of (data.elements ?? []) as OverpassElement[]) {
    const pc4 = el.tags?.postal_code;
    if (!pc4 || !/^\d{4}$/.test(pc4)) continue;

    const rings: [number, number][][] = [];

    if (el.type === 'relation') {
      for (const m of el.members ?? []) {
        if (m.role === 'outer' && Array.isArray(m.geometry) && m.geometry.length > 2) {
          rings.push(m.geometry.map(pt => [pt.lat, pt.lon]));
        }
      }
      // Als geen outer ring gevonden, gebruik alle members
      if (rings.length === 0) {
        for (const m of el.members ?? []) {
          if (Array.isArray(m.geometry) && m.geometry.length > 2) {
            rings.push(m.geometry.map(pt => [pt.lat, pt.lon]));
          }
        }
      }
    } else if (el.type === 'way' && Array.isArray(el.geometry) && el.geometry.length > 2) {
      rings.push(el.geometry.map(pt => [pt.lat, pt.lon]));
    }

    if (rings.length) results.push({ pc4, rings });
  }

  return results;
}

// Controleer of het centrum nabij de grens ligt (< 30km van DE of BE)
function isGrensgebied(lat: number, lon: number): boolean {
  // Ruwe bounding: oostgrens (lon > 6.5), zuidgrens (lat < 51.5)
  return lon > 6.4 || lat < 51.5;
}

export default function NLMap({ center, straalKm, onPc4sFound }: NLMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);
  const layersRef = useRef<unknown[]>([]);

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
        layersRef.current = [];
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

    // Verwijder alle vorige lagen
    layersRef.current.forEach(l => (l as import('leaflet').Layer).remove());
    layersRef.current = [];

    // Dekkingscirkel — altijd getekend, ook over grens
    const circle = L.circle(coords, {
      radius: straalKm * 1000,
      color: '#00E87A', fillColor: '#00E87A',
      fillOpacity: 0.07, weight: 2, dashArray: '8 5',
    }).addTo(map);
    layersRef.current.push(circle);

    // Centrum-stip
    const dot = L.circleMarker(coords, {
      radius: 5, color: '#00E87A', fillColor: '#00E87A', fillOpacity: 1, weight: 2,
    }).addTo(map);
    layersRef.current.push(dot);

    // Zoom naar het gebied
    const zoom = straalKm <= 5 ? 12 : straalKm <= 10 ? 11 : straalKm <= 20 ? 10 : 9;
    map.flyTo(coords, zoom, { duration: 0.8 });

    // PC4-polygonen asynchroon laden via Overpass
    const controller = new AbortController();
    fetchPC4Grenzen(center.lat, center.lon, straalKm, controller.signal)
      .then(gebieden => {
        if (!leafletMapRef.current || controller.signal.aborted) return;
        if (onPc4sFound) onPc4sFound(gebieden.map(g => g.pc4).sort());
        for (const { pc4, rings } of gebieden) {
          for (const ring of rings) {
            const poly = L.polygon(ring as [number, number][], {
              color: '#00E87A', weight: 1.5, opacity: 0.8,
              fillColor: '#00E87A', fillOpacity: 0.05,
            }).addTo(map);
            layersRef.current.push(poly);

            // PC4-label op centroid van de bounding box
            const polyCenter = poly.getBounds().getCenter();
            const label = L.marker(polyCenter, {
              interactive: false,
              icon: L.divIcon({
                html: `<span style="font:700 9px/1 monospace;color:#00E87A;background:rgba(10,10,10,0.75);padding:2px 5px;border-radius:2px;white-space:nowrap;pointer-events:none">${pc4}</span>`,
                iconAnchor: [18, 7], className: '',
              }),
            }).addTo(map);
            layersRef.current.push(label);
          }
        }
      })
      .catch(() => {}); // stil falen als Overpass niet bereikbaar is

    return () => { controller.abort(); };
  }, [center, straalKm]);

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
