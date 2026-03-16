'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import FlyerExport, { PREVIEW_PX, PRINT_DIMS } from '../../components/FlyerExport';

const NLMap = dynamic(() => import('../../components/NLMap'), { ssr: false, loading: () => (
  <div style={{ height: '280px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>Kaart laden...</div>
) });

// ─── Constants ───────────────────────────────────────────────────────────────

const SPECS = [
  "Kapper / Barbershop","Nagelstudio","Schoonheidsspecialist","Tattoo & Piercing",
  "Restaurant","Café / Bar","Koffietentje","Bakkerij","Slagerij","Traiteur / Catering",
  "Afhaal & Bezorging","Pizzeria","Aziatisch restaurant","IJssalon",
  "Sportschool / Fitness","Yoga & Pilates studio","Fysiotherapeut","Personal trainer",
  "Dansschool","Zwembad & Wellness","Meubelwinkel","Keukenwinkel",
  "Interieurwinkel / Woonwinkel","Verfwinkel / Behangwinkel","Doe-het-zelf & Bouwmarkt",
  "Bloemist","Cadeauwinkel","Boekenwinkel","Speelgoedwinkel","Kinderkleding",
  "Boetiek / Kledingwinkel","Schoenenwinkel","Juwelier","Opticiën","Drogist",
  "Huisdierenwinkel","Rijschool","Stucadoor / Afbouwbedrijf","Stomerij / Wasserette",
  "Fietsenwinkel","Overig (neem contact op)"
];

const MAANDEN = ["Januari","Februari","Maart","April","Mei","Juni",
  "Juli","Augustus","September","Oktober","November","December"];


// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAvailableMonths(): { label: string; value: string; short: string }[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + 1 + i, 1);
    return {
      label: `${MAANDEN[d.getMonth()]} ${d.getFullYear()}`,
      short: MAANDEN[d.getMonth()].slice(0, 3),
      value: d.toISOString().split('T')[0],
    };
  });
}

function estimeerDekkingsgebied(straalKm: number): {
  pc4Count: number;
  estAdressenMaand: number;
  referentieVorigjaar: number;
  suggestieFlyers: number;
} {
  const oppervlakte = Math.PI * straalKm * straalKm;
  const estWoningen = Math.round(oppervlakte * 580);
  const estAdressenMaand = Math.max(10, Math.round(estWoningen * 0.055 / 12));
  const pc4Count = Math.max(1, Math.round(oppervlakte / 11));
  const referentieVorigjaar = Math.round(estWoningen * 0.055);
  const suggestieFlyers = Math.max(250, Math.min(2000, Math.round(estAdressenMaand / 50) * 50));
  return { pc4Count, estAdressenMaand, referentieVorigjaar, suggestieFlyers };
}

function berekenPrijs(aantalFlyers: number, formaat: string, dubbelzijdig: boolean): number {
  const base = formaat === 'a6' ? 0.73 : formaat === 'a4' ? 0.91 : 0.83;
  const dubbelExtra = dubbelzijdig ? 0.06 : 0;
  return aantalFlyers * (base + dubbelExtra);
}

// Abonnementsmodel: prijs per PC4-postcode, alle overdrachten inbegrepen
const ABONNEMENT_TIERS = [
  { name: 'Buurt', pc4s: 1,  monthly: 69,  extraPc4: 29 },
  { name: 'Wijk',  pc4s: 3,  monthly: 149, extraPc4: 23 },
  { name: 'Stad',  pc4s: 10, monthly: 299, extraPc4: 18 },
];

function berekenAbonnement(pc4Count: number): {
  tier: string; includedPc4s: number; base: number;
  extraPc4s: number; extraKosten: number; total: number;
} {
  const n = Math.max(1, pc4Count);
  for (const t of ABONNEMENT_TIERS) {
    if (n <= t.pc4s) {
      return { tier: t.name, includedPc4s: t.pc4s, base: t.monthly, extraPc4s: 0, extraKosten: 0, total: t.monthly };
    }
  }
  const stad = ABONNEMENT_TIERS[2];
  const extra = n - stad.pc4s;
  const extraKosten = extra * stad.extraPc4;
  return { tier: 'Stad', includedPc4s: stad.pc4s, base: stad.monthly, extraPc4s: extra, extraKosten, total: stad.monthly + extraKosten };
}

