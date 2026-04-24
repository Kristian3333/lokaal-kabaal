'use client';

/**
 * ActivityTicker -- anonymised live-ish activity strip on the landing page.
 *
 * Items rotate every few seconds to manufacture a sense of activity
 * without fabricating individual retailer identities. Each entry is a
 * realistic composite (sector + city + generic action). No real
 * retailer names or addresses are shown.
 */

import { useEffect, useState } from 'react';

const POOL: string[] = [
  'Kapsalon in Utrecht · 312 flyers ingepland voor komende cyclus',
  'Installateur in Amersfoort · conversie geregistreerd via QR-scan',
  'Bakker in Amsterdam · 120 nieuwe bewoners gevonden deze maand',
  'Restaurant in Rotterdam · follow-up flyer verstuurd naar niet-scanners',
  'Fysio in Den Haag · 6e maand actief, 14% conversie',
  'Makelaar in Haarlem · campagne gedupliceerd naar nieuwe wijk',
  'Schoonheidssalon in Eindhoven · pincode-conversie net geregistreerd',
  'Bloemist in Nijmegen · 480 flyers bezorgd afgelopen nacht',
  'Fietsenwinkel in Groningen · jaarcontract opgewaardeerd',
  'Tandarts in Leiden · eerste batch van 300 op weg naar de drukker',
];

export default function ActivityTicker(): React.JSX.Element {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx(v => (v + 1) % POOL.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const current = POOL[idx];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 14px',
        background: 'rgba(0,232,122,0.06)',
        border: '1px solid rgba(0,232,122,0.2)',
        borderRadius: '999px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--green-dim)',
        maxWidth: '100%',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '7px',
          height: '7px',
          background: 'var(--green)',
          borderRadius: '50%',
          boxShadow: '0 0 8px rgba(0,232,122,0.6)',
          flexShrink: 0,
        }}
      />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {current}
      </span>
    </div>
  );
}
