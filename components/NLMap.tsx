'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
import L from 'leaflet';
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// PC4 to rough coordinates for common Dutch postcodes
const PC4_COORDS: Record<string, [number, number]> = {
  '1000': [52.374, 4.890], '1011': [52.374, 4.901], '1054': [52.368, 4.871],
  '2000': [52.379, 4.636], '2501': [52.074, 4.300], '2502': [52.076, 4.306],
  '3000': [51.923, 4.478], '3011': [51.921, 4.480], '3500': [52.091, 5.118],
  '3511': [52.093, 5.111], '4000': [51.864, 5.867], '4811': [51.589, 4.777],
  '5000': [51.566, 5.076], '5611': [51.441, 5.479], '6000': [51.199, 5.985],
  '6200': [50.851, 5.688], '6811': [51.986, 5.920], '7000': [51.868, 6.023],
  '7400': [52.258, 6.163], '8000': [52.512, 5.472], '8900': [53.201, 5.800],
  '9000': [53.217, 6.567], '9700': [53.219, 6.566],
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 11, { duration: 1 });
  }, [lat, lng]);
  return null;
}

interface NLMapProps {
  centrum: string;
  straalKm: number;
}

export default function NLMap({ centrum, straalKm }: NLMapProps) {
  const [coords, setCoords] = useState<[number, number]>([52.25, 5.25]);
  const [hasCenter, setHasCenter] = useState(false);

  useEffect(() => {
    if (!centrum || centrum.trim().length < 4) return;

    const pc4 = centrum.trim().replace(/\s.*/g, '').slice(0, 4);

    // Try static lookup first
    const match = PC4_COORDS[pc4];
    if (match) {
      setCoords(match);
      setHasCenter(true);
      return;
    }

    // Fallback: Nominatim geocoding
    const geocode = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(centrum + ', Nederland')}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'nl' } }
        );
        const data = await res.json();
        if (data?.[0]) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          setHasCenter(true);
        }
      } catch {
        // keep default
      }
    };
    geocode();
  }, [centrum]);

  return (
    <div style={{ height: '280px', width: '100%', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--line)' }}>
      <MapContainer
        center={coords}
        zoom={hasCenter ? 11 : 7}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasCenter && (
          <Circle
            center={coords}
            radius={straalKm * 1000}
            pathOptions={{
              color: '#00E87A',
              fillColor: '#00E87A',
              fillOpacity: 0.12,
              weight: 2,
            }}
          />
        )}
        <RecenterMap lat={coords[0]} lng={coords[1]} />
      </MapContainer>
    </div>
  );
}