function formatPrijs(x: number): string {
  return '€' + x.toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function roundUp50(n: number): number {
  return Math.ceil(n / 50) * 50;
}

interface Campaign {
  id: number;
  spec: string;
  datum: string;
  centrum: string;
  aantalFlyers: number;
  formaat: string;
  dubbelzijdig: boolean;
  maxBudget: number;
  status: 'actief' | 'gepauzeerd' | 'geannuleerd';
  stripeSessionId?: string;
  createdAt: string;
  proefAdres?: string;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface WizState {
  step: number;
  akkoord: { av: boolean; privacy: boolean };
  kluswaarde: number;
  spec: string;
  specQ: string;
  datum: string;
  centrum: string;
  straal: number;
  aantalFlyers: number;
  formaat: 'a6' | 'a5' | 'a4';
  dubbelzijdig: boolean;
  proefFlyer: boolean;
  proefAdres: string;
  email: string;
  pc4Lijst: string[];
  pc4Add: string;
  flyerIndex: number;
}

interface FlyerState {
  kleur: string;
  accent: string;
  afmeting: string;
  dubbelzijdig: boolean;
  bedrijfsnaam: string;
  slogan: string;
  telefoon: string;
  email: string;
  website: string;
  usp: string;
  tekst: string;
  logoData: string | null;
  websiteUrl: string;
  websiteScan: { primaryColor?: string; accentColor?: string; brandName?: string } | null;
  design: 'editorial' | 'geometric' | 'minimal' | 'bold' | 'retro' | 'warm' | 'neon' | 'corporate' | 'playful';
  heroImageUrl: string | null;
  heroOffsetX: number;
  heroOffsetY: number;
  heroScale: number;
  headline: string;
  cta: string;
  pdfUrl: string | null;
  adres: string;
  openingstijden: string;
  backTekst: string;
  qrPlaats: 'voor' | 'achter' | 'beide';
}

type Page = 'dashboard' | 'wizard' | 'flyer' | 'credits' | 'profiel' | 'conversies';

// ─── AdaptiveLogo — past breedte en hoogte aan op het aspect van het logo ─────

function AdaptiveLogo({ src, baseSize, style }: {
  src: string;
  baseSize: number;
  style?: React.CSSProperties;
}) {
  const [aspect, setAspect] = useState<number>(1);
  // Normalize visual area so square logos get proper weight (not tiny)
  const targetArea = baseSize * baseSize * 1.5;
  const rawW = Math.sqrt(targetArea * aspect);
  const w = Math.round(Math.min(rawW, baseSize * 4.5));
  const h = Math.round(w / aspect);
  const imgStyle: React.CSSProperties = {
    width: w,
    height: h,
    objectFit: 'contain' as const,
    flexShrink: 0,
    ...style,
  };
  return (
    <img
      src={src}
      alt=""
      style={imgStyle}
      onLoad={e => {
        const img = e.currentTarget;
        if (img.naturalWidth && img.naturalHeight) setAspect(img.naturalWidth / img.naturalHeight);
      }}
    />
  );
}

// ─── Flyer Preview — 3 premium designs ───────────────────────────────────────

function FlyerPreview({ flyer, formaat = 'a5', onHeroOffsetChange }: {
  flyer: FlyerState;
  formaat?: 'a6' | 'a5' | 'a4';
  onHeroOffsetChange?: (x: number, y: number) => void;
}) {
  const usps = flyer.usp ? flyer.usp.split('\n').filter(Boolean).slice(0, 3) : [];
  const naam = flyer.bedrijfsnaam || 'Jouw Bedrijfsnaam';
  const tekst = flyer.tekst || 'Wij heten je van harte welkom als nieuwe bewoner. Kom eens langs en ontdek wat wij voor jou kunnen betekenen in de buurt.';
  const initials = naam.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  const ox = flyer.heroOffsetX ?? 50;
  const oy = flyer.heroOffsetY ?? 50;
  const hs = flyer.heroScale ?? 100; // 50–200, default 100

  // Draggable hero image handler
  const handleHeroDrag = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!onHeroOffsetChange) return;
    e.preventDefault();
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    let curOx = ox, curOy = oy;
    const onMove = (mv: MouseEvent) => {
      const dx = ((mv.clientX - startX) / rect.width) * 100;
      const dy = ((mv.clientY - startY) / rect.height) * 100;
      curOx = Math.max(0, Math.min(100, ox - dx));
      curOy = Math.max(0, Math.min(100, oy - dy));
      onHeroOffsetChange(curOx, curOy);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // h = base height string (e.g. '100px'). heroScale zooms into the image without changing the box.
  const heroImgStyle = (h: string): React.CSSProperties => ({
    width: '100%', height: h, objectFit: 'cover', display: 'block',
    objectPosition: `${ox}% ${oy}%`,
    transform: `scale(${hs / 100})`,
    transformOrigin: `${ox}% ${oy}%`,
    cursor: onHeroOffsetChange ? 'grab' : 'default',
    userSelect: 'none',
  });

  const pxDims = PREVIEW_PX[formaat];
  const base: React.CSSProperties = {
    width: `${pxDims.w}px`, height: `${pxDims.h}px`, borderRadius: '8px', overflow: 'hidden',
    position: 'relative', flexShrink: 0, fontFamily: 'var(--font-sans)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
  };

  const ctaText = flyer.cta || '10% welkomstkorting';
  // Small drag hint — top-right corner chip, non-intrusive
  const dragOverlay = onHeroOffsetChange ? (
    <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.52)', borderRadius: '3px', padding: '2px 5px', pointerEvents: 'none', zIndex: 2 }}>
      <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-mono)' }}>↕ sleep</span>
    </div>
  ) : null;

  // ── Design 1: EDITORIAL (magazine split-layout) ──────────────────────────
  if (flyer.design === 'editorial') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    return (
      <div style={{ ...base, background: flyer.kleur }}>
        {/* Left color stripe — bold accent bar */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '10px', background: flyer.accent }} />
        {/* Top section */}
        <div style={{ padding: '18px 16px 0 22px' }}>
          {/* Category label */}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.18em', color: flyer.accent, textTransform: 'uppercase', marginBottom: '10px', opacity: 0.9 }}>
            Nieuwe bewoners · Welkomst
          </div>
          {/* Hero image */}
          {flyer.heroImageUrl ? (
            <>
              <div style={{ position: 'relative', marginBottom: '8px', borderRadius: '3px', overflow: 'hidden' }}>
                <img src={flyer.heroImageUrl!} alt="" style={{ ...heroImgStyle('85px'), borderRadius: '3px' }} onMouseDown={handleHeroDrag} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.35) 100%)', pointerEvents: 'none' }} />
                {dragOverlay}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: '#fff', lineHeight: 1.05, marginBottom: '6px', letterSpacing: '-0.02em' }}>
                {headline}
              </div>
            </>
          ) : (
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '30px', fontWeight: 400, color: '#fff', lineHeight: 1.0, marginBottom: '10px', letterSpacing: '-0.03em' }}>
              {headline.split(' ').slice(0, 2).join(' ')}<br />
              <em style={{ color: flyer.accent, fontStyle: 'italic' }}>{headline.split(' ').slice(2).join(' ') || 'de buurt.'}</em>
            </div>
          )}
          {/* Divider */}
          <div style={{ width: '28px', height: '2px', background: flyer.accent, marginBottom: '8px' }} />
          {/* Body */}
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: '10px' }}>{tekst}</div>
          {/* USPs */}
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
                  <span style={{ color: flyer.accent, fontSize: '9px', lineHeight: 1.4, flexShrink: 0, fontWeight: 700 }}>›</span>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '8px', lineHeight: 1.4 }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          {/* CTA */}
          <div style={{ display: 'inline-block', background: flyer.accent, borderRadius: '2px', padding: '5px 10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: flyer.kleur, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{ctaText}</span>
          </div>
        </div>
        {/* Footer bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: `1px solid rgba(255,255,255,0.08)`, padding: '9px 16px 9px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '9px', color: '#fff', letterSpacing: '0.01em' }}>{naam}</div>
            {flyer.website && <div style={{ fontSize: '7px', color: flyer.accent, fontFamily: 'var(--font-mono)', marginTop: '1px' }}>{flyer.website}</div>}
          </div>
          {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.accent} bg="transparent" />}
          {flyer.logoData
            ? <AdaptiveLogo src={flyer.logoData} baseSize={26} style={{ borderRadius: '3px' }} />
            : <div style={{ width: '26px', height: '26px', background: flyer.accent, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: flyer.kleur, fontWeight: 900, fontSize: '9px' }}>{initials}</div>
          }
        </div>
      </div>
    );
  }

  // ── Design 2: GEOMETRIC (bold shapes) ────────────────────────────────────
  if (flyer.design === 'geometric') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    return (
      <div style={{ ...base, background: '#f5f4f0' }}>
        {/* Background shapes */}
        <div style={{ position: 'absolute', bottom: '40px', left: '-50px', width: '180px', height: '180px', borderRadius: '50%', background: flyer.kleur, opacity: 0.06 }} />
        <div style={{ position: 'absolute', bottom: '20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: flyer.accent, opacity: 0.10 }} />
        {/* Hero image — full width strip at top */}
        {flyer.heroImageUrl ? (
          <div style={{ position: 'relative', height: '100px', overflow: 'hidden' }}>
            <img src={flyer.heroImageUrl} alt="" style={{ ...heroImgStyle('100px') }} onMouseDown={handleHeroDrag} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 30%, ${flyer.kleur}cc 100%)`, pointerEvents: 'none' }} />
            {dragOverlay}
            {/* Headline over image */}
            <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.15em', marginBottom: '3px' }}>WELKOM IN DE BUURT</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#fff', lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.02em' }}>{headline}</div>
            </div>
          </div>
        ) : (
          /* Top colored block when no image */
          <div style={{ background: flyer.kleur, padding: '16px 16px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: '-25px', right: '-15px', width: '80px', height: '80px', borderRadius: '50%', border: `10px solid ${flyer.accent}`, opacity: 0.35 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.14em', marginBottom: '6px' }}>WELKOM IN DE BUURT</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#fff', lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.02em' }}>{headline}</div>
            {flyer.slogan && <div style={{ fontSize: '8px', color: flyer.accent, marginTop: '4px', fontStyle: 'italic' }}>{flyer.slogan}</div>}
          </div>
        )}
        {/* Business name strip */}
        {flyer.heroImageUrl && (
          <div style={{ background: flyer.kleur, padding: '8px 14px 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={20} />
              : <div style={{ width: '20px', height: '20px', background: flyer.accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 900, color: flyer.kleur, flexShrink: 0 }}>{initials}</div>
            }
            <div style={{ fontWeight: 700, fontSize: '9px', color: '#fff' }}>{naam}</div>
          </div>
        )}
        {/* Content */}
        <div style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '8px', color: '#444', lineHeight: 1.65, marginBottom: '10px' }}>{tekst}</div>
          {/* USP pills */}
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${flyer.kleur}12`, borderRadius: '20px', padding: '5px 10px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: flyer.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: flyer.kleur, fontSize: '7px', fontWeight: 900 }}>✓</span>
                  </div>
                  <span style={{ fontSize: '7.5px', color: flyer.kleur, fontWeight: 600 }}>{u}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Bottom CTA strip */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: flyer.accent, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '8px', fontWeight: 800, color: flyer.kleur, fontFamily: 'var(--font-mono)' }}>{ctaText}</span>
          {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.kleur} bg="transparent" />}
          <span style={{ fontSize: '7px', color: `${flyer.kleur}bb`, fontFamily: 'var(--font-mono)' }}>{flyer.website || ''}</span>
        </div>
      </div>
    );
  }

  // ── Design 3: MINIMAL LUXURY ──────────────────────────────────────────────
  if (flyer.design === 'minimal') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    return (
    <div style={{ ...base, background: '#faf9f7' }}>
      {/* Hero image — full width, tall strip */}
      {flyer.heroImageUrl ? (
        <div style={{ position: 'relative', height: '110px', overflow: 'hidden' }}>
          <img src={flyer.heroImageUrl} alt="" style={{ ...heroImgStyle('110px') }} onMouseDown={handleHeroDrag} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(250,249,247,0.95) 100%)', pointerEvents: 'none' }} />
          {dragOverlay}
        </div>
      ) : (
        /* No image: full-bleed accent top bar + thin line */
        <>
          <div style={{ height: '5px', background: flyer.accent }} />
          <div style={{ height: '1px', background: flyer.kleur, margin: '0 20px' }} />
        </>
      )}
      <div style={{ padding: flyer.heroImageUrl ? '4px 20px 16px' : '14px 20px 16px' }}>
        {/* Logo row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', color: flyer.kleur, fontWeight: 400, letterSpacing: '0.03em' }}>{naam}</div>
            {flyer.slogan && <div style={{ fontSize: '7px', color: '#999', marginTop: '2px', letterSpacing: '0.10em', textTransform: 'uppercase' }}>{flyer.slogan}</div>}
          </div>
          {flyer.logoData
            ? <AdaptiveLogo src={flyer.logoData} baseSize={28} />
            : <div style={{ width: '28px', height: '28px', border: `1px solid ${flyer.kleur}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: flyer.kleur }}>{initials}</div>
          }
        </div>
        {!flyer.heroImageUrl && <div style={{ height: '1px', background: '#e8e6e0', marginBottom: '12px' }} />}
        {/* Headline */}
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: flyer.heroImageUrl ? '19px' : '22px', fontWeight: 400, color: flyer.kleur, lineHeight: 1.1, marginBottom: '5px', letterSpacing: '-0.02em' }}>
          {headline}
        </div>
        <div style={{ width: '20px', height: '2px', background: flyer.accent, marginBottom: '10px' }} />
        {/* Body */}
        <div style={{ fontSize: '8px', color: '#666', lineHeight: 1.65, marginBottom: '10px' }}>{tekst}</div>
        {/* USPs — minimal list */}
        {usps.length > 0 && (
          <div style={{ borderTop: '1px solid #ede9e3', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
            {usps.map((u, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: flyer.accent, flexShrink: 0 }} />
                <span style={{ fontSize: '7.5px', color: '#444', lineHeight: 1.4 }}>{u}</span>
              </div>
            ))}
          </div>
        )}
        {/* CTA — elegant underlined */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', borderBottom: `1.5px solid ${flyer.accent}`, paddingBottom: '1px' }}>
          <span style={{ fontSize: '8px', fontWeight: 700, color: flyer.kleur, letterSpacing: '0.04em' }}>{ctaText}</span>
          <span style={{ fontSize: '8px', color: flyer.accent, fontWeight: 700 }}>→</span>
        </div>
      </div>
      {/* Bottom contact */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '7px 20px', borderTop: '1px solid #e8e6e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {flyer.website && <span style={{ fontSize: '7px', color: '#999', fontFamily: 'var(--font-mono)' }}>{flyer.website}</span>}
        {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.kleur} bg="transparent" />}
        {flyer.telefoon && <span style={{ fontSize: '7px', color: '#999', fontFamily: 'var(--font-mono)' }}>{flyer.telefoon}</span>}
      </div>
    </div>
  );
  }

  // ── Design 4: BOLD (high-contrast, full-bleed photo) ─────────────────────
  if (flyer.design === 'bold') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    return (
      <div style={{ ...base, background: flyer.kleur }}>
        {/* Full-bleed hero photo or big type */}
        {flyer.heroImageUrl ? (
          <div style={{ position: 'relative', height: '165px', overflow: 'hidden' }}>
            <img src={flyer.heroImageUrl} alt="" style={{ ...heroImgStyle('165px') }} onMouseDown={handleHeroDrag} />
            {/* Dark gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)', pointerEvents: 'none' }} />
            {dragOverlay}
            {/* Welkomst badge — top left */}
            <div style={{ position: 'absolute', top: '10px', left: '12px', background: flyer.accent, borderRadius: '2px', padding: '3px 7px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', fontWeight: 800, color: flyer.kleur, letterSpacing: '0.1em' }}>NIEUW IN DE BUURT</span>
            </div>
            {/* Headline over photo */}
            <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{headline}</div>
            </div>
          </div>
        ) : (
          <div style={{ height: '120px', background: flyer.accent, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.18em', color: flyer.kleur, opacity: 0.75, marginBottom: '5px', textTransform: 'uppercase' }}>Nieuw in de buurt</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: flyer.kleur, lineHeight: 1.0, letterSpacing: '-0.02em' }}>{headline}</div>
          </div>
        )}
        {/* Content */}
        <div style={{ padding: '12px 16px' }}>
          {/* Accent bar */}
          <div style={{ width: '36px', height: '3px', background: flyer.accent, marginBottom: '8px', borderRadius: '2px' }} />
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, marginBottom: '8px' }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '13px', height: '13px', background: flyer.accent, borderRadius: '2px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '7px', color: flyer.kleur, fontWeight: 900 }}>✓</span>
                  </div>
                  <span style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.85)' }}>{u}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* CTA + Footer */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          {/* CTA bar */}
          <div style={{ background: flyer.accent, padding: '7px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: flyer.kleur, fontFamily: 'var(--font-mono)' }}>{ctaText}</span>
            {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.kleur} bg="transparent" />}
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={20} style={{ borderRadius: '2px' }} />
              : <span style={{ fontSize: '7px', fontWeight: 700, color: flyer.kleur, fontFamily: 'var(--font-mono)' }}>{flyer.website || ''}</span>
            }
          </div>
          {/* Business name strip */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '5px 16px' }}>
            <div style={{ fontWeight: 700, fontSize: '8px', color: 'rgba(255,255,255,0.7)' }}>{naam}</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Design 5: RETRO (vintage poster feel) ────────────────────────────────
  if (flyer.design === 'retro') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    const bg = '#F5EDD8'; // warm parchment
    return (
      <div style={{ ...base, background: bg }}>
        {/* Top border strip */}
        <div style={{ height: '6px', background: flyer.kleur }} />
        <div style={{ height: '2px', background: flyer.accent }} />
        <div style={{ padding: '10px 16px' }}>
          {/* Vintage badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <div style={{ border: `2px solid ${flyer.kleur}`, borderRadius: '50px', padding: '3px 14px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', letterSpacing: '0.22em', color: flyer.kleur, textTransform: 'uppercase' }}>Welkom · Nieuw in de buurt</span>
            </div>
          </div>
          {/* Hero image */}
          {flyer.heroImageUrl ? (
            <div style={{ position: 'relative', marginBottom: '8px', border: `2px solid ${flyer.kleur}`, overflow: 'hidden' }}>
              <img src={flyer.heroImageUrl} alt="" style={{ ...heroImgStyle('65px') }} onMouseDown={handleHeroDrag} />
              {dragOverlay}
            </div>
          ) : null}
          {/* Headline — big serif centered */}
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: flyer.heroImageUrl ? '20px' : '26px', fontWeight: 700, color: flyer.kleur, lineHeight: 1.0, textAlign: 'center', letterSpacing: '-0.01em', marginBottom: '4px' }}>{headline}</div>
          {/* Decorative ornamental rule */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '7px 0' }}>
            <div style={{ flex: 1, height: '1px', background: flyer.kleur, opacity: 0.25 }} />
            <div style={{ width: '5px', height: '5px', background: flyer.accent, transform: 'rotate(45deg)', flexShrink: 0 }} />
            <div style={{ flex: 1, height: '1px', background: flyer.kleur, opacity: 0.25 }} />
          </div>
          {/* Body */}
          <div style={{ fontSize: '7.5px', color: '#4a3a28', lineHeight: 1.65, marginBottom: '8px', textAlign: 'center' }}>{tekst}</div>
          {/* USP chips */}
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
              {usps.map((u, i) => (
                <span key={i} style={{ fontSize: '7px', background: flyer.kleur, color: bg, padding: '3px 8px', borderRadius: '2px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{u}</span>
              ))}
            </div>
          )}
          {/* CTA — vintage badge style */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: flyer.accent, borderRadius: '2px', padding: '4px 12px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7.5px', fontWeight: 800, color: flyer.kleur, letterSpacing: '0.06em' }}>{ctaText}</span>
            </div>
          </div>
        </div>
        {/* Bottom border */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <div style={{ padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `2px solid ${flyer.kleur}` }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '9px', fontWeight: 700, color: flyer.kleur }}>{naam}</div>
            {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.kleur} bg="transparent" />}
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={20} />
              : <div style={{ fontSize: '7px', fontFamily: 'var(--font-mono)', color: flyer.kleur, opacity: 0.65 }}>{flyer.website || ''}</div>
            }
          </div>
          <div style={{ height: '2px', background: flyer.accent }} />
          <div style={{ height: '4px', background: flyer.kleur }} />
        </div>
      </div>
    );
  }

  // ── Design 6: WARM (cozy, neighbourhood feel) ────────────────────────────
  if (flyer.design === 'warm') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    const bg = '#FFF8F0';
    return (
      <div style={{ ...base, background: bg }}>
        {/* Rounded top block */}
        <div style={{ background: flyer.kleur, borderRadius: '0 0 36px 0', padding: '15px 16px 18px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '70px', height: '70px', borderRadius: '50%', background: flyer.accent, opacity: 0.22 }} />
          <div style={{ position: 'absolute', bottom: '-25px', left: '10px', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          {flyer.heroImageUrl && (
            <div style={{ position: 'relative', marginBottom: '8px', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={flyer.heroImageUrl} alt="" style={{ ...heroImgStyle('58px'), borderRadius: '8px' }} onMouseDown={handleHeroDrag} />
              {dragOverlay}
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.16em', marginBottom: '5px', textTransform: 'uppercase' }}>Hoi nieuwe buur!</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#fff', lineHeight: 1.05, letterSpacing: '-0.01em', fontWeight: 400 }}>{headline}</div>
        </div>
        {/* Content */}
        <div style={{ padding: '12px 16px' }}>
          {/* Business name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={18} style={{ borderRadius: '50%', flexShrink: 0 }} />
              : <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: flyer.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 900, color: flyer.kleur }}>{initials}</div>
            }
            <div style={{ fontSize: '10px', fontWeight: 700, color: flyer.kleur }}>{naam}</div>
          </div>
          <div style={{ fontSize: '8px', color: '#5a4a3a', lineHeight: 1.65, marginBottom: '8px' }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'center', background: `${flyer.accent}16`, borderRadius: '6px', padding: '4px 8px' }}>
                  <span style={{ fontSize: '8px', color: flyer.accent, flexShrink: 0, lineHeight: 1 }}>♥</span>
                  <span style={{ fontSize: '7.5px', color: '#5a4a3a', lineHeight: 1.4 }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          {/* CTA button */}
          <div style={{ background: flyer.accent, borderRadius: '20px', padding: '6px 14px', display: 'inline-block' }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: flyer.kleur, fontFamily: 'var(--font-mono)' }}>{ctaText}</span>
          </div>
        </div>
        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 16px', borderTop: `1px solid ${flyer.accent}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {flyer.website && <span style={{ fontSize: '7px', color: '#999', fontFamily: 'var(--font-mono)' }}>{flyer.website}</span>}
          {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.kleur} bg="transparent" />}
          {flyer.telefoon && <span style={{ fontSize: '7px', color: '#999', fontFamily: 'var(--font-mono)' }}>{flyer.telefoon}</span>}
        </div>
      </div>
    );
  }

  // ── Design 7: NEON (dark futuristic, glowing accent) ─────────────────────
  if (flyer.design === 'neon') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    const bg = '#0A0A12';
    return (
      <div style={{ ...base, background: bg }}>
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: flyer.accent, opacity: 0.07, filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '40px', right: '-60px', width: '160px', height: '160px', borderRadius: '50%', background: flyer.kleur, opacity: 0.06, filter: 'blur(40px)', pointerEvents: 'none' }} />
        {/* Top glowing border */}
        <div style={{ height: '2px', background: `linear-gradient(90deg, transparent 0%, ${flyer.accent} 40%, ${flyer.accent} 60%, transparent 100%)`, boxShadow: `0 0 10px ${flyer.accent}` }} />
        <div style={{ padding: '14px 16px' }}>
          {/* Label — no emoji */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: flyer.accent, boxShadow: `0 0 6px ${flyer.accent}`, flexShrink: 0 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.2em', color: flyer.accent, textTransform: 'uppercase', opacity: 0.9 }}>Nieuwe bewoners</div>
          </div>
          {/* Hero image */}
          {flyer.heroImageUrl && (
            <div style={{ position: 'relative', marginBottom: '10px', borderRadius: '4px', overflow: 'hidden', border: `1px solid ${flyer.accent}35` }}>
              <img src={flyer.heroImageUrl} alt="" style={{ ...heroImgStyle('72px') }} onMouseDown={handleHeroDrag} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 35%, ${bg}70)`, pointerEvents: 'none' }} />
              {dragOverlay}
            </div>
          )}
          {/* Headline */}
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#fff', lineHeight: 1.05, marginBottom: '6px', letterSpacing: '-0.02em', textShadow: `0 0 20px ${flyer.accent}55` }}>{headline}</div>
          {/* Glowing divider */}
          <div style={{ height: '1px', background: `linear-gradient(90deg, ${flyer.accent} 0%, transparent 100%)`, marginBottom: '8px', boxShadow: `0 0 5px ${flyer.accent}` }} />
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, marginBottom: '8px' }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: flyer.accent, fontSize: '9px', fontWeight: 900, textShadow: `0 0 8px ${flyer.accent}`, lineHeight: 1 }}>›</span>
                  <span style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.72)' }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          {/* Neon CTA */}
          <div style={{ display: 'inline-block', border: `1px solid ${flyer.accent}`, borderRadius: '3px', padding: '4px 10px', boxShadow: `0 0 8px ${flyer.accent}40, inset 0 0 8px ${flyer.accent}10` }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', fontWeight: 700, color: flyer.accent, textShadow: `0 0 8px ${flyer.accent}` }}>{ctaText}</span>
          </div>
        </div>
        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: `1px solid ${flyer.accent}25`, padding: '7px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${bg}f0` }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '8px', color: flyer.accent, fontFamily: 'var(--font-mono)', textShadow: `0 0 6px ${flyer.accent}70` }}>{naam}</div>
            {flyer.website && <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-mono)', marginTop: '1px' }}>{flyer.website}</div>}
          </div>
          {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.accent} bg="transparent" />}
          {flyer.logoData
            ? <AdaptiveLogo src={flyer.logoData} baseSize={22} style={{ filter: 'brightness(1.3)' }} />
            : <div style={{ width: '22px', height: '22px', border: `1px solid ${flyer.accent}`, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: flyer.accent, boxShadow: `0 0 5px ${flyer.accent}35` }}>{initials}</div>
          }
        </div>
      </div>
    );
  }

  // ── Design 8: CORPORATE (professional, clean business) ────────────────────
  if (flyer.design === 'corporate') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    return (
      <div style={{ ...base, background: '#fff' }}>
        {/* Header */}
        <div style={{ background: flyer.kleur, padding: '13px 16px 11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', color: flyer.accent, letterSpacing: '0.20em', textTransform: 'uppercase', marginBottom: '5px', opacity: 0.9 }}>Welkomstaanbieding</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', color: '#fff', fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{naam}</div>
            </div>
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={28} style={{ borderRadius: '3px', background: 'rgba(255,255,255,0.1)', padding: '3px' }} />
              : <div style={{ width: '28px', height: '28px', background: flyer.accent, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900, color: flyer.kleur }}>{initials}</div>
            }
          </div>
        </div>
        {/* Accent stripe */}
        <div style={{ height: '3px', background: flyer.accent }} />
        {/* Hero or headline */}
        {flyer.heroImageUrl ? (
          <div style={{ position: 'relative', height: '82px', overflow: 'hidden' }}>
            <img src={flyer.heroImageUrl} alt="" style={{ ...heroImgStyle('82px') }} onMouseDown={handleHeroDrag} />
            {dragOverlay}
          </div>
        ) : (
          <div style={{ padding: '12px 16px 0' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: flyer.kleur, lineHeight: 1.1 }}>{headline}</div>
          </div>
        )}
        <div style={{ padding: '10px 16px' }}>
          {flyer.heroImageUrl && <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: flyer.kleur, lineHeight: 1.2, marginBottom: '6px' }}>{headline}</div>}
          <div style={{ width: '24px', height: '2px', background: flyer.accent, marginBottom: '7px' }} />
          <div style={{ fontSize: '7.5px', color: '#444', lineHeight: 1.65, marginBottom: '8px' }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', borderLeft: `2px solid ${flyer.accent}`, paddingLeft: '7px' }}>
                  <span style={{ fontSize: '7.5px', color: '#333', fontWeight: 500 }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          {/* CTA — corporate style */}
          <div style={{ background: flyer.kleur, borderRadius: '2px', padding: '5px 10px', display: 'inline-block' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7.5px', fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>{ctaText}</span>
          </div>
        </div>
        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#f4f4f4', borderTop: `2px solid ${flyer.accent}`, padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {flyer.website && <span style={{ fontSize: '7px', color: '#777', fontFamily: 'var(--font-mono)' }}>{flyer.website}</span>}
          {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.kleur} bg="transparent" />}
          {flyer.telefoon && <span style={{ fontSize: '7px', color: '#777', fontFamily: 'var(--font-mono)' }}>{flyer.telefoon}</span>}
        </div>
      </div>
    );
  }

  // ── Design 9: PLAYFUL (fun, rounded, vibrant) ─────────────────────────────
  if (flyer.design === 'playful') {
    const headline = flyer.headline || 'Hoi nieuwe buurman!';
    const bg = '#FFFBF0';
    return (
      <div style={{ ...base, background: bg }}>
        {/* Gradient top banner */}
        <div style={{ background: `linear-gradient(125deg, ${flyer.kleur} 0%, ${flyer.accent} 100%)`, padding: '13px 16px 16px', borderRadius: '0 0 28px 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ position: 'absolute', bottom: '-15px', right: '20px', width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.75)', marginBottom: '5px', textTransform: 'uppercase' }}>Nieuw in de buurt?</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#fff', lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.01em' }}>{headline}</div>
        </div>
        {/* Content */}
        <div style={{ padding: '12px 16px' }}>
          {/* Business name badge */}
          <div style={{ display: 'inline-block', background: flyer.kleur, borderRadius: '20px', padding: '4px 11px', marginBottom: '8px' }}>
            <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>{naam}</span>
          </div>
          {flyer.heroImageUrl && (
            <div style={{ position: 'relative', marginBottom: '8px', borderRadius: '10px', overflow: 'hidden' }}>
              <img src={flyer.heroImageUrl} alt="" style={{ ...heroImgStyle('55px'), borderRadius: '10px' }} onMouseDown={handleHeroDrag} />
              {dragOverlay}
            </div>
          )}
          <div style={{ fontSize: '8px', color: '#555', lineHeight: 1.65, marginBottom: '8px' }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'center', background: `${flyer.accent}18`, borderRadius: '8px', padding: '4px 9px' }}>
                  <span style={{ fontSize: '9px', color: flyer.accent, lineHeight: 1 }}>★</span>
                  <span style={{ fontSize: '7.5px', color: '#444', fontWeight: 500 }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          {/* CTA — rounded pill */}
          <div style={{ background: `linear-gradient(90deg, ${flyer.kleur}, ${flyer.accent})`, borderRadius: '20px', padding: '6px 14px', display: 'inline-block' }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>{ctaText}</span>
          </div>
        </div>
        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 16px', background: `${flyer.kleur}08`, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {flyer.website && <span style={{ fontSize: '7px', color: '#999', fontFamily: 'var(--font-mono)' }}>{flyer.website}</span>}
          {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.kleur} bg="transparent" />}
          {flyer.logoData
            ? <AdaptiveLogo src={flyer.logoData} baseSize={20} style={{ borderRadius: '50%' }} />
            : <div style={{ width: '20px', height: '20px', background: flyer.kleur, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 900, color: '#fff' }}>{initials}</div>
          }
        </div>
      </div>
    );
  }

  // Fallback — should not reach here
  return null;
}

