'use client';

/**
 * ProductTour -- first-visit guided tour for the dashboard.
 *
 * Pops a dismissible card anchored to nav items (dashboard -> wizard
 * -> flyer -> conversies). Persists "seen" state in localStorage so
 * returning users don't see it again. Shown only after the user has
 * zero campaigns to avoid distracting active retailers.
 */

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'lk_tour_seen';

interface TourStep {
  /** Title shown in the card header */
  titel: string;
  /** Body copy explaining what this area is for */
  tekst: string;
  /** Optional nav-id to highlight by pulsing its border */
  target?: 'dashboard' | 'wizard' | 'flyer' | 'conversies' | 'billing';
}

const STEPS: TourStep[] = [
  {
    titel: 'Welkom bij je LokaalKabaal dashboard',
    tekst: 'Hier beheer je je flyercampagnes. Elke maand gaat er automatisch een batch naar de drukker -- jij hoeft alleen de kaders in te stellen. Druk "Volgende" voor een korte rondleiding van 4 stappen.',
  },
  {
    titel: '1. Nieuwe campagne starten',
    tekst: 'Begin met de "Nieuwe campagne" knop in de sidebar. Een wizard van 8 stappen loodst je door postcodes, werkgebied, flyerformaat en doelgroepfilters. Duurt ca. 20 minuten.',
    target: 'wizard',
  },
  {
    titel: '2. Mijn flyer ontwerpen',
    tekst: 'Upload je eigen ontwerp of gebruik de AI-assistent. Je kunt 3 flyers aanmaken en per campagne kiezen welke je gebruikt. A6 dubbelzijdig is standaard inbegrepen.',
    target: 'flyer',
  },
  {
    titel: '3. Conversies volgen',
    tekst: 'Elke flyer heeft een unieke QR-code. Zodra nieuwe bewoners scannen of bij je in de winkel de code inleveren, zie je dat hier per postcode. Handig om te zien welke wijken het best converteren.',
    target: 'conversies',
  },
  {
    titel: '4. Klaar om te beginnen',
    tekst: 'Maak je eerste flyer, start een campagne, en op de 28e-30e van volgende maand ligt hij bij de eerste nieuwe bewoners op de mat. Je kunt deze tour altijd overslaan.',
  },
];

interface ProductTourProps {
  /** Pass `true` from the dashboard when campaigns.length === 0 */
  isNewUser: boolean;
  /** Jump to a dashboard page when a tour step hits "Ga naar" */
  onGoTo: (target: NonNullable<TourStep['target']>) => void;
}

export default function ProductTour({ isNewUser, onGoTo }: ProductTourProps): React.JSX.Element | null {
  const [idx, setIdx] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isNewUser) return;
    if (localStorage.getItem(STORAGE_KEY) === '1') return;
    setActive(true);
  }, [isNewUser]);

  function dismiss(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, '1');
    }
    setActive(false);
  }

  if (!active) return null;
  const step = STEPS[idx];
  const isLast = idx === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-label="Product tour"
      aria-modal="true"
      style={{
        position: 'fixed', bottom: '20px', right: '20px', zIndex: 900,
        width: 'min(420px, calc(100vw - 40px))',
        background: 'var(--white)',
        border: '1px solid var(--line)', borderRadius: '10px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
        padding: '22px 24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Tour · stap {idx + 1}/{STEPS.length}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Sluit tour"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '16px', lineHeight: 1, padding: 0 }}
        >
          ×
        </button>
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '8px', lineHeight: 1.3 }}>
        {step.titel}
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '16px' }}>
        {step.tekst}
      </p>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '3px' }}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: i <= idx ? 'var(--green)' : 'var(--line)',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {step.target && (
            <button
              type="button"
              onClick={() => { if (step.target) onGoTo(step.target); dismiss(); }}
              style={{
                padding: '7px 12px', background: 'var(--green)', color: 'var(--ink)',
                border: 'none', borderRadius: '4px', fontWeight: 700,
                fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
              }}
            >
              Ga naar →
            </button>
          )}
          {!isLast ? (
            <button
              type="button"
              onClick={() => setIdx(i => i + 1)}
              style={{
                padding: '7px 12px', background: 'var(--ink)', color: '#fff',
                border: 'none', borderRadius: '4px', fontWeight: 700,
                fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
              }}
            >
              Volgende →
            </button>
          ) : (
            <button
              type="button"
              onClick={dismiss}
              style={{
                padding: '7px 14px', background: 'var(--ink)', color: '#fff',
                border: 'none', borderRadius: '4px', fontWeight: 700,
                fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
              }}
            >
              Klaar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
