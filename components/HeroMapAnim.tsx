'use client';

import { useEffect, useState } from 'react';

// ─── City dots: % positions within the bounding box (NL roughly mapped) ────
const DOTS = [
  { x: 36, y: 39, city: 'Amsterdam',  pc4: '1024 TA' },
  { x: 22, y: 52, city: 'Den Haag',   pc4: '2514 GR' },
  { x: 27, y: 57, city: 'Rotterdam',  pc4: '3011 BH' },
  { x: 44, y: 48, city: 'Utrecht',    pc4: '3571 AP' },
  { x: 50, y: 68, city: 'Eindhoven',  pc4: '5613 JT' },
  { x: 68, y: 13, city: 'Groningen',  pc4: '9712 KA' },
  { x: 38, y: 67, city: 'Tilburg',    pc4: '5038 MH' },
  { x: 62, y: 53, city: 'Arnhem',     pc4: '6811 JG' },
  { x: 30, y: 29, city: 'Alkmaar',    pc4: '1811 AZ' },
  { x: 62, y: 34, city: 'Zwolle',     pc4: '8011 PV' },
  { x: 25, y: 47, city: 'Leiden',     pc4: '2311 BC' },
  { x: 33, y: 72, city: 'Breda',      pc4: '4818 SC' },
];

const NOTIFICATIONS = [
  { city: 'Amsterdam',  pc4: '1024 TA', count: 47 },
  { city: 'Rotterdam',  pc4: '3011 BH', count: 63 },
  { city: 'Utrecht',    pc4: '3571 AP', count: 38 },
  { city: 'Den Haag',   pc4: '2514 GR', count: 55 },
  { city: 'Eindhoven',  pc4: '5613 JT', count: 29 },
];

export default function HeroMapAnim() {
  const [activeDotIdx, setActiveDotIdx] = useState(0);
  const [notifIdx, setNotifIdx]         = useState(0);
  const [notifVisible, setNotifVisible] = useState(true);

  // Cycle through active dot
  useEffect(() => {
    const t = setInterval(() => setActiveDotIdx(i => (i + 1) % DOTS.length), 900);
    return () => clearInterval(t);
  }, []);

  // Swap notification card
  useEffect(() => {
    const t = setInterval(() => {
      setNotifVisible(false);
      setTimeout(() => {
        setNotifIdx(i => (i + 1) % NOTIFICATIONS.length);
        setNotifVisible(true);
      }, 350);
    }, 3200);
    return () => clearInterval(t);
  }, []);

  const n = NOTIFICATIONS[notifIdx];

  return (
    <div style={{
      position: 'relative',
      width: '340px',
      height: '400px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      overflow: 'hidden',
      flexShrink: 0,
    }}>

      {/* Dot-grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        pointerEvents: 'none',
      }} />

      {/* Top fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '56px',
        background: 'linear-gradient(to bottom, #0A0A0A 0%, transparent 100%)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* Status badge */}
      <div style={{
        position: 'absolute', top: '14px', left: '14px', zIndex: 3,
        display: 'flex', alignItems: 'center', gap: '7px',
      }}>
        <span style={{
          width: '7px', height: '7px',
          background: 'var(--green)', borderRadius: '50%',
          display: 'inline-block',
          boxShadow: '0 0 0 3px rgba(0,232,122,0.2)',
        }} />
        <span style={{
          fontSize: '10px', fontFamily: 'var(--font-mono)',
          color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>Live · Nederland</span>
      </div>

      {/* Batch counter top-right */}
      <div style={{
        position: 'absolute', top: '14px', right: '14px', zIndex: 3,
        display: 'flex', alignItems: 'center', gap: '5px',
        background: 'rgba(0,232,122,0.08)',
        border: '1px solid rgba(0,232,122,0.2)',
        borderRadius: '20px', padding: '3px 10px',
      }}>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 700 }}>
          25 apr
        </span>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>
          volgende batch
        </span>
      </div>

      {/* City dots */}
      {DOTS.map((dot, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${dot.x}%`, top: `${dot.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 3,
        }}>
          {/* Pulse ring on active dot */}
          {i === activeDotIdx && (
            <div key={activeDotIdx + '-ring'} style={{
              position: 'absolute',
              width: '20px', height: '20px',
              borderRadius: '50%',
              border: '1.5px solid var(--green)',
              top: '50%', left: '50%',
              animation: 'mapPulse 1s ease-out forwards',
              pointerEvents: 'none',
            }} />
          )}

          {/* Dot itself */}
          <div style={{
            width: i === activeDotIdx ? '8px' : '5px',
            height: i === activeDotIdx ? '8px' : '5px',
            background: i === activeDotIdx ? 'var(--green)' : 'rgba(0,232,122,0.3)',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            boxShadow: i === activeDotIdx ? '0 0 10px rgba(0,232,122,0.7)' : 'none',
          }} />

          {/* City name above active dot */}
          {i === activeDotIdx && (
            <div style={{
              position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)',
              fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--green)',
              whiteSpace: 'nowrap', animation: 'notifSlideIn 0.2s ease',
            }}>
              {dot.city}
            </div>
          )}
        </div>
      ))}

      {/* Notification card */}
      <div style={{
        position: 'absolute', bottom: '14px', left: '14px', right: '14px',
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0,232,122,0.2)',
        borderRadius: '10px', padding: '14px',
        zIndex: 4,
        opacity: notifVisible ? 1 : 0,
        transform: notifVisible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>
              Nieuwe eigenaar
            </div>
            <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600, letterSpacing: '-0.01em' }}>
              {n.pc4} · {n.city}
            </div>
          </div>
          <div style={{
            width: '8px', height: '8px', background: 'var(--green)', borderRadius: '50%',
            boxShadow: '0 0 8px rgba(0,232,122,0.6)',
          }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px',
        }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
            Jouw flyer op weg
          </span>
          <span style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {n.count} verstuurd ↗
          </span>
        </div>
      </div>
    </div>
  );
}