// ─── QR Code (decorative placeholder) ────────────────────────────────────────

function QrCode({ size = 40, fg = '#000', bg = 'transparent' }: { size?: number; fg?: string; bg?: string }) {
  const p = [
    [1,1,1,0,1,0,1,1,1],
    [1,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,0,1,0,1],
    [0,0,0,0,1,0,0,0,0],
    [1,0,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,0,1,1,1],
    [0,0,0,0,0,0,0,0,0],
    [1,0,1,0,1,0,1,0,1],
  ];
  const c = Math.floor(size / 9);
  return (
    <div style={{ background: bg, padding: `${c}px`, display: 'inline-flex', flexDirection: 'column', flexShrink: 0 }}>
      {p.map((row, r) => (
        <div key={r} style={{ display: 'flex' }}>
          {row.map((v, i) => (
            <div key={i} style={{ width: c, height: c, background: v ? fg : bg }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Flyer Back Preview ───────────────────────────────────────────────────────

function FlyerBackPreview({ flyer, formaat = 'a5' }: { flyer: FlyerState; formaat?: 'a6' | 'a5' | 'a4' }) {
  const naam = flyer.bedrijfsnaam || 'Jouw Bedrijfsnaam';
  const initials = naam.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  const adres = flyer.adres || '';
  const urenLines = flyer.openingstijden ? flyer.openingstijden.split('\n').filter(Boolean).slice(0, 4) : [];
  const backTekst = flyer.backTekst || 'Vragen? Wij helpen je graag verder.';

  const pxDims = PREVIEW_PX[formaat];
  const base: React.CSSProperties = {
    width: `${pxDims.w}px`, height: `${pxDims.h}px`, borderRadius: '8px', overflow: 'hidden',
    position: 'relative', flexShrink: 0, fontFamily: 'var(--font-sans)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
  };

  const contactRows = [
    flyer.telefoon && { icon: '☎', v: flyer.telefoon },
    flyer.email && { icon: '✉', v: flyer.email },
    flyer.website && { icon: '⊕', v: flyer.website },
    adres && { icon: '⌖', v: adres },
  ].filter(Boolean) as { icon: string; v: string }[];

  // ── EDITORIAL BACK ────────────────────────────────────────────────────────
  if (flyer.design === 'editorial') {
    return (
      <div style={{ ...base, background: flyer.kleur }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: flyer.accent }} />
        <div style={{ padding: '20px 18px 14px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: '#fff', fontWeight: 700 }}>{naam}</div>
              {flyer.slogan && <div style={{ fontSize: '8px', color: flyer.accent, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{flyer.slogan}</div>}
            </div>
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={28} style={{ borderRadius: '4px' }} />
              : <div style={{ width: '28px', height: '28px', background: flyer.accent, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: flyer.kleur, fontWeight: 800, fontSize: '10px' }}>{initials}</div>
            }
          </div>
          <div style={{ width: '32px', height: '2px', background: flyer.accent, marginBottom: '10px' }} />
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '11px', fontStyle: 'italic', color: 'rgba(255,255,255,0.7)', marginBottom: '14px', lineHeight: 1.5 }}>{backTekst}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
            {contactRows.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: flyer.accent, fontSize: '9px', flexShrink: 0, width: '12px', textAlign: 'center' }}>{c.icon}</span>
                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.82)', fontFamily: 'var(--font-mono)', lineHeight: 1.4, wordBreak: 'break-all' }}>{c.v}</span>
              </div>
            ))}
          </div>
          {urenLines.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.12em', marginBottom: '5px' }}>OPENINGSTIJDEN</div>
              {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>{u}</div>)}
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '9px 18px 9px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>Scan voor onze website</div>
          {(flyer.qrPlaats === 'achter' || flyer.qrPlaats === 'beide') && <QrCode size={36} fg={flyer.accent} bg="transparent" />}
        </div>
      </div>
    );
  }

  // ── GEOMETRIC BACK ────────────────────────────────────────────────────────
  if (flyer.design === 'geometric') {
    return (
      <div style={{ ...base, background: '#f5f4f0' }}>
        <div style={{ background: flyer.kleur, padding: '16px 18px 18px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: '-30px', right: '-20px', width: '90px', height: '90px', borderRadius: '50%', border: `12px solid ${flyer.accent}`, opacity: 0.3 }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.12em', marginBottom: '6px' }}>CONTACTGEGEVENS</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: '#fff', fontWeight: 400 }}>{naam}</div>
        </div>
        <div style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
            {contactRows.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${flyer.kleur}0f`, borderRadius: '20px', padding: '5px 10px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: flyer.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: flyer.kleur, fontSize: '7px' }}>{c.icon}</span>
                </div>
                <span style={{ fontSize: '7.5px', color: flyer.kleur, fontWeight: 500, wordBreak: 'break-all', lineHeight: 1.3 }}>{c.v}</span>
              </div>
            ))}
          </div>
          {urenLines.length > 0 && (
            <div style={{ background: `${flyer.kleur}08`, borderRadius: 'var(--radius)', padding: '8px 10px', marginBottom: '10px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.1em', marginBottom: '4px' }}>OPENINGSTIJDEN</div>
              {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7.5px', color: '#555', lineHeight: 1.55 }}>{u}</div>)}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '7.5px', color: '#777', lineHeight: 1.6, maxWidth: '130px' }}>{backTekst}</div>
            {(flyer.qrPlaats === 'achter' || flyer.qrPlaats === 'beide') && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
              <QrCode size={40} fg={flyer.kleur} bg="#f5f4f0" />
              <div style={{ fontSize: '6px', color: '#aaa', fontFamily: 'var(--font-mono)' }}>Scan mij</div>
            </div>}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: flyer.accent, padding: '6px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '8px', fontWeight: 700, color: flyer.kleur }}>{flyer.website || 'www.jouwwebsite.nl'}</span>
          {flyer.logoData
            ? <AdaptiveLogo src={flyer.logoData} baseSize={18} />
            : <div style={{ fontSize: '9px', fontWeight: 800, color: flyer.kleur }}>{initials}</div>
          }
        </div>
      </div>
    );
  }

  // ── MINIMAL BACK ──────────────────────────────────────────────────────────
  if (flyer.design === 'minimal') {
    return (
      <div style={{ ...base, background: '#faf9f7' }}>
        <div style={{ height: '8px', background: flyer.accent }} />
        <div style={{ height: '1px', background: flyer.kleur, margin: '0 20px' }} />
        <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 9px)', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: flyer.kleur }}>{naam}</div>
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={28} />
              : <div style={{ width: '28px', height: '28px', border: `1.5px solid ${flyer.kleur}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: flyer.kleur }}>{initials}</div>
            }
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', color: '#888', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.5 }}>{backTekst}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {contactRows.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'baseline', borderBottom: '1px solid #f0ede6', paddingBottom: '6px' }}>
                <span style={{ fontSize: '8px', color: '#bbb', fontFamily: 'var(--font-mono)', width: '12px', flexShrink: 0 }}>{c.icon}</span>
                <span style={{ fontSize: '8px', color: '#555', fontFamily: 'var(--font-mono)', lineHeight: 1.4, wordBreak: 'break-all' }}>{c.v}</span>
              </div>
            ))}
            {urenLines.length > 0 && (
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontSize: '7px', color: '#ccc', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '4px' }}>OPENINGSTIJDEN</div>
                {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7.5px', color: '#777', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>{u}</div>)}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: '10px' }}>
            {(flyer.qrPlaats === 'achter' || flyer.qrPlaats === 'beide') && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
              <QrCode size={36} fg={flyer.kleur} bg="#faf9f7" />
              <div style={{ fontSize: '6px', color: '#bbb', fontFamily: 'var(--font-mono)' }}>website</div>
            </div>}
          </div>
        </div>
      </div>
    );
  }

  // ── BOLD BACK ─────────────────────────────────────────────────────────────
  if (flyer.design === 'bold') {
    return (
      <div style={{ ...base, background: flyer.kleur }}>
        <div style={{ background: flyer.accent, padding: '12px 16px 10px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.18em', color: flyer.kleur, opacity: 0.7, textTransform: 'uppercase', marginBottom: '3px' }}>Contact & Info</div>
          <div style={{ fontWeight: 800, fontSize: '11px', color: flyer.kleur }}>{naam}</div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ width: '40px', height: '3px', background: flyer.accent, marginBottom: '12px', borderRadius: '2px' }} />
          {flyer.telefoon && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', marginBottom: '3px' }}>BEL ONS</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: flyer.accent, letterSpacing: '0.02em', lineHeight: 1 }}>{flyer.telefoon}</div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
            {contactRows.filter(c => c.v !== flyer.telefoon).map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '14px', height: '14px', background: flyer.accent, borderRadius: '2px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '7px', color: flyer.kleur }}>{c.icon}</span>
                </div>
                <span style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.8)', wordBreak: 'break-all', lineHeight: 1.4 }}>{c.v}</span>
              </div>
            ))}
          </div>
          {urenLines.length > 0 && (
            <div style={{ background: `${flyer.accent}18`, borderRadius: '4px', padding: '8px 10px', marginBottom: '10px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, marginBottom: '4px', letterSpacing: '0.1em' }}>OPENINGSTIJDEN</div>
              {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>{u}</div>)}
            </div>
          )}
          <div style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{backTekst}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: flyer.accent, padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '7px', color: flyer.kleur, fontFamily: 'var(--font-mono)' }}>Scan voor meer info</div>
          {(flyer.qrPlaats === 'achter' || flyer.qrPlaats === 'beide') && <QrCode size={32} fg={flyer.kleur} bg={flyer.accent} />}
        </div>
      </div>
    );
  }

  // ── RETRO BACK ────────────────────────────────────────────────────────────
  if (flyer.design === 'retro') {
    const bg = '#F5EDD8';
    return (
      <div style={{ ...base, background: bg }}>
        <div style={{ height: '5px', background: flyer.kleur }} />
        <div style={{ height: '2px', background: flyer.accent }} />
        <div style={{ padding: '10px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <div style={{ border: `2px solid ${flyer.kleur}`, borderRadius: '50px', padding: '3px 14px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.2em', color: flyer.kleur, textTransform: 'uppercase' }}>{naam}</span>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700, color: flyer.kleur, textAlign: 'center', marginBottom: '4px' }}>Kom langs!</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '6px 0' }}>
            <div style={{ flex: 1, height: '1px', background: flyer.kleur, opacity: 0.3 }} />
            <div style={{ width: '6px', height: '6px', background: flyer.accent, transform: 'rotate(45deg)' }} />
            <div style={{ flex: 1, height: '1px', background: flyer.kleur, opacity: 0.3 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '8px' }}>
            {contactRows.map((c, i) => (
              <div key={i} style={{ background: `${flyer.kleur}08`, borderRadius: '3px', padding: '5px 7px' }}>
                <div style={{ fontSize: '7px', color: flyer.accent, fontFamily: 'var(--font-mono)', marginBottom: '1px' }}>{c.icon}</div>
                <div style={{ fontSize: '7px', color: '#4a3a28', lineHeight: 1.4, wordBreak: 'break-all' }}>{c.v}</div>
              </div>
            ))}
          </div>
          {urenLines.length > 0 && (
            <div style={{ border: `1px dashed ${flyer.kleur}50`, borderRadius: '3px', padding: '6px 8px', marginBottom: '8px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.kleur, marginBottom: '3px', letterSpacing: '0.12em' }}>OPENINGSTIJDEN</div>
              {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7.5px', color: '#4a3a28', lineHeight: 1.55 }}>{u}</div>)}
            </div>
          )}
          <div style={{ fontSize: '7.5px', color: '#4a3a28', lineHeight: 1.65, textAlign: 'center', marginBottom: '6px' }}>{backTekst}</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {(flyer.qrPlaats === 'achter' || flyer.qrPlaats === 'beide') && <div style={{ border: `2px solid ${flyer.kleur}`, padding: '4px', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <QrCode size={36} fg={flyer.kleur} bg={bg} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6px', color: flyer.kleur, letterSpacing: '0.1em' }}>WEBSITE</div>
            </div>}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <div style={{ height: '2px', background: flyer.accent }} />
          <div style={{ height: '4px', background: flyer.kleur }} />
        </div>
      </div>
    );
  }

  // ── WARM BACK ─────────────────────────────────────────────────────────────
  if (flyer.design === 'warm') {
    const bg = '#FFF8F0';
    return (
      <div style={{ ...base, background: bg }}>
        <div style={{ background: flyer.kleur, borderRadius: '0 0 40px 0', padding: '14px 16px 16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '60px', height: '60px', borderRadius: '50%', background: flyer.accent, opacity: 0.2 }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.15em', marginBottom: '5px', textTransform: 'uppercase' }}>Vind ons!</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: '#fff', lineHeight: 1.1 }}>{naam}</div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
            {contactRows.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: `${flyer.accent}12`, borderRadius: '6px', padding: '5px 8px' }}>
                <span style={{ fontSize: '9px', color: flyer.accent, flexShrink: 0 }}>♥</span>
                <span style={{ fontSize: '7.5px', color: '#5a4a3a', lineHeight: 1.4, wordBreak: 'break-all' }}>{c.v}</span>
              </div>
            ))}
          </div>
          {urenLines.length > 0 && (
            <div style={{ borderTop: `2px solid ${flyer.accent}40`, paddingTop: '8px', marginBottom: '8px' }}>
              <div style={{ fontSize: '7px', color: flyer.kleur, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '4px' }}>OPENINGSTIJDEN</div>
              {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7.5px', color: '#5a4a3a', lineHeight: 1.6 }}>{u}</div>)}
            </div>
          )}
          <div style={{ fontSize: '8px', color: '#5a4a3a', lineHeight: 1.65, marginBottom: '4px' }}>{backTekst}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 16px', borderTop: `2px solid ${flyer.accent}50`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '7px', color: '#bbb', fontFamily: 'var(--font-mono)' }}>Scan voor website</div>
          {(flyer.qrPlaats === 'achter' || flyer.qrPlaats === 'beide') && <QrCode size={32} fg={flyer.kleur} bg={bg} />}
        </div>
      </div>
    );
  }

  // ── NEON BACK ─────────────────────────────────────────────────────────────
  if (flyer.design === 'neon') {
    const bg = '#0A0A12';
    return (
      <div style={{ ...base, background: bg }}>
        <div style={{ height: '3px', background: `linear-gradient(90deg, transparent, ${flyer.accent}, transparent)`, boxShadow: `0 0 12px ${flyer.accent}` }} />
        <div style={{ padding: '14px 18px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.2em', marginBottom: '6px', textTransform: 'uppercase', textShadow: `0 0 8px ${flyer.accent}` }}>Contact</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: '#fff', marginBottom: '4px' }}>{naam}</div>
          <div style={{ height: '1px', background: `linear-gradient(90deg, ${flyer.accent}, transparent)`, marginBottom: '14px', boxShadow: `0 0 6px ${flyer.accent}` }} />
          {contactRows.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '9px' }}>
              <div style={{ width: '20px', height: '20px', border: `1px solid ${flyer.accent}60`, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '9px', color: flyer.accent, textShadow: `0 0 6px ${flyer.accent}` }}>{c.icon}</span>
              </div>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-mono)', lineHeight: 1.4, wordBreak: 'break-all' }}>{c.v}</span>
            </div>
          ))}
          {urenLines.length > 0 && (
            <div style={{ border: `1px solid ${flyer.accent}30`, borderRadius: '4px', padding: '7px 10px', marginTop: '4px', marginBottom: '8px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, marginBottom: '4px', letterSpacing: '0.12em' }}>OPENINGSTIJDEN</div>
              {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>{u}</div>)}
            </div>
          )}
          <div style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{backTekst}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 18px', borderTop: `1px solid ${flyer.accent}25`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>Scan voor meer</div>
          {(flyer.qrPlaats === 'achter' || flyer.qrPlaats === 'beide') && <div style={{ border: `1px solid ${flyer.accent}60`, padding: '3px', borderRadius: '3px', boxShadow: `0 0 8px ${flyer.accent}30` }}>
            <QrCode size={32} fg={flyer.accent} bg="transparent" />
          </div>}
        </div>
      </div>
    );
  }

  // ── CORPORATE BACK ────────────────────────────────────────────────────────
  if (flyer.design === 'corporate') {
    return (
      <div style={{ ...base, background: '#fff' }}>
        <div style={{ background: flyer.kleur, padding: '12px 18px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.15em', marginBottom: '4px' }}>CONTACTGEGEVENS</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: '#fff' }}>{naam}</div>
            </div>
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={28} style={{ background: 'rgba(255,255,255,0.1)', padding: '3px', borderRadius: '3px' }} />
              : <div style={{ width: '28px', height: '28px', background: flyer.accent, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: flyer.kleur }}>{initials}</div>
            }
          </div>
        </div>
        <div style={{ height: '3px', background: flyer.accent }} />
        <div style={{ padding: '12px 18px' }}>
          <div style={{ fontSize: '8px', color: '#555', lineHeight: 1.65, marginBottom: '12px', fontStyle: 'italic' }}>{backTekst}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {contactRows.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: '8px', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: '9px', color: flyer.accent, textAlign: 'center' }}>{c.icon}</span>
                <span style={{ fontSize: '8px', color: '#333', fontFamily: 'var(--font-mono)', lineHeight: 1.4, wordBreak: 'break-all' }}>{c.v}</span>
              </div>
            ))}
          </div>
          {urenLines.length > 0 && (
            <div style={{ marginTop: '10px', background: '#f8f8f8', borderLeft: `3px solid ${flyer.accent}`, padding: '7px 10px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: '#888', letterSpacing: '0.1em', marginBottom: '3px' }}>OPENINGSTIJDEN</div>
              {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7.5px', color: '#555', lineHeight: 1.55 }}>{u}</div>)}
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '7px 18px', background: '#f5f5f5', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '7px', color: '#aaa', fontFamily: 'var(--font-mono)' }}>Scan voor onze website</div>
          {(flyer.qrPlaats === 'achter' || flyer.qrPlaats === 'beide') && <QrCode size={32} fg={flyer.kleur} bg="#f5f5f5" />}
        </div>
      </div>
    );
  }

  // ── PLAYFUL BACK ──────────────────────────────────────────────────────────
  if (flyer.design === 'playful') {
    return (
      <div style={{ ...base, background: '#FFFBF0' }}>
        <div style={{ background: flyer.accent, borderRadius: '0 0 30px 0', padding: '12px 16px 14px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '4px', right: '8px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.kleur, opacity: 0.7, letterSpacing: '0.1em', marginBottom: '4px' }}>NEEM CONTACT OP!</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', color: flyer.kleur, fontWeight: 700 }}>{naam}</div>
        </div>
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
            {contactRows.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: `${flyer.kleur}0a`, borderRadius: '8px', padding: '5px 10px' }}>
                <span style={{ fontSize: '10px', color: flyer.accent }}>★</span>
                <span style={{ fontSize: '7.5px', color: '#444', fontWeight: 500, wordBreak: 'break-all', lineHeight: 1.4 }}>{c.v}</span>
              </div>
            ))}
          </div>
          {urenLines.length > 0 && (
            <div style={{ background: `${flyer.accent}18`, borderRadius: '8px', padding: '7px 10px', marginBottom: '8px' }}>
              <div style={{ fontSize: '7px', color: flyer.kleur, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '3px' }}>OPENINGSTIJDEN</div>
              {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7.5px', color: '#555', lineHeight: 1.55 }}>{u}</div>)}
            </div>
          )}
          <div style={{ fontSize: '8px', color: '#666', lineHeight: 1.6, marginBottom: '4px' }}>{backTekst}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '7px 16px', background: `${flyer.kleur}08`, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '7px', color: '#bbb', fontFamily: 'var(--font-mono)' }}>Scan ons!</div>
          {(flyer.qrPlaats === 'achter' || flyer.qrPlaats === 'beide') && <div style={{ background: flyer.kleur, padding: '3px', borderRadius: '4px' }}>
            <QrCode size={30} fg="#fff" bg={flyer.kleur} />
          </div>}
        </div>
      </div>
    );
  }

  // Fallback for designs without explicit back implementation
  return (
    <div style={{ ...base, background: flyer.kleur, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: '#fff', opacity: 0.5 }}>Achterkant</div>
      {contactRows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '80%' }}>
          {contactRows.map((c, i) => (
            <div key={i} style={{ fontSize: '8px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>{c.icon} {c.v}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Coverage Visual (now uses real NL map) ──────────────────────────────────

interface Pc4Stats {
  center: { lat: number; lon: number };
  pc4Count: number;
  totalAdressen: number;
  estAdressenMaand: number;
  referentieVorigjaar: number;
  verhuisgraadPct: number;
  dataBron: string;
}

function CoverageVisual({ centrum, straalKm, onPc4sChange, onEstChange }: {
  centrum: string; straalKm: number; onPc4sChange?: (pc4s: string[]) => void; onEstChange?: (est: number) => void;
}) {
  const [apiStats, setApiStats] = useState<Pc4Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [pc4List, setPc4List] = useState<string[]>([]);

  useEffect(() => {
    if (!centrum || centrum.length < 4) { setApiStats(null); return; }
    let cancelled = false;
    setLoading(true);
    fetch('/api/pc4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ centrumPc4: centrum, straalKm }),
    })
      .then(r => r.json())
      .then(data => {
        if (!cancelled && !data.error) {
          setApiStats(data);
          onEstChange?.(data.estAdressenMaand);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [centrum, straalKm]);

  const handlePc4sFound = (pc4s: string[]) => {
    setPc4List(pc4s);
    onPc4sChange?.(pc4s);
  };

  const fallback = estimeerDekkingsgebied(straalKm);
  const totalAdressen = apiStats?.totalAdressen ?? Math.round(Math.PI * straalKm * straalKm * 580);
  const estAdressenMaand = apiStats?.estAdressenMaand ?? fallback.estAdressenMaand;
  const verhuisgraadPct = apiStats?.verhuisgraadPct ?? 5.5;
  const cbsBron = apiStats?.dataBron?.startsWith('CBS') ?? false;
  const t = (v: string) => loading ? '...' : v;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <NLMap center={apiStats?.center ?? null} straalKm={straalKm} onPc4sFound={handlePc4sFound} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginBottom: '3px' }}>ADRESSEN IN WERKGEBIED</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--green)', lineHeight: 1 }}>{t(`~${totalAdressen.toLocaleString('nl')}`)}</div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>totaal bereik · {straalKm} km straal</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginBottom: '3px' }}>NIEUWE HUISHOUDENS/MND</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--green)', lineHeight: 1 }}>{t(`~${estAdressenMaand}`)}</div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            {loading ? 'laden...' : `${verhuisgraadPct}% instroom/jaar${cbsBron ? ' (CBS 2023)' : ' (schatting)'}`}
          </div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginBottom: '3px' }}>DOELGROEP PER JAAR</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--green)', lineHeight: 1 }}>{t(`~${(estAdressenMaand * 12).toLocaleString('nl')}`)}</div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>nieuwe huishoudens om te bereiken</div>
        </div>
      </div>
      {pc4List.length > 0 && (
        <div style={{
          background: 'var(--white)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius)', padding: '10px 12px',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginBottom: '6px' }}>
            PC4-GEBIEDEN IN BEZORGGEBIED ({pc4List.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {pc4List.map(pc4 => (
              <span key={pc4} style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                color: 'var(--green)', background: 'var(--green-bg)',
                border: '1px solid rgba(0,232,122,0.25)',
                borderRadius: '3px', padding: '2px 6px',
              }}>{pc4}</span>
            ))}
          </div>
        </div>
      )}
      <div style={{
        background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)',
        borderRadius: 'var(--radius)', padding: '10px 12px',
        fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)',
      }}>
        💡 Verwachte verhuizingen in dit gebied: ~{estAdressenMaand} huishoudens/mnd — dit wordt je startaantal in de volgende stap
      </div>
    </div>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────

