'use client';
import { useEffect, useState, useRef } from 'react';

// Static PC4 → lat/lng lookup
const PC4_COORDS: Record<string, [number, number]> = {
  '1000': [52.374, 4.890], '1011': [52.374, 4.901], '1054': [52.368, 4.871],
  '1055': [52.380, 4.857], '1071': [52.355, 4.880], '1072': [52.352, 4.893],
  '2000': [52.379, 4.636], '2501': [52.074, 4.300], '2502': [52.076, 4.306],
  '2510': [52.066, 4.296], '2511': [52.072, 4.312], '2560': [52.041, 4.290],
  '3000': [51.923, 4.478], '3011': [51.921, 4.480], '3500': [52.091, 5.118],
  '3511': [52.093, 5.111], '3512': [52.090, 5.123], '3521': [52.077, 5.142],
  '4000': [51.864, 5.867], '4811': [51.589, 4.777], '4818': [51.594, 4.784],
  '5000': [51.566, 5.076], '5011': [51.563, 5.077], '5200': [51.698, 5.304],
  '5611': [51.441, 5.479], '5612': [51.439, 5.481], '6000': [51.199, 5.985],
  '6200': [50.851, 5.688], '6211': [50.854, 5.695], '6811': [51.986, 5.920],
  '7000': [51.868, 6.023], '7400': [52.258, 6.163], '7411': [52.261, 6.166],
  '7500': [52.261, 6.800], '8000': [52.512, 5.472], '8011': [52.514, 5.469],
  '8900': [53.201, 5.800], '8911': [53.202, 5.799], '9000': [53.217, 6.567],
  '9711': [53.219, 6.566], '9700': [53.219, 6.566],
};

interface NLMapProps {
  centrum: string;
  straalKm: number;
}

export default function NLMap({ centrum, straalKm }: NLMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);
  const circleRef = useRef<unknown>(null);
  const [coords, setCoords] = useState<[number, number]>([52.25, 5.25]);
  const [hasCenter, setHasCenter] = useState(false);

  // Resolve postcode to coordinates
  useEffect(() => {
    if (!centrum || centrum.trim().length < 4) return;
    const pc4 = centrum.trim().replace(/\D/g, '').slice(0, 4);
    const match = PC4_COORDS[pc4];
    if (match) {
      setCoords(match);
      setHasCenter(true);
      return;
    }
    // Nominatim fallback
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(centrum + ', Nederland')}&format=json&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data?.[0]) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          setHasCenter(true);
        }
      })
      .catch(() => {});
  }, [centrum]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) return;
    if (typeof window === 'undefined') return;

    // Dynamically require leaflet
    const L = require('leaflet') as typeof import('leaflet');
    require('leaflet/dist/leaflet.css');

    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: [52.25, 5.25],
        zoom: 7,
        scrollWheelZoom: false,
        zoomControl: true,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      leafletMapRef.current = map;
    }

    return () => {
      if (leafletMapRef.current) {
        (leafletMapRef.current as import('leaflet').Map).remove();
        leafletMapRef.current = null;
        circleRef.current = null;
      }
    };
  }, []);

  // Update circle when coords/radius changes
  useEffect(() => {
    if (!leafletMapRef.current || !hasCenter) return;
    const L = require('leaflet') as typeof import('leaflet');
    const map = leafletMapRef.current as import('leaflet').Map;

    if (circleRef.current) {
      (circleRef.current as import('leaflet').Circle).remove();
    }
    const circle = L.circle(coords, {
      radius: straalKm * 1000,
      color: '#00E87A',
      fillColor: '#00E87A',
      fillOpacity: 0.12,
      weight: 2,
    }).addTo(map);
    circleRef.current = circle;
    map.flyTo(coords, Math.max(8, 13 - Math.floor(straalKm / 8)), { duration: 0.8 });
  }, [coords, straalKm, hasCenter]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapRef}
        style={{ height: '280px', width: '100%', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--line)' }}
      />
      {!hasCenter && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(250,250,248,0.7)', borderRadius: '6px', pointerEvents: 'none',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>
            Voer een postcode in om het gebied te zien
          </span>
        </div>
      )}
    </div>
  );
}