function MiniChart() {
  const data = [42, 58, 45, 72, 61, 88, 75, 95, 82, 110, 98, 125];
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px', padding: '0 4px' }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{
            width: '100%', background: i === data.length - 1 ? 'var(--green)' : 'var(--paper3)',
            height: `${(v / max) * 52}px`, borderRadius: '2px 2px 0 0', transition: 'height 0.3s'
          }} />
          {i % 3 === 0 && <span style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            {MAANDEN[i].slice(0, 3)}
          </span>}
        </div>
      ))}
    </div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────

function Ticker() {
  const items = [
    "🟢 Koffiehuis Utrecht — 380 flyers bezorgd",
    "🟢 StucPro Amsterdam — 12 offertes aangevraagd",
    "🟢 Meubelwinkel Haarlem — campagne verlengd",
    "🟢 Fietsenwinkel Leiden — 520 flyers verstuurd",
    "🟢 Kapper Rotterdam — 8 nieuwe vaste klanten",
    "🟢 Bakkerij Eindhoven — 3e maand actief",
  ];
  const doubled = [...items, ...items];
  return (
    <div style={{
      overflow: 'hidden', background: 'var(--green-bg)',
      borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '8px 0'
    }}>
      <div className="ticker-inner" style={{ whiteSpace: 'nowrap' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)',
            marginRight: '48px', display: 'inline-block'
          }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

// ─── ROI Calculator ───────────────────────────────────────────────────────────

function RoiCalc({ kluswaarde, onChange }: { kluswaarde: number; onChange: (v: number) => void }) {
  const flyers = 500;
  const conversie = 0.05;
  const klanten = Math.round(flyers * conversie);
  const omzet = klanten * kluswaarde;
  const kosten = berekenPrijs(flyers, 'a5', false);
  const roi = Math.round(((omzet - kosten) / kosten) * 100);

  return (
    <div style={{
      background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.2)',
      borderRadius: 'var(--radius)', padding: '20px', marginBottom: '20px'
    }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '12px' }}>
        ROI Calculator
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>
          Gemiddelde klantwaarde (per jaar)
        </label>
        <input type="range" min={200} max={10000} step={100} value={kluswaarde}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--green)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
          <span>€200</span>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>€{kluswaarde.toLocaleString('nl')}</span>
          <span>€10.000</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
        {[
          { label: 'Flyers verstuurd', val: String(flyers) },
          { label: 'Verwachte klanten', val: `~${klanten}` },
          { label: 'Verwacht rendement', val: `${roi}%` },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--paper)', border: '1px solid var(--line)',
            borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center'
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--green)' }}>{s.val}</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Conversies Dashboard ─────────────────────────────────────────────────────

interface ConvResult {
  code: string;
  adres: string;
  postcode: string;
  stad: string;
  verzondenOp: string;
  gebruikt: boolean;
  gebruiktOp: string | null;
  geldigTot: string;
}

interface ConvData {
  results: ConvResult[];
  totaal: number;
  geconverteerd: number;
  conversieRatio: number;
}

function ConversiesDashboard({ campaigns, onStartCampagne }: {
  campaigns: Campaign[];
  onStartCampagne: () => void;
}) {
  const [convData, setConvData] = useState<ConvData | null>(null);
  const [convLoading, setConvLoading] = useState(false);
  const [convError, setConvError] = useState('');
  const [selectedCampagne, setSelectedCampagne] = useState<string>('');

  const activeCampagnes = campaigns.filter(c => c.status !== 'geannuleerd');

  useEffect(() => {
    const id = selectedCampagne || activeCampagnes[0]?.id?.toString();
    if (!id) return;
    setConvLoading(true);
    setConvError('');
    fetch(`/api/conversies?campagneId=${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setConvData(d);
      })
      .catch(e => setConvError(e.message || 'Fout bij laden'))
      .finally(() => setConvLoading(false));
  }, [selectedCampagne]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeCampagnes.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>◑</div>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--ink)' }}>Geen campagnes gevonden</div>
        <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px' }}>Start eerst een campagne om conversiedata te zien.</div>
        <button
          onClick={onStartCampagne}
          style={{
            background: 'var(--green)', color: 'white', border: 'none', borderRadius: 'var(--radius)',
            padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Nieuwe campagne starten
        </button>
      </div>
    );
  }

  const currentId = selectedCampagne || activeCampagnes[0]?.id?.toString() || '';

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Campagne selector */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Campagne</label>
        <select
          value={currentId}
          onChange={e => setSelectedCampagne(e.target.value)}
          style={{
            border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '8px 12px',
            fontSize: '14px', background: 'var(--paper)', color: 'var(--ink)', cursor: 'pointer',
          }}
        >
          {activeCampagnes.map(c => (
            <option key={c.id} value={c.id.toString()}>
              {c.centrum} — {new Date(c.datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {/* Stats row */}
      {convData && !convLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Flyers verstuurd', val: convData.totaal },
            { label: 'Geconverteerd', val: convData.geconverteerd },
            { label: 'Conversieratio', val: `${convData.conversieRatio}%` },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--paper)', border: '1px solid var(--line)',
              borderRadius: 'var(--radius)', padding: '20px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 700, color: 'var(--green)', marginBottom: '4px' }}>
                {s.val}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading / error */}
      {convLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '14px' }}>
          Laden…
        </div>
      )}
      {convError && (
        <div style={{
          background: '#FFF2F2', border: '1px solid #FFD0D0', borderRadius: 'var(--radius)',
          padding: '12px 16px', fontSize: '13px', color: '#CC0000', marginBottom: '16px',
        }}>
          {convError}
        </div>
      )}

      {/* Results table */}
      {convData && !convLoading && convData.results.length > 0 && (
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
                {['Adres', 'Postcode', 'Stad', 'Status', 'Verstuurd op', 'Gescand op'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--font-mono)',
                    fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    fontWeight: 600,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {convData.results.map((r, i) => (
                <tr key={r.code} style={{ borderBottom: i < convData.results.length - 1 ? '1px solid var(--line)' : 'none', background: i % 2 === 0 ? 'white' : 'var(--paper)' }}>
                  <td style={{ padding: '10px 14px', color: 'var(--ink)' }}>{r.adres}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{r.postcode}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--ink)' }}>{r.stad}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                      background: r.gebruikt ? '#E8FFF4' : new Date() > new Date(r.geldigTot) ? '#FFF3E0' : '#F0F0F0',
                      color: r.gebruikt ? '#00875A' : new Date() > new Date(r.geldigTot) ? '#CC7700' : '#666',
                    }}>
                      {r.gebruikt ? '✓ Geconverteerd' : new Date() > new Date(r.geldigTot) ? 'Verlopen' : 'Actief'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>
                    {new Date(r.verzondenOp).toLocaleDateString('nl-NL')}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>
                    {r.gebruiktOp ? new Date(r.gebruiktOp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {convData && !convLoading && convData.results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '14px' }}>
          Nog geen flyers verstuurd voor deze campagne.
        </div>
      )}

      {/* Info box */}
      <div style={{
        marginTop: '24px', background: 'var(--paper)', border: '1px solid var(--line)',
        borderRadius: 'var(--radius)', padding: '16px 20px', fontSize: '12px', color: 'var(--muted)',
        fontFamily: 'var(--font-mono)',
      }}>
        <strong style={{ color: 'var(--ink)' }}>Hoe werkt verificatie?</strong>
        <br />
        Elke flyer bevat een unieke QR-code. Wanneer een nieuwe bewoner de winkel bezoekt, scant de kassamedewerker de QR-code.
        Het systeem markeert de code als gebruikt en registreert de conversie. Codes zijn eenmalig inwisselbaar en 30 dagen geldig.
      </div>
    </div>
  );
}

function getTourSteps(): Array<{
  page: 'dashboard' | 'wizard' | 'flyer' | 'credits' | 'profiel' | 'conversies' | null;
  targetId: string | null;
  titel: string;
  tekst: string;
}> {
  return [
    {
      page: 'dashboard',
      targetId: null,
      titel: 'Welkom bij LokaalKabaal 👋',
      tekst: 'In 3 minuten laat ik je alles zien. Klik op de groene knop om verder te gaan.',
    },
    {
      page: 'dashboard',
      targetId: 'tour-nieuwe-campagne',
      titel: '+ Nieuwe campagne',
      tekst: 'Hier start je een nieuwe flyercampagne. De wizard begeleidt je stap voor stap: branche kiezen, regio tekenen, flyer maken, betalen.',
    },
    {
      page: 'wizard',
      targetId: 'tour-wizard-branche',
      titel: 'Stap 1 — Kies je branche',
      tekst: 'Kies je type bedrijf. De AI gebruikt dit om de tone-of-voice van je flyertekst te bepalen.',
    },
    {
      page: 'dashboard',
      targetId: 'tour-nav-conversies',
      titel: 'Conversies & ROI',
      tekst: 'In het Conversies-scherm zie je hoeveel flyers zijn verstuurd en hoeveel klanten de QR-code hebben gescand bij de kassa. Zo meet je de ROI van elke campagne.',
    },
    {
      page: 'profiel',
      targetId: 'tour-nav-profiel',
      titel: 'Jouw profiel',
      tekst: 'Sla je bedrijfsgegevens en factuuremails op. Facturen worden automatisch verstuurd op de 25e van elke maand.',
    },
    {
      page: 'dashboard',
      targetId: null,
      titel: 'Klaar om te beginnen 🚀',
      tekst: 'Dat was de rondleiding. Start je eerste campagne — je eerste flyer is live binnen 24 uur.',
    },
  ];
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function LokaalKabaal() {
  const router = useRouter();
  const [page, setPage] = useState<Page>('dashboard');
  const [pendingCampaign, setPendingCampaign] = useState<{
    spec: string; datum: string; centrum: string; aantalFlyers: number;
    formaat: string; dubbelzijdig: boolean; maxBudget: number; proefAdres: string;
  } | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    if (typeof window === 'undefined') return [];
    try { const s = localStorage.getItem('lk_campaigns'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('lk_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);
  const [user, setUser] = useState<{ email: string; naam: string } | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [spotlightEl, setSpotlightEl] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lk_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (!localStorage.getItem('lk_demo_done')) {
        setShowDemo(true);
      }
    } catch {}
  }, []);

  // Spotlight positioning for tour
  useEffect(() => {
    if (!showDemo) { setSpotlightEl(null); return; }
    const TOUR = getTourSteps();
    const step = TOUR[demoStep];
    if (!step) { setSpotlightEl(null); return; }
    if (step.page && step.page !== page) { setPage(step.page); return; }
    if (!step.targetId) { setSpotlightEl(null); return; }
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-tour="${step.targetId}"]`) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        setSpotlightEl({ top: r.top, left: r.left, width: r.width, height: r.height });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [demoStep, showDemo, page]); // eslint-disable-line

  // Handle Stripe payment return
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const stored = sessionStorage.getItem('lk_pending_campaign');
      if (stored) {
        try {
          const pc = JSON.parse(stored) as NonNullable<typeof pendingCampaign>;
          const newCampaign: Campaign = {
            id: Date.now(),
            spec: pc.spec,
            datum: pc.datum,
            centrum: pc.centrum,
            aantalFlyers: pc.aantalFlyers,
            formaat: pc.formaat,
            dubbelzijdig: pc.dubbelzijdig,
            maxBudget: pc.maxBudget,
            status: 'actief',
            stripeSessionId: params.get('session_id') ?? undefined,
            createdAt: new Date().toISOString(),
            proefAdres: pc.proefAdres || undefined,
          };
          setCampaigns(prev => [...prev, newCampaign]);
          sessionStorage.removeItem('lk_pending_campaign');
          setPendingCampaign(null);
        } catch {}
      }
      setPage('dashboard');
      window.history.replaceState({}, '', '/app');
    } else if (params.get('payment') === 'cancelled') {
      setPage('dashboard');
      window.history.replaceState({}, '', '/app');
    }
  }, []);

  const uitloggen = () => {
    localStorage.removeItem('lk_user');
    router.push('/login');
  };

  const INIT_WIZ: WizState = {
    step: 1,
    akkoord: { av: false, privacy: false },
    kluswaarde: 2500,
    spec: '', specQ: '',
    datum: '',
    centrum: '', straal: 10,
    aantalFlyers: 500,
    formaat: 'a5', dubbelzijdig: false,
    proefFlyer: false, proefAdres: '', email: '',
    pc4Lijst: [],
    pc4Add: '',
    flyerIndex: 0,
  };

  const [wiz, setWiz] = useState<WizState>(INIT_WIZ);

  const startNieuweCampagne = () => {
    setWiz(INIT_WIZ);
    setPage('wizard');
  };

  type SavedFlyer = FlyerState & { naam: string; id: number };

  const INIT_FLYER: FlyerState = {
    kleur: '#0A0A0A', accent: '#00E87A', afmeting: 'a5', dubbelzijdig: false,
    bedrijfsnaam: '', slogan: '', telefoon: '', email: '', website: '',
    usp: '', tekst: '', logoData: null,
    websiteUrl: '', websiteScan: null, design: 'editorial',
    heroImageUrl: null, heroOffsetX: 50, heroOffsetY: 50, heroScale: 100, headline: '', cta: '', pdfUrl: null,
    adres: '', openingstijden: '', backTekst: '', qrPlaats: 'achter' as const,
  };

  const [flyers, setFlyers] = useState<SavedFlyer[]>(() => {
    if (typeof window === 'undefined') return [{ ...INIT_FLYER, naam: 'Flyer 1', id: 1 }];
    try {
      const saved = localStorage.getItem('lk_flyers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ ...INIT_FLYER, naam: 'Flyer 1', id: 1 }];
  });
  const [activeFlyerIdx, setActiveFlyerIdx] = useState(0);
  const flyer = flyers[Math.min(activeFlyerIdx, flyers.length - 1)];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lk_flyers', JSON.stringify(flyers));
    }
  }, [flyers]);

  const [aiLoading, setAiLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const [previewSide, setPreviewSide] = useState<'voor' | 'achter'>('voor');
  const [adresStatus, setAdresStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [adresFeedback, setAdresFeedback] = useState<{ volledig?: string; adresRegel?: string; postcode?: string; stad?: string; error?: string; suggesties?: string[] }>({});
  const adresTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const wizardFlyerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLInputElement>(null);
  const flyerPreviewRef = useRef<HTMLDivElement>(null);

  const updateFlyer = useCallback((patch: Partial<FlyerState>) => {
    setFlyers(fs => fs.map((f, i) => i === activeFlyerIdx ? { ...f, ...patch } : f));
  }, [activeFlyerIdx]);

  const updateWiz = useCallback((patch: Partial<WizState>) => {
    setWiz(w => ({ ...w, ...patch }));
  }, []);

  const runFlyerPipeline = useCallback(async (url: string) => {
    setScanLoading(true);
    setAiLoading(true);
    setScanMsg('Website ophalen en flyer genereren...');
    try {
      const res = await fetch('/api/flyer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          branche: wiz.spec || 'Lokale retailer',
          bedrijfsnaam: flyer.bedrijfsnaam || new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '').split('.')[0],
          telefoon: flyer.telefoon || '',
          email: flyer.email || '',
          website: flyer.website || url,
          slogan: flyer.slogan || '',
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setScanMsg(data.error || `Fout (${res.status})`); return; }

      const patch: Partial<FlyerState> = {
        websiteScan: { primaryColor: data.kleuren?.primair, accentColor: data.kleuren?.accent },
        heroImageUrl: data.besteFotoUrl || null,
        pdfUrl: data.pdfUrl || null,
        logoData: data.logoUrl || null,
      };
      if (data.kleuren?.primair) patch.kleur = data.kleuren.primair;
      if (data.kleuren?.accent) patch.accent = data.kleuren.accent;
      if (data.tekst?.bodytekst) patch.tekst = data.tekst.bodytekst;
      if (data.tekst?.usps?.length) patch.usp = data.tekst.usps.join('\n');
      if (data.tekst?.headline) patch.headline = data.tekst.headline;
      if (data.tekst?.cta) patch.cta = data.tekst.cta;

      updateFlyer(patch);
      setScanMsg(data.pdfUrl ? 'Flyer gegenereerd — PDF klaar!' : 'Kleuren en tekst overgenomen!');
    } catch (e) {
      setScanMsg('Generatie mislukt — controleer de URL en probeer opnieuw.');
      console.error(e);
    } finally {
      setScanLoading(false);
      setAiLoading(false);
      setTimeout(() => setScanMsg(''), 6000);
    }
  }, [wiz.spec, flyer.bedrijfsnaam, flyer.slogan, flyer.telefoon, flyer.email, flyer.website, updateFlyer]);

  const generateAI = useCallback(async () => {
    const url = flyer.websiteUrl;
    if (url) {
      await runFlyerPipeline(url);
      return;
    }
    // Fallback zonder URL: alleen tekst via /api/ai
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec: wiz.spec, bedrijfsnaam: flyer.bedrijfsnaam,
          slogan: flyer.slogan,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.tekst) updateFlyer({ tekst: data.tekst });
      if (data.usp) updateFlyer({ usp: data.usp });
    } catch (e) {
      console.error('AI generatie mislukt:', e);
    } finally {
      setAiLoading(false);
    }
  }, [wiz.spec, flyer.bedrijfsnaam, flyer.slogan, flyer.websiteUrl, runFlyerPipeline, updateFlyer]);

  const scanWebsite = useCallback(async () => {
    if (!flyer.websiteUrl) return;
    await runFlyerPipeline(flyer.websiteUrl);
  }, [flyer.websiteUrl, runFlyerPipeline]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateFlyer({ logoData: ev.target?.result as string });
    reader.readAsDataURL(file);
  }, [updateFlyer]);

  const handleHeroUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateFlyer({ heroImageUrl: ev.target?.result as string, heroScale: 100, heroOffsetX: 50, heroOffsetY: 50 });
    reader.readAsDataURL(file);
  }, [updateFlyer]);

  // ── Sidebar ──

  const navItems: { id: Page; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '◈' },
    { id: 'wizard', label: 'Nieuwe campagne', icon: '＋' },
    { id: 'flyer', label: 'Mijn flyer', icon: '◧' },
    { id: 'conversies', label: 'Conversies', icon: '◑' },
    { id: 'credits', label: 'Credits', icon: '◎' },
    { id: 'profiel', label: 'Mijn profiel', icon: '◉' },
  ];

  // ── Pages ──

  function renderDashboard() {
    return (
      <div className="fade-in">

        {/* Dashboard header met nieuwe campagne knop */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.08em' }}>MIJN CAMPAGNES</div>
          <button data-tour="tour-nieuwe-campagne" onClick={startNieuweCampagne} style={{
            padding: '8px 16px', background: 'var(--ink)', color: 'var(--paper)',
            border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '12px',
            cursor: 'pointer', fontFamily: 'var(--font-mono)',
          }}>+ Nieuwe campagne</button>
        </div>

        {/* Proef flyer — wacht op goedkeuring */}
        {pendingCampaign && (
          <div style={{
            background: '#fff', border: '2px solid var(--green)', borderRadius: 'var(--radius)',
            padding: '20px 24px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ width: '8px', height: '8px', background: '#e8a020', borderRadius: '50%', display: 'inline-block' }} />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#e8a020', fontWeight: 700 }}>WACHT OP JOUW GOEDKEURING</span>
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginBottom: '4px' }}>
                Proef flyer onderweg naar {pendingCampaign.proefAdres.split(',')[0]}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {pendingCampaign.spec} · {pendingCampaign.aantalFlyers.toLocaleString('nl')} flyers/mnd · {pendingCampaign.formaat.toUpperCase()} · start {pendingCampaign.datum ? new Date(pendingCampaign.datum).toLocaleDateString('nl', { month: 'long', year: 'numeric' }) : '—'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <button
                onClick={() => { setPage('flyer'); }}
                style={{ padding: '9px 18px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)', cursor: 'pointer', fontSize: '13px' }}>
                Flyer aanpassen
              </button>
              <button
                onClick={async () => {
                  if (!pendingCampaign) return;
                  sessionStorage.setItem('lk_pending_campaign', JSON.stringify(pendingCampaign));
                  const res = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      maxFlyers: pendingCampaign.aantalFlyers,
                      formaat: pendingCampaign.formaat,
                      dubbelzijdig: pendingCampaign.dubbelzijdig,
                      spec: pendingCampaign.spec,
                      datum: pendingCampaign.datum,
                      centrum: pendingCampaign.centrum,
                      email: user?.email || 'klant@lokaalkabaal.nl',
                      bedrijfsnaam: flyer.bedrijfsnaam || 'Klant',
                    }),
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }}
                style={{ padding: '9px 18px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                Betalen & activeren →
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Actieve campagnes', val: String(campaigns.filter(c => c.status === 'actief').length), delta: campaigns.length === 0 ? 'Start je eerste' : 'lopend' },
            { label: 'Max flyers/mnd', val: campaigns.length ? campaigns.filter(c=>c.status==='actief').reduce((s,c)=>s+c.aantalFlyers,0).toLocaleString('nl') : '0', delta: 'afgerond naar boven' },
            { label: 'Max budget/mnd', val: campaigns.length ? formatPrijs(campaigns.filter(c=>c.status==='actief').reduce((s,c)=>s+c.maxBudget,0)) : '—', delta: 'betaal alleen actual' },
            { label: 'Rollover', val: '0', delta: 'flyers volgende mnd' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Campaigns list or empty state */}
        {campaigns.length === 0 ? (
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '60px 40px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', marginBottom: '16px', color: 'var(--line)' }}>◈</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', marginBottom: '10px' }}>Nog geen campagnes</div>
            <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.65, maxWidth: '380px', margin: '0 auto 24px' }}>
              Maak je eerste campagne en bereik nieuwe bewoners in jouw werkgebied — automatisch elke maand.
            </p>
            <button onClick={startNieuweCampagne} style={{ padding: '12px 28px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              + Eerste campagne starten
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {campaigns.map(c => {
              const now = new Date();
              const next25 = new Date(now.getFullYear(), now.getMonth(), 25);
              if (next25 <= now) next25.setMonth(next25.getMonth() + 1);
              const daysUntil = Math.ceil((next25.getTime() - now.getTime()) / 86400000);
              return (
              <div key={c.id} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                {/* Type banner */}
                <div style={{ background: 'var(--green-bg)', borderBottom: '1px solid rgba(0,232,122,0.2)', padding: '6px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Nieuwe bewoners · Altum-data</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(0,0,0,0.3)' }}>·</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green-dim)' }}>elke 25e automatisch verstuurd</span>
                  </div>
                  {c.status === 'actief' && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green-dim)' }}>
                      volgende verzending over <strong>{daysUntil} dag{daysUntil !== 1 ? 'en' : ''}</strong>
                    </span>
                  )}
                </div>
                {/* Campaign body */}
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.status === 'actief' ? 'var(--green)' : '#888', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{c.spec}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                        {c.centrum} · max {c.aantalFlyers.toLocaleString('nl')} flyers/mnd · {c.formaat.toUpperCase()}{c.dubbelzijdig ? ' dubbelzijdig' : ''} · start {c.datum ? new Date(c.datum).toLocaleDateString('nl', { month: 'long', year: 'numeric' }) : '—'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>{formatPrijs(c.maxBudget)}<span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>/mnd max</span></div>
                      <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>betaal alleen actual gebruik</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '3px 8px', borderRadius: '3px', background: c.status === 'actief' ? 'var(--green-bg)' : 'var(--paper2)', color: c.status === 'actief' ? 'var(--green-dim)' : 'var(--muted)', border: `1px solid ${c.status === 'actief' ? 'rgba(0,232,122,0.3)' : 'var(--line)'}`, fontWeight: 700 }}>
                      {c.status.toUpperCase()}
                    </span>
                    <button onClick={() => setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, status: x.status === 'actief' ? 'gepauzeerd' : 'actief' } : x))}
                      style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)', cursor: 'pointer' }}>
                      {c.status === 'actief' ? 'Pauzeren' : 'Hervatten'}
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        <Ticker />
      </div>
    );
  }

  function renderWizard() {
    const { step, akkoord, kluswaarde, spec, specQ, datum, centrum, straal, aantalFlyers, formaat, dubbelzijdig, proefFlyer, proefAdres, flyerIndex } = wiz;
    const availableMonths = getAvailableMonths();
    const stats = estimeerDekkingsgebied(straal);
    const actualPc4Count = wiz.pc4Lijst.length > 0 ? wiz.pc4Lijst.length : stats.pc4Count;
    const abonnement = berekenAbonnement(actualPc4Count);
    const prijs = abonnement.total;
    const proefPrijs = 4.95;
    const totaal = prijs + (proefFlyer ? proefPrijs : 0);

    const canNext = (
      (step === 1 && akkoord.av && akkoord.privacy) ||
      (step === 2 && spec !== '') ||
      (step === 3 && datum !== '') ||
      (step === 4 && centrum !== '') ||
      step === 5 ||
      (step === 6 && (wiz.email || '').includes('@') && (!proefFlyer || adresStatus === 'ok')) ||
      step === 7
    );

    const specFiltered = SPECS.filter(s => s.toLowerCase().includes(specQ.toLowerCase()));

    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topbar))', overflow: 'hidden' }}>
        {/* Progress bar — fixed top */}
        <div style={{ flexShrink: 0, background: 'var(--paper)', padding: '12px 24px 10px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', maxWidth: '680px' }}>
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i + 1 <= step ? 'var(--green)' : 'var(--line)', transition: 'background 0.3s' }} />
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
            Stap {step} van 7 — {['Akkoord', 'Branche', 'Startdatum', 'Werkgebied', 'Formaat & aantallen', 'Controleer', 'Bevestiging'][step - 1]}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px', marginBottom: '0', maxWidth: '680px', margin: '0 auto' }}>

          {/* STAP 1: Akkoord */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>
                Welkom bij LokaalKabaal
              </h2>
              <p style={{ color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                Bereik nieuwe huiseigenaren in jouw postcodes met een fysieke flyer. Elke maand verwerken wij alle eigendomsoverdrachten en sturen op de 25e automatisch jouw flyer naar elk nieuw adres. Geen handmatig werk.
              </p>
              <RoiCalc kluswaarde={kluswaarde} onChange={v => updateWiz({ kluswaarde: v })} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { key: 'av' as const, label: 'Ik ga akkoord met de algemene voorwaarden' },
                  { key: 'privacy' as const, label: 'Ik ga akkoord met het privacybeleid' },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={akkoord[key]}
                      onChange={e => updateWiz({ akkoord: { ...akkoord, [key]: e.target.checked } })}
                      style={{ marginTop: '2px', accentColor: 'var(--green)', width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '13px', lineHeight: 1.5 }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STAP 2: Branche */}
          {step === 2 && (
            <div data-tour="tour-wizard-branche">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>Wat voor bedrijf heb je?</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>Kies je branche voor de juiste copy en targeting.</p>
              <input
                type="text"
                placeholder="Zoek branche..."
                value={specQ}
                onChange={e => updateWiz({ specQ: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', marginBottom: '12px', background: 'var(--paper2)', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
                {specFiltered.map(s => (
                  <button key={s} onClick={() => updateWiz({ spec: s })}
                    style={{
                      padding: '10px 12px', textAlign: 'left',
                      border: `1px solid ${spec === s ? 'var(--green)' : 'var(--line)'}`,
                      borderRadius: 'var(--radius)', background: spec === s ? 'var(--green-bg)' : 'var(--paper)',
                      cursor: 'pointer', fontSize: '13px', fontWeight: spec === s ? 600 : 400,
                      color: spec === s ? 'var(--green-dim)' : 'var(--ink)', transition: 'all 0.15s'
                    }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* STAP 3: Datum */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>Wanneer wil je starten?</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
                Flyers worden elke maand op de <strong>25e</strong> verstuurd naar nieuwe bewoners van die maand. Kies je startmaand — tot 12 maanden vooruit.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {availableMonths.map(m => (
                  <button key={m.value} onClick={() => updateWiz({ datum: m.value })}
                    style={{
                      padding: '14px 10px', border: `1px solid ${datum === m.value ? 'var(--green)' : 'var(--line)'}`,
                      borderRadius: 'var(--radius)', background: datum === m.value ? 'var(--green-bg)' : 'var(--paper)',
                      cursor: 'pointer', fontWeight: datum === m.value ? 700 : 400, fontSize: '13px',
                      color: datum === m.value ? 'var(--green-dim)' : 'var(--ink)',
                    }}>
                    {m.label}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '16px', padding: '12px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                ℹ Startdatum is altijd de 1e van de gekozen maand. Bezorging vindt elke maand automatisch plaats op de 25e via Kadaster-data.
              </div>
            </div>
          )}

          {/* STAP 4: Werkgebied */}
          {step === 4 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>Kies je werkgebied</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
                De straal selecteert automatisch alle PC4-postcodes in dat gebied. Verwijder gebieden die je niet wil bereiken, of voeg extra postcodes handmatig toe.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>CENTRUM POSTCODE</label>
                  <input
                    type="text"
                    placeholder="bijv. 3512"
                    maxLength={4}
                    value={centrum}
                    onChange={e => updateWiz({ centrum: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1px solid var(--line)',
                      borderRadius: 'var(--radius)', fontSize: '16px', fontFamily: 'var(--font-mono)',
                      background: 'var(--paper2)', boxSizing: 'border-box', letterSpacing: '0.1em'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>
                    STRAAL: {straal} KM
                  </label>
                  <input
                    type="range" min={1} max={50} step={1} value={straal}
                    onChange={e => updateWiz({ straal: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--green)', marginTop: '8px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    <span>1 km</span><span>50 km</span>
                  </div>
                </div>
              </div>

              <CoverageVisual centrum={centrum} straalKm={straal} onPc4sChange={list => updateWiz({ pc4Lijst: list })} onEstChange={est => updateWiz({ aantalFlyers: roundUp50(Math.max(250, est)) })} />

              {/* PC4 chip editor */}
              {wiz.pc4Lijst.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                    GESELECTEERDE POSTCODES ({wiz.pc4Lijst.length}) — klik × om te verwijderen
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {wiz.pc4Lijst.map(pc4 => (
                      <span key={pc4} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '3px 8px', background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.3)',
                        borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)',
                      }}>
                        {pc4}
                        <button
                          onClick={() => updateWiz({ pc4Lijst: wiz.pc4Lijst.filter(p => p !== pc4) })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green-dim)', padding: '0 0 0 2px', fontSize: '13px', lineHeight: 1 }}
                        >×</button>
                      </span>
                    ))}
                  </div>
                  {/* Handmatig postcode toevoegen */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text" maxLength={4} placeholder="+ postcode toevoegen"
                      value={wiz.pc4Add}
                      onChange={e => updateWiz({ pc4Add: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const v = wiz.pc4Add.trim();
                          if (/^\d{4}$/.test(v) && !wiz.pc4Lijst.includes(v))
                            updateWiz({ pc4Lijst: [...wiz.pc4Lijst, v].sort(), pc4Add: '' });
                          else
                            updateWiz({ pc4Add: '' });
                        }
                      }}
                      style={{ padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontSize: '13px', width: '160px', background: 'var(--paper2)' }}
                    />
                    <button
                      onClick={() => {
                        const v = wiz.pc4Add.trim();
                        if (/^\d{4}$/.test(v) && !wiz.pc4Lijst.includes(v))
                          updateWiz({ pc4Lijst: [...wiz.pc4Lijst, v].sort(), pc4Add: '' });
                        else
                          updateWiz({ pc4Add: '' });
                      }}
                      style={{ padding: '7px 14px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Voeg toe
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STAP 5: Formaat & Aantallen */}
          {step === 5 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>Formaat & aantallen</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
                Minimum 250 flyers. A5 is ons standaardformaat — andere formaten hebben een toeslag.
              </p>

              {/* Formaat */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>FORMAAT</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'a6' as const, label: 'A6', afm: '105×148 mm', toeslag: '−€0,10/stuk' },
                    { id: 'a5' as const, label: 'A5', afm: '148×210 mm', toeslag: 'Standaard', std: true },
                    { id: 'a4' as const, label: 'A4', afm: '210×297 mm', toeslag: '+€0,08/stuk' },
                  ].map(f => (
                    <div key={f.id} onClick={() => updateWiz({ formaat: f.id })}
                      style={{
                        padding: '16px', border: `2px solid ${formaat === f.id ? 'var(--green)' : 'var(--line)'}`,
                        borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'center',
                        background: formaat === f.id ? 'var(--green-bg)' : 'var(--paper)',
                        transition: 'all 0.15s', position: 'relative',
                      }}>
                      {f.std && <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: 'var(--ink)', fontSize: '9px', fontWeight: 700, padding: '1px 8px', borderRadius: '2px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>STANDAARD</div>}
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '4px' }}>{f.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{f.afm}</div>
                      <div style={{ fontSize: '11px', color: formaat === f.id ? 'var(--green-dim)' : 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>{f.toeslag}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dubbelzijdig */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '14px', border: `1px solid ${dubbelzijdig ? 'var(--green)' : 'var(--line)'}`, borderRadius: 'var(--radius)', background: dubbelzijdig ? 'var(--green-bg)' : 'var(--paper)' }}>
                  <input type="checkbox" checked={dubbelzijdig} onChange={e => updateWiz({ dubbelzijdig: e.target.checked })} style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Dubbelzijdig</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>+€0,06 per flyer — achterkant voor extra info, kortingscode of kaart</div>
                  </div>
                </label>
              </div>

              {/* Offerte bij groot werkgebied */}
              {stats.estAdressenMaand >= 5000 && (
                <div style={{ background: 'var(--ink)', border: '1px solid rgba(0,232,122,0.3)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', marginBottom: '8px', letterSpacing: '0.08em' }}>
                    GROOT WERKGEBIED — MAATWERKTARIEF
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '12px', lineHeight: 1.6 }}>
                    Uw werkgebied bevat ~{stats.estAdressenMaand.toLocaleString('nl')} nieuwe bewoners per maand. Voor grotere gebieden maken we een maatwerkaanbod.
                  </div>
                  <a
                    href={`mailto:hallo@lokaalkabaal.nl?subject=Prijsverzoek groot werkgebied&body=Hallo,%0A%0AIk wil graag een offerte voor mijn werkgebied:%0A- Centrum: ${centrum}%0A- Straal: ${straal} km%0A- Branche: ${spec}%0A- Geschatte nieuwe bewoners/mnd: ${stats.estAdressenMaand}%0A%0AKunt u mij een aanbod sturen?`}
                    style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--green)', color: 'var(--ink)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                  >
                    Stuur prijsverzoek →
                  </a>
                </div>
              )}

              {/* Abonnementsoverzicht op basis van werkgebied */}
              <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
                  ABONNEMENT — {actualPc4Count} PC4-POSTCODE{actualPc4Count !== 1 ? 'S' : ''} IN UW WERKGEBIED
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>{abonnement.tier} ({abonnement.includedPc4s} PC4{abonnement.includedPc4s !== 1 ? 's' : ''} inbegrepen)</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPrijs(abonnement.base)}/mnd</span>
                  </div>
                  {abonnement.extraPc4s > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted)' }}>
                      <span>+ {abonnement.extraPc4s} extra postcode{abonnement.extraPc4s !== 1 ? 's' : ''} × €{ABONNEMENT_TIERS[2].extraPc4}/mnd</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPrijs(abonnement.extraKosten)}/mnd</span>
                    </div>
                  )}
                  <div style={{ height: '1px', background: 'var(--line)', margin: '2px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700 }}>Totaal per maand</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green)' }}>{formatPrijs(abonnement.total)}</span>
                  </div>
                </div>
                <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.2)', borderRadius: 'var(--radius)', padding: '10px 12px', fontSize: '12px', color: 'var(--ink)', lineHeight: 1.6 }}>
                  Alle nieuwe bewoners in uw {actualPc4Count} postcode{actualPc4Count !== 1 ? 's' : ''} zijn inbegrepen — geen limiet op het aantal flyers. Jaarcontract: 25% korting.
                </div>
              </div>
            </div>
          )}

          {/* STAP 6: Proef flyer + overzicht */}
          {step === 6 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>Controleer & proef flyer</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
                Bekijk je instellingen. Optioneel: stuur één proef flyer naar je eigen adres.
              </p>

              {/* Flyer kiezen */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>FLYER VOOR DEZE CAMPAGNE</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {flyers.map((f, i) => (
                    <button key={f.id} onClick={() => { setActiveFlyerIdx(i); updateWiz({ flyerIndex: i }); }}
                      style={{
                        padding: '8px 14px', border: `2px solid ${flyerIndex === i ? 'var(--green)' : 'var(--line)'}`,
                        borderRadius: 'var(--radius)', background: flyerIndex === i ? 'var(--green-bg)' : 'var(--paper)',
                        cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)',
                        fontWeight: flyerIndex === i ? 700 : 400, color: flyerIndex === i ? 'var(--green-dim)' : 'var(--ink)',
                      }}>
                      {f.naam}
                    </button>
                  ))}
                  <button onClick={() => setPage('flyer')}
                    style={{ padding: '8px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                    Bewerken →
                  </button>
                </div>
                <div ref={wizardFlyerRef} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <FlyerPreview flyer={flyer} formaat={formaat} />
                </div>
              </div>

              {/* Samenvatting */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {[
                  { l: 'Branche', v: spec || '—' },
                  { l: 'Startdatum', v: datum ? new Date(datum).toLocaleDateString('nl', { month: 'long', year: 'numeric' }) : '—' },
                  { l: 'Werkgebied', v: centrum ? `${centrum} · ${straal} km` : '—' },
                  { l: 'PC4-gebieden', v: wiz.pc4Lijst.length > 0 ? wiz.pc4Lijst.join(', ') : `~${stats.pc4Count} gebieden` },
                  { l: 'Formaat', v: `${formaat.toUpperCase()}${dubbelzijdig ? ' dubbelzijdig' : ' enkelvoudig'}` },
                  { l: 'Abonnement', v: `${abonnement.tier} · ${actualPc4Count} PC4s · ${formatPrijs(abonnement.total)}/mnd` },
                  { l: 'Bezorging', v: 'Elke 25e van de maand' },
                ].map(({ l, v }) => (
                  <div key={l} style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>{l.toUpperCase()}</div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Proef flyer */}
              <div style={{ border: `2px solid ${proefFlyer ? 'var(--green)' : 'var(--line)'}`, borderRadius: 'var(--radius)', padding: '20px', background: proefFlyer ? 'var(--green-bg)' : 'var(--paper)', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: proefFlyer ? '16px' : '0' }}>
                  <input type="checkbox" checked={proefFlyer} onChange={e => updateWiz({ proefFlyer: e.target.checked })} style={{ accentColor: 'var(--green)', width: '16px', height: '16px', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>Proef flyer thuis ontvangen (+€4,95 eenmalig)</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
                      Wij sturen 1 proef flyer naar jouw eigen adres. Zodra je hem hebt ontvangen, log je in op het dashboard en keur je de campagne goed — of pas je de flyer nog aan. Pas na jouw goedkeuring gaat de eerste echte verzending de deur uit.
                    </div>
                  </div>
                </label>
                {proefFlyer && (
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>JOUW ADRES (straat + huisnr + postcode + stad)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Kerkstraat 12, 3512 AB Utrecht"
                        value={proefAdres}
                        onChange={e => {
                          const val = e.target.value;
                          updateWiz({ proefAdres: val });
                          setAdresStatus('idle');
                          setAdresFeedback({});
                          if (adresTimerRef.current) clearTimeout(adresTimerRef.current);
                          if (val.length > 8) {
                            setAdresStatus('checking');
                            adresTimerRef.current = setTimeout(async () => {
                              try {
                                const r = await fetch(`/api/printone/validate?adres=${encodeURIComponent(val)}`);
                                const d = await r.json();
                                if (d.valid) {
                                  setAdresStatus('ok');
                                  setAdresFeedback({
                                    volledig: d.genormaliseerd?.volledig,
                                    adresRegel: d.genormaliseerd?.adresRegel,
                                    postcode: d.genormaliseerd?.postcode,
                                    stad: d.genormaliseerd?.stad,
                                  });
                                } else {
                                  setAdresStatus('error');
                                  setAdresFeedback({ error: d.error, suggesties: d.suggesties });
                                }
                              } catch {
                                setAdresStatus('idle');
                              }
                            }, 600);
                          }
                        }}
                        style={{
                          width: '100%', padding: '10px 36px 10px 12px',
                          border: `1px solid ${adresStatus === 'ok' ? 'var(--green)' : adresStatus === 'error' ? '#e74c3c' : 'var(--line)'}`,
                          borderRadius: 'var(--radius)', background: '#fff',
                          fontFamily: 'var(--font-mono)', boxSizing: 'border-box',
                        }}
                      />
                      {/* Status icon */}
                      <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>
                        {adresStatus === 'checking' && <span style={{ color: 'var(--muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>...</span>}
                        {adresStatus === 'ok' && <span style={{ color: 'var(--green)' }}>✓</span>}
                        {adresStatus === 'error' && <span style={{ color: '#e74c3c' }}>✗</span>}
                      </div>
                    </div>
                    {/* Feedback */}
                    {adresStatus === 'ok' && adresFeedback.volledig && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--green-dim)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>✓</span> Gevonden: {adresFeedback.volledig}
                      </div>
                    )}
                    {adresStatus === 'error' && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: '#e74c3c', fontFamily: 'var(--font-mono)' }}>
                        {adresFeedback.error || 'Adres niet herkend'}
                        {adresFeedback.suggesties && adresFeedback.suggesties.length > 0 && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ color: 'var(--muted)' }}>Bedoelde je: </span>
                            {adresFeedback.suggesties.map((s, i) => (
                              <button key={i} onClick={() => { updateWiz({ proefAdres: s }); setAdresStatus('idle'); setAdresFeedback({}); }}
                                style={{ display: 'block', background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer', color: '#e74c3c', textDecoration: 'underline', fontSize: '11px', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* E-mailadres voor Stripe */}
              <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>E-MAILADRES (voor betalingsbevestiging)</label>
                <input
                  type="email"
                  value={wiz.email ?? ''}
                  onChange={e => updateWiz({ email: e.target.value })}
                  placeholder="jouw@email.nl"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: '#fff', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }}
                />
              </div>

              {/* Totaal */}
              <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{abonnement.tier} abonnement · {actualPc4Count} PC4-postcodes ({formaat.toUpperCase()})</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{formatPrijs(prijs)}/mnd</span>
                </div>
                {proefFlyer && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Proef flyer (eenmalig)</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{formatPrijs(proefPrijs)}</span>
                  </div>
                )}
                <div style={{ height: '1px', background: 'var(--line)', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700 }}>Totaal eerste maand</span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green)' }}>{formatPrijs(totaal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STAP 7: Bevestiging */}
          {step === 7 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {proefFlyer ? (
                <>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '56px', color: 'var(--green)', marginBottom: '12px', lineHeight: 1 }}>✉</div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '8px' }}>Proef flyer onderweg!</h2>
                  <p style={{ color: 'var(--muted)', maxWidth: '420px', margin: '0 auto 8px', lineHeight: 1.6 }}>
                    Je proef flyer wordt verstuurd naar <strong>{proefAdres}</strong>. Verwacht hem binnen 2–4 werkdagen.
                  </p>
                  <div style={{ maxWidth: '420px', margin: '0 auto 20px', textAlign: 'left' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', textAlign: 'center' }}>WAT GEBEURT ER DAARNA?</div>
                    {[
                      { step: '1', text: 'Ontvang je proef flyer thuis in de bus' },
                      { step: '2', text: 'Log in op het dashboard en keur de flyer goed (of pas hem nog aan)' },
                      { step: '3', text: 'Na jouw goedkeuring gaat de echte campagne van start — flyers naar alle nieuwe bewoners in jouw werkgebied' },
                    ].map(s => (
                      <div key={s.step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--green)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, flexShrink: 0 }}>{s.step}</div>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, paddingTop: '2px' }}>{s.text}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: '11px', marginBottom: '20px', fontFamily: 'var(--font-mono)' }}>
                    Betaald: €4,95 incl. verzending · Campagne nog niet actief
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => setPage('dashboard')} style={{
                      padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)',
                      border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: 'pointer', fontSize: '14px'
                    }}>Naar dashboard →</button>
                    <button onClick={startNieuweCampagne} style={{
                      padding: '12px 24px', background: 'var(--paper)', color: 'var(--ink)',
                      border: '1px solid var(--line)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '14px'
                    }}>+ Nog een campagne</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '64px', color: 'var(--green)', marginBottom: '12px', lineHeight: 1 }}>€</div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '8px' }}>Betaal & activeer je campagne</h2>
                  <p style={{ color: 'var(--muted)', maxWidth: '420px', margin: '0 auto 8px', lineHeight: 1.6 }}>
                    Je flyers gaan elke maand op de <strong>25e</strong> de deur uit naar nieuwe bewoners in <strong>{centrum || 'jouw werkgebied'}</strong>. Op de 20e zie je hoeveel dat worden.
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px', fontFamily: 'var(--font-mono)' }}>
                    Eerste bezorging: {datum ? new Date(datum).toLocaleDateString('nl', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} · Betaling via Stripe
                  </p>
                  <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px', maxWidth: '420px', margin: '0 auto 20px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{abonnement.tier} · {actualPc4Count} PC4-postcodes · alle bewoners inbegrepen</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{formatPrijs(prijs)}/mnd</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      Vaste maandprijs — geen verassingen. Factuur op de 1e v/d maand.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={async () => {
                        setOrderLoading(true);
                        setOrderError('');
                        try {
                          const res = await fetch('/api/stripe/checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              maxFlyers: aantalFlyers,
                              formaat,
                              dubbelzijdig,
                              spec,
                              datum,
                              centrum,
                              email: wiz.email || 'klant@lokaalkabaal.nl',
                              bedrijfsnaam: flyer.bedrijfsnaam || 'Klant',
                            }),
                          });
                          const data = await res.json();
                          if (data.url) {
                            window.location.href = data.url;
                          } else {
                            setOrderError(data.error || 'Stripe checkout mislukt');
                          }
                        } catch {
                          setOrderError('Verbindingsfout — probeer opnieuw');
                        } finally {
                          setOrderLoading(false);
                        }
                      }}
                      disabled={orderLoading}
                      style={{
                        padding: '14px 32px', background: orderLoading ? 'var(--line)' : 'var(--ink)', color: orderLoading ? 'var(--muted)' : 'var(--paper)',
                        border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: orderLoading ? 'not-allowed' : 'pointer', fontSize: '15px'
                      }}>
                      {orderLoading ? 'Laden...' : 'Betalen via Stripe →'}
                    </button>
                    <button onClick={startNieuweCampagne} style={{
                      padding: '14px 24px', background: 'var(--paper)', color: 'var(--ink)',
                      border: '1px solid var(--line)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '14px'
                    }}>Annuleren</button>
                  </div>
                  {orderError && <div style={{ marginTop: '12px', fontSize: '12px', color: '#c0392b', fontFamily: 'var(--font-mono)' }}>✗ {orderError}</div>}
                </>
              )}
            </div>
          )}
        </div>

        </div>{/* end scrollable content */}

        {/* Nav knoppen — pinned to bottom */}
        {step < 7 && (
          <div style={{ flexShrink: 0, borderTop: '1px solid var(--line)', background: 'var(--paper)', padding: '12px 24px' }}>
          {orderError && (
            <div style={{ marginBottom: '10px', padding: '10px 14px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 'var(--radius)', fontSize: '12px', color: '#c0392b', fontFamily: 'var(--font-mono)' }}>
              ✗ {orderError}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => step > 1 ? updateWiz({ step: step - 1 }) : setPage('dashboard')}
              style={{ padding: '10px 20px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)', cursor: 'pointer', fontSize: '13px' }}>
              {step === 1 ? 'Annuleren' : '← Terug'}
            </button>
            <button
              disabled={!canNext || orderLoading}
              onClick={async () => {
                if (step === 6 && proefFlyer) {
                  setOrderLoading(true);
                  setOrderError('');
                  try {
                    // Capture flyer HTML from rendered preview
                    const flyerHtml = wizardFlyerRef.current
                      ? `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:sans-serif}</style></head><body>${wizardFlyerRef.current.innerHTML}</body></html>`
                      : '<html><body><p>Flyer</p></body></html>';

                    // Parse normalized address from BAG validation
                    const adresRegel = adresFeedback.adresRegel || proefAdres.split(',')[0].trim();
                    const postcode = adresFeedback.postcode || '';
                    const stad = adresFeedback.stad || '';

                    const res = await fetch('/api/printone', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        flyerHtml,
                        formaat,
                        finish: 'GLOSSY',
                        recipient: {
                          name: flyer.bedrijfsnaam || 'Klant',
                          address: adresRegel,
                          city: stad,
                          postalCode: postcode,
                          country: 'NL',
                        },
                        sender: {
                          name: 'LokaalKabaal',
                          address: 'Keizersgracht 1',
                          city: 'Amsterdam',
                          postalCode: '1015CN',
                          country: 'NL',
                        },
                        templateNaam: `Proef – ${flyer.bedrijfsnaam || 'LokaalKabaal'} – ${new Date().toISOString().slice(0, 10)}`,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      setOrderError(data.error || 'Bestelling mislukt');
                      setOrderLoading(false);
                      return;
                    }
                    setPendingCampaign({ spec, datum, centrum, aantalFlyers, formaat, dubbelzijdig, maxBudget: berekenPrijs(aantalFlyers, formaat, dubbelzijdig), proefAdres });
                    updateWiz({ step: step + 1 });
                  } catch {
                    setOrderError('Verbindingsfout — probeer opnieuw');
                  } finally {
                    setOrderLoading(false);
                  }
                } else {
                  updateWiz({ step: step + 1 });
                }
              }}
              style={{
                padding: '10px 24px', background: (canNext && !orderLoading) ? 'var(--ink)' : 'var(--line)',
                color: (canNext && !orderLoading) ? 'var(--paper)' : 'var(--muted)', border: 'none',
                borderRadius: 'var(--radius)', cursor: (canNext && !orderLoading) ? 'pointer' : 'not-allowed',
                fontWeight: 700, fontSize: '13px', transition: 'all 0.15s'
              }}>
              {orderLoading ? 'Bestelling plaatsen…' : step === 6 ? (proefFlyer ? 'Proef bestellen — €4,95 →' : 'Campagne activeren →') : 'Volgende →'}
            </button>
          </div>
          </div>
        )}
      </div>
    );
  }

  function renderFlyer() {
    return (
      <div className="fade-in">
        {/* Pending campagne banner */}
        {pendingCampaign && (
          <div style={{
            background: 'var(--green-bg)', border: '2px solid var(--green)', borderRadius: 'var(--radius)',
            padding: '14px 20px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', fontWeight: 700, marginBottom: '2px' }}>
                CAMPAGNE WACHT OP JOUW GOEDKEURING
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink)' }}>
                {pendingCampaign.spec} · {pendingCampaign.aantalFlyers.toLocaleString('nl')} flyers/mnd · start {pendingCampaign.datum ? new Date(pendingCampaign.datum).toLocaleDateString('nl', { month: 'long', year: 'numeric' }) : '—'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => { setPage('dashboard'); }}
                style={{ padding: '8px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)', cursor: 'pointer', fontSize: '12px' }}>
                ← Terug
              </button>
              <button onClick={() => { setPendingCampaign(null); setPage('dashboard'); }}
                style={{ padding: '8px 16px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
                Campagne goedkeuren →
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '4px' }}>Mijn flyers</h1>
            <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              Maak tot 3 flyers aan en kies per campagne welke je gebruikt.
            </p>
          </div>
          {flyers.length < 3 && (
            <button
              onClick={() => {
                const newId = Date.now();
                const newFlyer: SavedFlyer = { ...INIT_FLYER, naam: `Flyer ${flyers.length + 1}`, id: newId };
                setFlyers(fs => [...fs, newFlyer]);
                setActiveFlyerIdx(flyers.length);
              }}
              style={{ padding: '8px 16px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
              + Nieuwe flyer
            </button>
          )}
        </div>

        {/* Flyer tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {flyers.map((f, i) => (
            <button key={f.id} onClick={() => setActiveFlyerIdx(i)}
              style={{
                padding: '7px 14px', border: `2px solid ${activeFlyerIdx === i ? 'var(--green)' : 'var(--line)'}`,
                borderRadius: 'var(--radius)', background: activeFlyerIdx === i ? 'var(--green-bg)' : 'var(--paper)',
                cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)',
                fontWeight: activeFlyerIdx === i ? 700 : 400, color: activeFlyerIdx === i ? 'var(--green-dim)' : 'var(--ink)',
              }}>
              {f.naam}
              {flyers.length > 1 && (
                <span
                  onClick={e => { e.stopPropagation(); if (flyers.length > 1) { setFlyers(fs => fs.filter((_, idx) => idx !== i)); setActiveFlyerIdx(0); } }}
                  style={{ marginLeft: '8px', color: 'var(--muted)', fontWeight: 400, cursor: 'pointer' }}>×</span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Design kiezen */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px' }}>Design</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>9 professionele stijlen — kies wat bij jou past</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {([
                  { id: 'editorial' as const, label: 'Editorial', sub: 'Magazine-stijl' },
                  { id: 'geometric' as const, label: 'Geometric', sub: 'Bold & modern' },
                  { id: 'minimal' as const, label: 'Minimal', sub: 'Luxury & clean' },
                  { id: 'bold' as const, label: 'Bold', sub: 'Foto centraal' },
                  { id: 'retro' as const, label: 'Retro', sub: 'Vintage poster' },
                  { id: 'warm' as const, label: 'Warm', sub: 'Buurt & sfeer' },
                  { id: 'neon' as const, label: 'Neon', sub: 'Dark & glowing' },
                  { id: 'corporate' as const, label: 'Corporate', sub: 'Professioneel' },
                  { id: 'playful' as const, label: 'Playful', sub: 'Fun & rondes' },
                ] as { id: FlyerState['design']; label: string; sub: string }[]).map(d => (
                  <button key={d.id} onClick={() => {
                    updateFlyer({ design: d.id });
                  }}
                    style={{
                      padding: '10px 6px', border: `2px solid ${flyer.design === d.id ? 'var(--green)' : 'var(--line)'}`,
                      borderRadius: 'var(--radius)', background: flyer.design === d.id ? 'var(--green-bg)' : 'var(--paper)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: flyer.design === d.id ? 'var(--green-dim)' : 'var(--ink)', marginBottom: '2px' }}>{d.label}</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{d.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Website scan */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px' }}>Website scan</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>Voer je website in — wij halen automatisch je merkstijl op</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="www.jouwwebsite.nl"
                  value={flyer.websiteUrl}
                  onChange={e => updateFlyer({ websiteUrl: e.target.value })}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)' }}
                />
                <button onClick={scanWebsite} disabled={scanLoading || !flyer.websiteUrl}
                  style={{
                    padding: '8px 14px', background: 'var(--ink)', color: 'var(--paper)',
                    border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
                    fontSize: '12px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
                    opacity: (!flyer.websiteUrl || scanLoading) ? 0.5 : 1
                  }}>
                  {scanLoading ? 'Scannen...' : 'Scan →'}
                </button>
              </div>
              {scanMsg && (
                <div style={{
                  marginTop: '8px', padding: '10px 12px', borderRadius: 'var(--radius)',
                  fontSize: '12px', fontFamily: 'var(--font-mono)', lineHeight: 1.6,
                  background: scanMsg.includes('mislukt') || scanMsg.includes('blokkeert') || scanMsg.includes('niet bereikbaar') || scanMsg.includes('niet uitgelezen')
                    ? 'rgba(255,80,80,0.07)' : 'var(--green-bg)',
                  border: scanMsg.includes('mislukt') || scanMsg.includes('blokkeert') || scanMsg.includes('niet bereikbaar') || scanMsg.includes('niet uitgelezen')
                    ? '1px solid rgba(255,80,80,0.25)' : '1px solid rgba(0,232,122,0.25)',
                  color: scanMsg.includes('mislukt') || scanMsg.includes('blokkeert') || scanMsg.includes('niet bereikbaar') || scanMsg.includes('niet uitgelezen')
                    ? '#c0392b' : 'var(--green-dim)',
                }}>
                  {scanMsg}
                </div>
              )}
            </div>

            {/* Kleuren */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '12px' }}>Kleuren</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'ACHTERGROND', field: 'kleur' as const },
                  { label: 'ACCENT', field: 'accent' as const },
                ].map(({ label, field }) => (
                  <label key={field}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>{label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="color" value={flyer[field] as string} onChange={e => updateFlyer({ [field]: e.target.value })}
                        style={{ width: '40px', height: '36px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', cursor: 'pointer', padding: '2px' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{flyer[field] as string}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Bedrijfsgegevens */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '12px' }}>Bedrijfsgegevens</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { field: 'bedrijfsnaam' as const, label: 'Bedrijfsnaam', ph: 'Jouw Bedrijf' },
                  { field: 'slogan' as const, label: 'Slogan', ph: 'Jouw tagline hier' },
                  { field: 'telefoon' as const, label: 'Telefoon', ph: '010-1234567' },
                  { field: 'email' as const, label: 'E-mail', ph: 'info@jouwbedrijf.nl' },
                  { field: 'website' as const, label: 'Website', ph: 'www.jouwbedrijf.nl' },
                ].map(({ field, label, ph }) => (
                  <div key={field}>
                    <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>{label.toUpperCase()}</label>
                    <input
                      value={flyer[field] as string}
                      onChange={e => updateFlyer({ [field]: e.target.value })}
                      placeholder={ph}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* USPs */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '12px' }}>USP&apos;s</div>
              <textarea
                value={flyer.usp}
                onChange={e => updateFlyer({ usp: e.target.value })}
                placeholder={'Gratis eerste consult\nLokaal & betrouwbaar\n10% welkomstkorting'}
                rows={4}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: '13px', boxSizing: 'border-box' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                Eén USP per regel (max 3 getoond)
              </div>
            </div>

            {/* AI Tekst */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>Flyertekst</div>
                <button onClick={generateAI} disabled={aiLoading}
                  style={{ padding: '6px 14px', background: 'var(--green)', color: 'var(--ink)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '12px', fontWeight: 700, opacity: aiLoading ? 0.6 : 1, fontFamily: 'var(--font-mono)' }}>
                  {aiLoading ? 'AI schrijft...' : '✦ AI genereren'}
                </button>
              </div>
              <textarea
                value={flyer.tekst}
                onChange={e => updateFlyer({ tekst: e.target.value })}
                placeholder="Klik op 'AI genereren' of schrijf je eigen tekst..."
                rows={5}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {/* QR-code plaatsing */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px' }}>QR-code plaatsing</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>Kies op welke kant de QR-code verschijnt</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {([
                  { id: 'achter' as const, label: 'Achter', sub: 'Standaard' },
                  { id: 'voor' as const, label: 'Voor', sub: 'Op voorkant' },
                  { id: 'beide' as const, label: 'Beide', sub: 'Voor + achter' },
                ] as { id: FlyerState['qrPlaats']; label: string; sub: string }[]).map(opt => (
                  <button key={opt.id} onClick={() => updateFlyer({ qrPlaats: opt.id })}
                    style={{
                      padding: '10px 6px', border: `2px solid ${flyer.qrPlaats === opt.id ? 'var(--green)' : 'var(--line)'}`,
                      borderRadius: 'var(--radius)', background: flyer.qrPlaats === opt.id ? 'var(--green-bg)' : 'var(--paper)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: flyer.qrPlaats === opt.id ? 'var(--green-dim)' : 'var(--ink)', marginBottom: '2px' }}>{opt.label}</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Achterkant inhoud */}
            <div style={{ background: 'var(--white)', border: `2px solid ${flyer.dubbelzijdig ? 'var(--green)' : 'var(--line)'}`, borderRadius: 'var(--radius)', padding: '20px', opacity: flyer.dubbelzijdig ? 1 : 0.5, transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>Achterkant</div>
                  {flyer.dubbelzijdig && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', background: 'var(--green)', color: 'var(--ink)', padding: '1px 6px', borderRadius: '2px', fontWeight: 700 }}>ACTIEF</span>}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={flyer.dubbelzijdig} onChange={e => { updateFlyer({ dubbelzijdig: e.target.checked }); if (!e.target.checked) setPreviewSide('voor'); }} style={{ accentColor: 'var(--green)' }} />
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: flyer.dubbelzijdig ? 'var(--green-dim)' : 'var(--muted)' }}>Dubbelzijdig (+€0,06/stuk)</span>
                </label>
              </div>
              {!flyer.dubbelzijdig ? (
                <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', padding: '12px 0' }}>
                  Zet dubbelzijdig aan om de achterkant te ontwerpen — perfect voor openingstijden, contact en een QR-code.
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
                    Contact- en locatiegegevens voor de achterkant van je flyer
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>ADRES (verschijnt op achterkant)</label>
                      <input
                        value={flyer.adres}
                        onChange={e => updateFlyer({ adres: e.target.value })}
                        placeholder="Kerkstraat 12, 3512 AB Utrecht"
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>OPENINGSTIJDEN (één per regel)</label>
                      <textarea
                        value={flyer.openingstijden}
                        onChange={e => updateFlyer({ openingstijden: e.target.value })}
                        placeholder={'Ma–Vr 09:00–18:00\nZa 10:00–17:00\nZo gesloten'}
                        rows={3}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>ACHTERKANT TEKST (slogan of aanbieding)</label>
                      <textarea
                        value={flyer.backTekst}
                        onChange={e => updateFlyer({ backTekst: e.target.value })}
                        placeholder="Vragen? Wij helpen je graag verder. Kom langs of bel ons!"
                        rows={2}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Foto */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px' }}>Foto</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>Hoofdafbeelding op je flyer — sleep in de preview om te herpositioneren</div>
              <input ref={heroRef} type="file" accept="image/*" onChange={handleHeroUpload} style={{ display: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                {flyer.heroImageUrl ? (
                  <img src={flyer.heroImageUrl} alt="hero" style={{ width: '72px', height: '54px', objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }} />
                ) : (
                  <div style={{ width: '72px', height: '54px', border: '2px dashed var(--line)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '22px', flexShrink: 0 }}>+</div>
                )}
                <div>
                  <button onClick={() => heroRef.current?.click()} style={{ padding: '8px 16px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)', cursor: 'pointer', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                    {flyer.heroImageUrl ? 'Andere foto' : 'Upload foto'}
                  </button>
                  {flyer.heroImageUrl && (
                    <button onClick={() => updateFlyer({ heroImageUrl: null })} style={{ fontSize: '12px', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>Verwijderen</button>
                  )}
                </div>
              </div>
              {flyer.heroImageUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>AFBEELDINGSGROOTTE</label>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', fontWeight: 700 }}>{flyer.heroScale ?? 100}%</span>
                    </div>
                    <input
                      type="range" min={50} max={200} step={5}
                      value={flyer.heroScale ?? 100}
                      onChange={e => updateFlyer({ heroScale: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: 'var(--green)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      <span>50%</span><span>200%</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>LINKS–RECHTS</label>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', fontWeight: 700 }}>{flyer.heroOffsetX}%</span>
                      </div>
                      <input
                        type="range" min={0} max={100} step={1}
                        value={flyer.heroOffsetX}
                        onChange={e => updateFlyer({ heroOffsetX: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--green)' }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>BOVEN–ONDER</label>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', fontWeight: 700 }}>{flyer.heroOffsetY}%</span>
                      </div>
                      <input
                        type="range" min={0} max={100} step={1}
                        value={flyer.heroOffsetY}
                        onChange={e => updateFlyer({ heroOffsetY: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--green)' }}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    Tip: je kunt ook direct in de preview slepen om de positie aan te passen.
                  </div>
                </div>
              )}
            </div>

            {/* Logo */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '12px' }}>Logo</div>
              <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {flyer.logoData ? (
                  <AdaptiveLogo src={flyer.logoData} baseSize={60} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '4px' }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', border: '2px dashed var(--line)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '20px' }}>+</div>
                )}
                <div>
                  <button onClick={() => logoRef.current?.click()} style={{ padding: '8px 16px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)', cursor: 'pointer', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Upload logo</button>
                  {flyer.logoData && (
                    <button onClick={() => updateFlyer({ logoData: null })} style={{ fontSize: '12px', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>Verwijderen</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>Preview</div>
            {/* Voor/Achter tabs — only when dubbelzijdig */}
            {flyer.dubbelzijdig && (
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['voor', 'achter'] as const).map(side => (
                  <button key={side} onClick={() => setPreviewSide(side)}
                    style={{
                      flex: 1, padding: '6px', border: `2px solid ${previewSide === side ? 'var(--green)' : 'var(--line)'}`,
                      borderRadius: 'var(--radius)', background: previewSide === side ? 'var(--green-bg)' : 'var(--paper)',
                      cursor: 'pointer', fontSize: '11px', fontFamily: 'var(--font-mono)',
                      fontWeight: previewSide === side ? 700 : 400,
                      color: previewSide === side ? 'var(--green-dim)' : 'var(--muted)',
                    }}>
                    {side === 'voor' ? '▣ Voorkant' : '▤ Achterkant'}
                  </button>
                ))}
              </div>
            )}
            {/* Flyer preview */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div ref={flyerPreviewRef}>
                {(!flyer.dubbelzijdig || previewSide === 'voor')
                  ? <FlyerPreview flyer={flyer} formaat={(flyer.afmeting as 'a6' | 'a5' | 'a4') || 'a5'} onHeroOffsetChange={(x, y) => updateFlyer({ heroOffsetX: x, heroOffsetY: y })} />
                  : <FlyerBackPreview flyer={flyer} formaat={(flyer.afmeting as 'a6' | 'a5' | 'a4') || 'a5'} />
                }
              </div>
              {/* Safe zone overlay */}
              <div style={{
                position: 'absolute', inset: '6px', border: '1px dashed rgba(0,232,122,0.35)',
                borderRadius: '4px', pointerEvents: 'none',
              }} title="Veiligheidszone (3mm van snijrand)" />
            </div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', display: 'flex', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '1px', borderTop: '1px dashed #00E87A' }} />
                Veiligheidszone
              </span>
            </div>
            <div style={{ padding: '10px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>FORMAAT</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['a6', 'a5', 'a4'] as const).map(f => (
                  <button key={f} onClick={() => updateFlyer({ afmeting: f })}
                    style={{ padding: '4px 10px', border: `1px solid ${flyer.afmeting === f ? 'var(--green)' : 'var(--line)'}`, borderRadius: 'var(--radius)', background: flyer.afmeting === f ? 'var(--green-bg)' : 'var(--paper)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: flyer.afmeting === f ? 700 : 400, color: flyer.afmeting === f ? 'var(--green-dim)' : 'var(--ink)' }}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <FlyerExport
              flyerRef={flyerPreviewRef}
              formaat={(flyer.afmeting as 'a6' | 'a5' | 'a4') || 'a5'}
              bedrijfsnaam={flyer.bedrijfsnaam || 'flyer'}
            />
            {flyer.pdfUrl && (
              <a
                href={flyer.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', width: '100%', padding: '10px',
                  background: 'var(--green-bg)', color: 'var(--green-dim)',
                  border: '1px solid rgba(0,232,122,0.3)', borderRadius: 'var(--radius)',
                  fontWeight: 700, fontSize: '12px', textAlign: 'center',
                  textDecoration: 'none', fontFamily: 'var(--font-mono)', boxSizing: 'border-box',
                }}
              >
                ↓ Print-ready PDF downloaden
              </a>
            )}
            <button onClick={() => setPage('wizard')} style={{ width: '100%', padding: '12px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Campagne starten →</button>
          </div>
        </div>
      </div>
    );
  }

  function renderConversies() {
    return <ConversiesDashboard campaigns={campaigns} onStartCampagne={() => setPage('wizard')} />;
  }

  function renderCredits() {
    return (
      <div className="fade-in">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '4px' }}>Resterende flyers</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '20px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          Credits zijn niet-verzonden flyers uit betaalde campagnes — bijvoorbeeld bij een geannuleerde of aangepaste maand.
        </p>

        <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--ink)' }}>Wat zijn credits?</strong> Als je een campagne annuleert of aanpast nadat flyers al zijn betaald maar nog niet verzonden, worden de resterende exemplaren bijgeschreven als credits. Die kun je inzetten voor een volgende campagne.
        </div>

        {/* Empty state */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', color: 'var(--line)', marginBottom: '12px' }}>0</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '6px' }}>Geen resterende flyers</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '360px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            Je hebt momenteel geen credits. Credits verschijnen hier automatisch als je een campagne aanpast of annuleert na betaling.
          </div>
          <button onClick={() => setPage('wizard')} style={{ padding: '10px 24px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
            Campagne starten →
          </button>
        </div>
      </div>
    );
  }

  function renderProfiel() {
    return (
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '4px' }}>Mijn profiel</h1>
            <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Beheer je bedrijfsgegevens en instellingen</p>
          </div>
          <button
            onClick={() => { setDemoStep(0); setSpotlightEl(null); setShowDemo(true); }}
            style={{ padding: '8px 16px', background: 'var(--green)', color: 'var(--ink)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '12px', fontFamily: 'var(--font-mono)' }}
          >
            ▶ Product demo
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Bedrijfsgegevens */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px' }}>Bedrijfsgegevens</div>
            {[
              { label: 'Bedrijfsnaam', ph: 'Jouw Bedrijf BV' },
              { label: 'KVK-nummer', ph: '12345678' },
              { label: 'Adres', ph: 'Straatnaam 1' },
              { label: 'Postcode', ph: '1234 AB' },
              { label: 'Stad', ph: 'Amsterdam' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>{f.label.toUpperCase()}</label>
                <input placeholder={f.ph} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', boxSizing: 'border-box' as const }} />
              </div>
            ))}
            <button style={{ padding: '10px 20px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Opslaan</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Facturatie */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '4px' }}>Facturatie</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>Facturen worden automatisch verstuurd op de 25e van de maand</div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>BTW-NUMMER</label>
                <input placeholder="NL000000000B01" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', boxSizing: 'border-box' as const }} />
              </div>
              <div style={{ marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '8px' }}>FACTUUR-EMAILS (max. 3)</label>
                {[1, 2, 3].map(n => (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{n}</div>
                    <input
                      type="email"
                      placeholder={n === 1 ? 'factuur@jouwbedrijf.nl' : n === 2 ? 'boekhouder@kantoor.nl (optioneel)' : 'extra@email.nl (optioneel)'}
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', fontSize: '13px', boxSizing: 'border-box' as const }}
                    />
                  </div>
                ))}
              </div>
              <button style={{ padding: '10px 20px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', marginTop: '8px' }}>Opslaan</button>
            </div>

            {/* Wachtwoord */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px' }}>Wachtwoord</div>
              {['Huidig wachtwoord', 'Nieuw wachtwoord', 'Bevestig wachtwoord'].map(f => (
                <div key={f} style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>{f.toUpperCase()}</label>
                  <input type="password" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', boxSizing: 'border-box' as const }} />
                </div>
              ))}
              <button style={{ padding: '10px 20px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Wachtwoord wijzigen</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Shell ──

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--paper)' }}>
      {/* Sidebar */}
      <nav style={{
        width: 'var(--sidebar)', flexShrink: 0, background: 'var(--ink)',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--paper)', fontStyle: 'italic', lineHeight: 1.1 }}>
            Lokaal<br /><span style={{ color: 'var(--green)' }}>Kabaal</span>
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            nieuwe bewoners → vaste klanten
          </div>
        </div>
        <div style={{ flex: 1, padding: '8px 0' }}>
          {navItems.map(({ id, label, icon }) => (
            <button key={id} data-tour={`tour-nav-${id}`} onClick={() => setPage(id)}
              style={{
                width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                background: page === id ? 'rgba(255,255,255,0.06)' : 'none',
                borderLeft: page === id ? '2px solid var(--green)' : '2px solid transparent',
                border: 'none', borderRight: 'none',
                color: page === id ? 'var(--paper)' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontFamily: 'var(--font-sans)',
                fontWeight: page === id ? 600 : 400, transition: 'all 0.15s'
              }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: page === id ? 'var(--green)' : 'rgba(255,255,255,0.3)' }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '28px', height: '28px', background: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', color: 'var(--ink)', flexShrink: 0 }}>
              {(user?.naam || 'G')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: 'var(--paper)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.naam || 'Gebruiker'}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
            </div>
          </div>
          <button onClick={uitloggen} style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.2)', borderRadius: 'var(--radius)', color: 'rgba(255,100,100,0.8)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>
            ← Uitloggen
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, overflowY: page === 'wizard' ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 'var(--topbar)', flexShrink: 0, background: 'var(--white)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontStyle: 'italic', color: 'var(--muted)' }}>
            {page === 'dashboard' && 'Overzicht'}
            {page === 'wizard' && 'Nieuwe campagne'}
            {page === 'flyer' && 'Flyer editor'}
            {page === 'conversies' && 'Conversies & ROI'}
            {page === 'credits' && 'Credits & abonnementen'}
            {page === 'profiel' && 'Mijn profiel'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>3 credits</span>
            <div style={{ width: '28px', height: '28px', background: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', color: 'var(--ink)' }}>
              {(user?.naam || 'G')[0].toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '24px', maxWidth: '1200px', width: '100%', margin: '0 auto', alignSelf: 'stretch', boxSizing: 'border-box' }}>
          {page === 'dashboard' && renderDashboard()}
          {page === 'wizard' && renderWizard()}
          {page === 'flyer' && renderFlyer()}
          {page === 'conversies' && renderConversies()}
          {page === 'credits' && renderCredits()}
          {page === 'profiel' && renderProfiel()}
        </div>
      </main>

      {/* Spotlight tour */}
      {showDemo && (() => {
        const TOUR = getTourSteps();
        const step = TOUR[demoStep];
        if (!step) return null;
        const isLast = demoStep === TOUR.length - 1;

        const pad = 8;
        const tooltipWidth = 280;
        const tooltipLeft = spotlightEl
          ? (spotlightEl.left < 320 ? spotlightEl.left + spotlightEl.width + 16 : Math.min(spotlightEl.left, window.innerWidth - tooltipWidth - 16))
          : 0;
        const tooltipTop = spotlightEl
          ? (spotlightEl.left < 320 ? spotlightEl.top : spotlightEl.top + spotlightEl.height + 14)
          : 0;

        return (
          <>
            {/* Dark overlay */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.72)', pointerEvents: 'all' }}
              onClick={() => { localStorage.setItem('lk_demo_done', '1'); setShowDemo(false); setSpotlightEl(null); }}
            />

            {/* Spotlight box (above overlay) */}
            {spotlightEl && (
              <div style={{
                position: 'fixed',
                top: spotlightEl.top - pad,
                left: spotlightEl.left - pad,
                width: spotlightEl.width + pad * 2,
                height: spotlightEl.height + pad * 2,
                borderRadius: '8px',
                border: '2px solid var(--green)',
                boxShadow: '0 0 0 2px rgba(0,232,122,0.2), 0 0 20px rgba(0,232,122,0.15)',
                zIndex: 9001,
                pointerEvents: 'none',
              }} />
            )}

            {/* Tooltip / modal */}
            {spotlightEl ? (
              <div style={{
                position: 'fixed',
                top: tooltipTop,
                left: tooltipLeft,
                width: tooltipWidth,
                zIndex: 9002,
                background: 'var(--white)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                pointerEvents: 'all',
              }}>
                {/* Arrow indicator */}
                <div style={{ width: '28px', height: '3px', background: 'var(--green)', borderRadius: '2px', marginBottom: '10px' }} />
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '8px', color: 'var(--ink)' }}>{step.titel}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '16px' }}>{step.tekst}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {TOUR.map((_, i) => (
                      <div key={i} style={{ width: i === demoStep ? '16px' : '6px', height: '6px', borderRadius: '3px', background: i === demoStep ? 'var(--green)' : 'var(--line)', transition: 'width 0.2s' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { localStorage.setItem('lk_demo_done', '1'); setShowDemo(false); setSpotlightEl(null); }} style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                      Stoppen
                    </button>
                    <button onClick={() => {
                      if (isLast) { localStorage.setItem('lk_demo_done', '1'); setShowDemo(false); setSpotlightEl(null); setPage('wizard'); }
                      else setDemoStep(s => s + 1);
                    }} style={{ padding: '6px 14px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
                      {isLast ? 'Start campagne →' : 'Volgende →'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Full-screen welcome/conclusion card */
              <div style={{
                position: 'fixed', inset: 0, zIndex: 9002,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <div style={{
                  background: 'var(--white)', borderRadius: '16px', padding: '40px',
                  maxWidth: '440px', width: '100%', margin: '20px',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.4)', pointerEvents: 'all',
                  position: 'relative',
                }}>
                  <button onClick={() => { localStorage.setItem('lk_demo_done', '1'); setShowDemo(false); setSpotlightEl(null); }} style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--muted)' }}>×</button>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '28px' }}>
                    {TOUR.map((_, i) => (
                      <div key={i} style={{ height: '3px', flex: 1, borderRadius: '2px', background: i <= demoStep ? 'var(--green)' : 'var(--line)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '10px', lineHeight: 1.2 }}>{step.titel}</div>
                  <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>{step.tekst}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => { localStorage.setItem('lk_demo_done', '1'); setShowDemo(false); setSpotlightEl(null); }} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>Overslaan</button>
                    <button onClick={() => {
                      if (isLast) { localStorage.setItem('lk_demo_done', '1'); setShowDemo(false); setSpotlightEl(null); setPage('wizard'); }
                      else setDemoStep(s => s + 1);
                    }} style={{ padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                      {isLast ? 'Start mijn campagne →' : 'Laten we beginnen →'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
