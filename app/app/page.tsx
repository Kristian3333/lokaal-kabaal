'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import FlyerExport from '../../components/FlyerExport';

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

const FLYER_TEMPLATES = [
  {
    id: 'koffie',
    label: 'Koffiebar',
    icon: '☕',
    kleur: '#1C0F0A',
    accent: '#E8A020',
    bedrijfsnaam: 'Koffiehuis de Hoek',
    slogan: 'Elke dag vers.',
    tekst: 'Net ingetrokken? Welkom in de buurt! Kom kennismaken en geniet van de beste koffie in de wijk. Bij een besteding van €20 of meer, krijg jij €5 korting. Onze barista staat voor je klaar.',
    usp: '€5 welkomstkorting bij €20\nVers gezette specialty koffie\nJe nieuwe stamkroeg'
  },
  {
    id: 'meubel',
    label: 'Meubelwinkel',
    icon: '🛋️',
    kleur: '#14213D',
    accent: '#C8A97E',
    bedrijfsnaam: 'Wonen & Zo',
    slogan: 'Jouw thuis, jouw stijl.',
    tekst: 'Een nieuw huis verdient een nieuw begin. Als nieuwe bewoner krijg je 10% welkomstkorting op je eerste aankoop. Kom langs en laat je verrassen door onze collectie — van bank tot slaapkamer.',
    usp: '10% welkomstkorting\nGrote showroom, altijd open\nGratis levering binnen de regio'
  },
  {
    id: 'stucadoor',
    label: 'Stucadoor',
    icon: '🔨',
    kleur: '#0D0D0D',
    accent: '#FF6B35',
    bedrijfsnaam: 'StucPro Regio',
    slogan: 'Strak. Snel. Lokaal.',
    tekst: 'Nieuwe woning, nieuwe muren. Of je nu wil stucen, schilderen of verbouwen — wij zijn dé vakman in jouw regio. Snel, netjes en eerlijke prijs. Vraag vrijblijvend een gratis offerte aan.',
    usp: 'Gratis offerte aan huis\nLokale vakman, kort op de bal\nBinnen 2 weken op locatie'
  },
];

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
  const base = aantalFlyers >= 1000 ? 0.39 : aantalFlyers >= 500 ? 0.49 : 0.59;
  const formaatExtra = formaat === 'a4' ? 0.08 : formaat === 'a6' ? -0.05 : 0;
  const dubbelExtra = dubbelzijdig ? 0.06 : 0;
  return aantalFlyers * (base + formaatExtra + dubbelExtra);
}

function formatPrijs(x: number): string {
  return '€' + x.toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  design: 'editorial' | 'geometric' | 'minimal';
  heroImageUrl: string | null;
  headline: string;
  cta: string;
  pdfUrl: string | null;
}

type Page = 'dashboard' | 'wizard' | 'flyer' | 'credits' | 'profiel';

// ─── Flyer Preview — 3 premium designs ───────────────────────────────────────

function FlyerPreview({ flyer }: { flyer: FlyerState }) {
  const usps = flyer.usp ? flyer.usp.split('\n').filter(Boolean).slice(0, 3) : [];
  const naam = flyer.bedrijfsnaam || 'Jouw Bedrijfsnaam';
  const tekst = flyer.tekst || 'Wij heten je van harte welkom als nieuwe bewoner. Kom eens langs en ontdek wat wij voor jou kunnen betekenen in de buurt.';
  const initials = naam.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();

  const base: React.CSSProperties = {
    width: '240px', height: '340px', borderRadius: '8px', overflow: 'hidden',
    position: 'relative', flexShrink: 0, fontFamily: 'var(--font-sans)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
  };

  // ── Design 1: EDITORIAL (magazine split-layout) ──────────────────────────
  if (flyer.design === 'editorial') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    return (
      <div style={{ ...base, background: flyer.kleur }}>
        {/* Left color stripe */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: flyer.accent }} />
        {/* Top section */}
        <div style={{ padding: '20px 18px 0 20px' }}>
          {/* Category label */}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.15em', color: flyer.accent, textTransform: 'uppercase', marginBottom: '10px' }}>
            Nieuwe bewoners — Welkomstaanbieding
          </div>
          {/* Hero image or headline */}
          {flyer.heroImageUrl ? (
            <>
              <img src={flyer.heroImageUrl} alt="" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '3px', marginBottom: '8px', display: 'block' }} />
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: '6px', letterSpacing: '-0.02em' }}>
                {headline}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, color: '#fff', lineHeight: 1.05, marginBottom: '10px', letterSpacing: '-0.02em' }}>
                {headline.includes(' ') ? (
                  <>{headline.split(' ').slice(0, 2).join(' ')}<br /><em style={{ color: flyer.accent }}>{headline.split(' ').slice(2).join(' ') || 'in de buurt.'}</em></>
                ) : <><em style={{ color: flyer.accent }}>{headline}</em></>}
              </div>
            </>
          )}
          {/* Divider */}
          <div style={{ width: '32px', height: '2px', background: flyer.accent, marginBottom: '10px' }} />
          {/* Body */}
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, marginBottom: '12px' }}>{tekst}</div>
          {/* USPs */}
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
                  <span style={{ color: flyer.accent, fontSize: '9px', lineHeight: 1.4, flexShrink: 0 }}>—</span>
                  <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '8px', lineHeight: 1.4 }}>{u}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Footer bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: `1px solid rgba(255,255,255,0.1)`, padding: '10px 18px 10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '9px', color: '#fff' }}>{naam}</div>
            {flyer.website && <div style={{ fontSize: '7px', color: flyer.accent, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{flyer.website}</div>}
          </div>
          {flyer.logoData
            ? <img src={flyer.logoData} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '4px' }} />
            : <div style={{ width: '28px', height: '28px', background: flyer.accent, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: flyer.kleur, fontWeight: 800, fontSize: '10px' }}>{initials}</div>
          }
        </div>
      </div>
    );
  }

  // ── Design 2: GEOMETRIC (bold shapes) ────────────────────────────────────
  if (flyer.design === 'geometric') {
    return (
      <div style={{ ...base, background: '#f5f4f0' }}>
        {/* Large background circle */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: flyer.kleur, opacity: 0.08 }} />
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: flyer.accent, opacity: 0.15 }} />
        {/* Top colored block */}
        <div style={{ background: flyer.kleur, padding: '18px 18px 22px', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative circle */}
          <div style={{ position: 'absolute', bottom: '-30px', right: '-20px', width: '90px', height: '90px', borderRadius: '50%', border: `12px solid ${flyer.accent}`, opacity: 0.3 }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.12em', marginBottom: '8px' }}>WELKOM IN DE BUURT</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: '#fff', lineHeight: 1.0, fontWeight: 400, letterSpacing: '-0.02em' }}>
            {naam}
          </div>
          {flyer.slogan && <div style={{ fontSize: '9px', color: flyer.accent, marginTop: '4px', fontStyle: 'italic' }}>{flyer.slogan}</div>}
        </div>
        {/* Content */}
        <div style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '8.5px', color: '#333', lineHeight: 1.65, marginBottom: '12px' }}>{tekst}</div>
          {/* USP pills */}
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${flyer.kleur}0f`, borderRadius: '20px', padding: '5px 10px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: flyer.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: flyer.kleur, fontSize: '8px', fontWeight: 800 }}>✓</span>
                  </div>
                  <span style={{ fontSize: '7.5px', color: flyer.kleur, fontWeight: 600 }}>{u}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Bottom CTA strip */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: flyer.accent, padding: '8px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '8px', fontWeight: 700, color: flyer.kleur }}>{flyer.website || 'www.jouwwebsite.nl'}</span>
          {flyer.telefoon && <span style={{ fontSize: '8px', color: flyer.kleur, fontFamily: 'var(--font-mono)' }}>{flyer.telefoon}</span>}
        </div>
      </div>
    );
  }

  // ── Design 3: MINIMAL LUXURY ──────────────────────────────────────────────
  return (
    <div style={{ ...base, background: '#faf9f7' }}>
      {/* Full-bleed accent top */}
      <div style={{ height: '8px', background: flyer.accent }} />
      {/* Thin accent line accent */}
      <div style={{ height: '1px', background: flyer.kleur, margin: '0 20px' }} />
      <div style={{ padding: '16px 20px' }}>
        {/* Logo row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: flyer.kleur, fontWeight: 400, letterSpacing: '0.02em' }}>{naam}</div>
            {flyer.slogan && <div style={{ fontSize: '7px', color: '#888', marginTop: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{flyer.slogan}</div>}
          </div>
          {flyer.logoData
            ? <img src={flyer.logoData} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            : <div style={{ width: '32px', height: '32px', border: `1.5px solid ${flyer.kleur}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: flyer.kleur }}>{initials}</div>
          }
        </div>
        {/* Headline */}
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, color: flyer.kleur, lineHeight: 1.15, marginBottom: '6px', letterSpacing: '-0.02em' }}>
          Welkom in<br />de buurt.
        </div>
        <div style={{ width: '24px', height: '2px', background: flyer.accent, marginBottom: '12px' }} />
        {/* Body */}
        <div style={{ fontSize: '8px', color: '#555', lineHeight: 1.7, marginBottom: '14px' }}>{tekst}</div>
        {/* USPs — minimal list */}
        {usps.length > 0 && (
          <div style={{ borderTop: '1px solid #e8e6e0', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {usps.map((u, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: flyer.accent, flexShrink: 0 }} />
                <span style={{ fontSize: '7.5px', color: '#444', lineHeight: 1.4 }}>{u}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Bottom contact */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 20px', borderTop: '1px solid #e8e6e0', display: 'flex', justifyContent: 'space-between' }}>
        {flyer.website && <span style={{ fontSize: '7px', color: '#888', fontFamily: 'var(--font-mono)' }}>{flyer.website}</span>}
        {flyer.telefoon && <span style={{ fontSize: '7px', color: '#888', fontFamily: 'var(--font-mono)' }}>{flyer.telefoon}</span>}
      </div>
    </div>
  );
}

// ─── Coverage Visual (now uses real NL map) ──────────────────────────────────

function CoverageVisual({ centrum, straalKm }: { centrum: string; straalKm: number }) {
  const stats = estimeerDekkingsgebied(straalKm);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <NLMap centrum={centrum} straalKm={straalKm} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        {[
          { label: 'PC4-gebieden', val: String(stats.pc4Count), sub: 'in dekking' },
          { label: 'Nieuwe huishoudens/mnd', val: `~${stats.estAdressenMaand}`, sub: 'schatting CBS 5,5% jaarlijkse verhuisgraad' },
          { label: 'Verhuisbewegingen/jaar', val: `~${stats.referentieVorigjaar}`, sub: `≈ ${stats.estAdressenMaand}/mnd × 12 (CBS-schatting)` },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--white)', border: '1px solid var(--line)',
            borderRadius: 'var(--radius)', padding: '12px',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginBottom: '3px' }}>
              {s.label.toUpperCase()}
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--green)', lineHeight: 1 }}>
              {s.val}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)',
        borderRadius: 'var(--radius)', padding: '10px 12px',
        fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)',
      }}>
        💡 Suggestie: {stats.suggestieFlyers} flyers/mnd op basis van dit gebied
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

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function LokaalKabaal() {
  const router = useRouter();
  const [page, setPage] = useState<Page>('dashboard');
  const [user, setUser] = useState<{ email: string; naam: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lk_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const uitloggen = () => {
    localStorage.removeItem('lk_user');
    router.push('/login');
  };

  const [wiz, setWiz] = useState<WizState>({
    step: 1,
    akkoord: { av: false, privacy: false },
    kluswaarde: 2500,
    spec: '', specQ: '',
    datum: '',
    centrum: '', straal: 10,
    aantalFlyers: 500,
    formaat: 'a5', dubbelzijdig: false,
    proefFlyer: false, proefAdres: '',
  });

  const [flyer, setFlyer] = useState<FlyerState>({
    kleur: '#0A0A0A', accent: '#00E87A', afmeting: 'a5', dubbelzijdig: false,
    bedrijfsnaam: '', slogan: '', telefoon: '', email: '', website: '',
    usp: '', tekst: '', logoData: null,
    websiteUrl: '', websiteScan: null, design: 'editorial',
    heroImageUrl: null, headline: '', cta: '', pdfUrl: null,
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const logoRef = useRef<HTMLInputElement>(null);
  const flyerPreviewRef = useRef<HTMLDivElement>(null);

  const updateFlyer = useCallback((patch: Partial<FlyerState>) => {
    setFlyer(f => ({ ...f, ...patch }));
  }, []);

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

  const applyTemplate = useCallback((t: typeof FLYER_TEMPLATES[0]) => {
    updateFlyer({
      kleur: t.kleur, accent: t.accent,
      bedrijfsnaam: t.bedrijfsnaam, slogan: t.slogan,
      tekst: t.tekst, usp: t.usp,
    });
  }, [updateFlyer]);

  // ── Sidebar ──

  const navItems: { id: Page; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '◈' },
    { id: 'wizard', label: 'Nieuwe campagne', icon: '＋' },
    { id: 'flyer', label: 'Mijn flyer', icon: '◧' },
    { id: 'credits', label: 'Credits', icon: '◎' },
    { id: 'profiel', label: 'Mijn profiel', icon: '◉' },
  ];

  // ── Pages ──

  function renderDashboard() {
    return (
      <div className="fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Actieve campagnes', val: '0', delta: 'Start je eerste' },
            { label: 'Flyers verstuurd', val: '0', delta: 'deze maand' },
            { label: 'Gem. conversie', val: '—', delta: 'geen data nog' },
            { label: 'Credits over', val: '0', delta: 'koop credits →' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '60px 40px', textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', marginBottom: '16px', color: 'var(--line)' }}>◈</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', marginBottom: '10px' }}>Nog geen campagnes</div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.65, maxWidth: '380px', margin: '0 auto 24px' }}>
            Maak je eerste campagne en bereik nieuwe bewoners in jouw werkgebied — automatisch elke maand.
          </p>
          <button onClick={() => setPage('wizard')} style={{
            padding: '12px 28px', background: 'var(--ink)', color: 'var(--paper)',
            border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px', cursor: 'pointer'
          }}>
            + Eerste campagne starten
          </button>
        </div>

        <Ticker />
      </div>
    );
  }

  function renderWizard() {
    const { step, akkoord, kluswaarde, spec, specQ, datum, centrum, straal, aantalFlyers, formaat, dubbelzijdig, proefFlyer, proefAdres } = wiz;
    const availableMonths = getAvailableMonths();
    const stats = estimeerDekkingsgebied(straal);
    const prijs = berekenPrijs(aantalFlyers, formaat, dubbelzijdig);
    const proefPrijs = 4.95;
    const totaal = prijs + (proefFlyer ? proefPrijs : 0);

    const canNext = (
      (step === 1 && akkoord.av && akkoord.privacy) ||
      (step === 2 && spec !== '') ||
      (step === 3 && datum !== '') ||
      (step === 4 && centrum !== '') ||
      (step === 5 && aantalFlyers >= 250) ||
      step === 6 || step === 7
    );

    const specFiltered = SPECS.filter(s => s.toLowerCase().includes(specQ.toLowerCase()));

    return (
      <div className="fade-in">
        {/* Progress — sticky */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'var(--paper)', paddingTop: '12px', paddingBottom: '12px',
          marginBottom: '8px', borderBottom: '1px solid var(--line)',
        }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i + 1 <= step ? 'var(--green)' : 'var(--line)', transition: 'background 0.3s' }} />
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
            Stap {step} van 7 — {['Akkoord', 'Branche', 'Startdatum', 'Werkgebied', 'Formaat & aantallen', 'Controleer', 'Bevestiging'][step - 1]}
          </div>
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px', marginBottom: '16px' }}>

          {/* STAP 1: Akkoord */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>
                Welkom bij LokaalKabaal
              </h2>
              <p style={{ color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                Bereik nieuwe bewoners in jouw werkgebied met een fysieke flyer — bezorgd op het moment dat ze net zijn ingetrokken. Wij regelen het drukken, de Kadaster-data en de bezorging.
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
            <div>
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
                Voer je centrum-postcode in en kies een straal. Wij selecteren alle PC4-gebieden die de straal raken inclusief 2 km buffer.
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
                    type="range" min={5} max={50} step={5} value={straal}
                    onChange={e => updateWiz({ straal: Number(e.target.value), aantalFlyers: Math.max(250, estimeerDekkingsgebied(Number(e.target.value)).suggestieFlyers) })}
                    style={{ width: '100%', accentColor: 'var(--green)', marginTop: '8px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    <span>5 km</span><span>50 km</span>
                  </div>
                </div>
              </div>

              <CoverageVisual centrum={centrum} straalKm={straal} />
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
                    { id: 'a6' as const, label: 'A6', afm: '105×148 mm', toeslag: '−€0,05/stuk' },
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

              {/* Aantal */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
                  AANTAL FLYERS — {stats.suggestieFlyers} AANBEVOLEN VOOR DIT GEBIED
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
                  {[250, 500, 750, 1000, 1500, 2000, 2500, 3000].map(n => (
                    <button key={n} onClick={() => updateWiz({ aantalFlyers: n })}
                      style={{
                        padding: '10px 6px', border: `1px solid ${aantalFlyers === n ? 'var(--green)' : 'var(--line)'}`,
                        borderRadius: 'var(--radius)', background: aantalFlyers === n ? 'var(--green-bg)' : 'var(--paper)',
                        cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-mono)',
                        fontWeight: aantalFlyers === n ? 700 : 400, color: aantalFlyers === n ? 'var(--green-dim)' : 'var(--ink)',
                      }}>{n.toLocaleString('nl')}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>Of voer in:</span>
                  <input
                    type="number" min={250} step={50} value={aantalFlyers}
                    onChange={e => updateWiz({ aantalFlyers: Math.max(250, Number(e.target.value)) })}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontSize: '14px', background: 'var(--paper2)' }}
                  />
                </div>
              </div>

              {/* Prijsoverzicht */}
              <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{aantalFlyers.toLocaleString('nl')} flyers × {formaat.toUpperCase()}{dubbelzijdig ? ' dubbelzijdig' : ''}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                    €{(berekenPrijs(aantalFlyers, formaat, dubbelzijdig) / aantalFlyers).toFixed(2)}/stuk
                  </span>
                </div>
                <div style={{ height: '1px', background: 'var(--line)', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700 }}>Totaal per maand</span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green)' }}>{formatPrijs(prijs)}</span>
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

              {/* Samenvatting */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {[
                  { l: 'Branche', v: spec || '—' },
                  { l: 'Startdatum', v: datum ? new Date(datum).toLocaleDateString('nl', { month: 'long', year: 'numeric' }) : '—' },
                  { l: 'Werkgebied', v: centrum ? `${centrum} · ${straal} km · ${stats.pc4Count} PC4-gebieden` : '—' },
                  { l: 'Formaat', v: `${formaat.toUpperCase()}${dubbelzijdig ? ' dubbelzijdig' : ' enkelvoudig'}` },
                  { l: 'Aantal flyers', v: `${aantalFlyers.toLocaleString('nl')} / maand` },
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
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>Proef flyer (+€4,95 eenmalig)</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Ontvang 1 proef flyer op jouw eigen adres vóór de eerste echte verzending.</div>
                  </div>
                </label>
                {proefFlyer && (
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>JOUW ADRES (straat + huisnr + postcode + stad)</label>
                    <input
                      type="text"
                      placeholder="Kerkstraat 12, 3512 AB Utrecht"
                      value={proefAdres}
                      onChange={e => updateWiz({ proefAdres: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: '#fff', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }}
                    />
                  </div>
                )}
              </div>

              {/* Totaal */}
              <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{aantalFlyers.toLocaleString('nl')} flyers/maand ({formaat.toUpperCase()})</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{formatPrijs(prijs)}</span>
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
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '64px', color: 'var(--green)', marginBottom: '12px', lineHeight: 1 }}>✓</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '8px' }}>Campagne geactiveerd!</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '8px', maxWidth: '420px', margin: '0 auto 8px', lineHeight: 1.6 }}>
                Je flyers gaan elke maand op de 25e de deur uit naar nieuwe bewoners in <strong>{centrum || 'jouw werkgebied'}</strong>.
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '28px', fontFamily: 'var(--font-mono)' }}>
                Eerste bezorging: {datum ? new Date(datum).toLocaleDateString('nl', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setPage('dashboard')} style={{
                  padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)',
                  border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: 'pointer', fontSize: '14px'
                }}>Naar dashboard</button>
                <button onClick={() => setPage('flyer')} style={{
                  padding: '12px 24px', background: 'var(--paper)', color: 'var(--ink)',
                  border: '1px solid var(--line)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '14px'
                }}>Flyer aanpassen</button>
                <button onClick={() => updateWiz({ step: 1, spec: '', specQ: '', datum: '', centrum: '', aantalFlyers: 500, formaat: 'a5', dubbelzijdig: false, proefFlyer: false, proefAdres: '', akkoord: { av: false, privacy: false } })} style={{
                  padding: '12px 24px', background: 'var(--paper)', color: 'var(--ink)',
                  border: '1px solid var(--line)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '14px'
                }}>Nieuwe campagne</button>
              </div>
            </div>
          )}
        </div>

        {/* Nav knoppen */}
        {step < 7 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => step > 1 ? updateWiz({ step: step - 1 }) : setPage('dashboard')}
              style={{ padding: '10px 20px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)', cursor: 'pointer', fontSize: '13px' }}>
              {step === 1 ? 'Annuleren' : '← Terug'}
            </button>
            <button
              disabled={!canNext}
              onClick={() => updateWiz({ step: step + 1 })}
              style={{
                padding: '10px 24px', background: canNext ? 'var(--ink)' : 'var(--line)',
                color: canNext ? 'var(--paper)' : 'var(--muted)', border: 'none',
                borderRadius: 'var(--radius)', cursor: canNext ? 'pointer' : 'not-allowed',
                fontWeight: 700, fontSize: '13px', transition: 'all 0.15s'
              }}>
              {step === 6 ? 'Activeren →' : 'Volgende →'}
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderFlyer() {
    return (
      <div className="fade-in">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '4px' }}>Flyer editor</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '20px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          Pas je flyer aan. Veranderingen zijn direct zichtbaar in de preview.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Templates */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '12px' }}>Voorbeeldtemplates</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {FLYER_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t)}
                    style={{
                      padding: '12px 8px', border: '1px solid var(--line)',
                      borderRadius: 'var(--radius)', background: 'var(--paper)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{t.icon}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{t.label}</div>
                    <div style={{ width: '24px', height: '4px', borderRadius: '2px', background: t.accent, margin: '6px auto 0' }} />
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
                Klik op een template om kleuren, naam en tekst over te nemen
              </div>
            </div>

            {/* Design kiezen */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '12px' }}>Design</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {([
                  { id: 'editorial' as const, label: 'Editorial', sub: 'Magazine-stijl' },
                  { id: 'geometric' as const, label: 'Geometric', sub: 'Bold & modern' },
                  { id: 'minimal' as const, label: 'Minimal', sub: 'Luxury & clean' },
                ] as { id: 'editorial' | 'geometric' | 'minimal'; label: string; sub: string }[]).map(d => (
                  <button key={d.id} onClick={() => updateFlyer({ design: d.id })}
                    style={{
                      padding: '12px 8px', border: `2px solid ${flyer.design === d.id ? 'var(--green)' : 'var(--line)'}`,
                      borderRadius: 'var(--radius)', background: flyer.design === d.id ? 'var(--green-bg)' : 'var(--paper)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: flyer.design === d.id ? 'var(--green-dim)' : 'var(--ink)', marginBottom: '2px' }}>{d.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{d.sub}</div>
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
              {scanMsg && <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--green-dim)', fontFamily: 'var(--font-mono)' }}>{scanMsg}</div>}
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

            {/* Logo */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '12px' }}>Logo</div>
              <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {flyer.logoData ? (
                  <img src={flyer.logoData} alt="logo" style={{ width: '60px', height: '60px', objectFit: 'contain', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '4px' }} />
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
            {/* Bleed indicator wrapper */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div ref={flyerPreviewRef}>
                <FlyerPreview flyer={flyer} />
              </div>
              {/* Safe zone overlay (dashed) */}
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
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={flyer.dubbelzijdig} onChange={e => updateFlyer({ dubbelzijdig: e.target.checked })} style={{ accentColor: 'var(--green)' }} />
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>Dubbelzijdig (+€0,06/stuk)</span>
              </label>
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
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '4px' }}>Mijn profiel</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '20px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Beheer je bedrijfsgegevens en instellingen</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                <input placeholder={f.ph} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', boxSizing: 'border-box' }} />
              </div>
            ))}
            <button style={{ padding: '10px 20px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Opslaan</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px' }}>Financieel</div>
              {[
                { label: 'IBAN', ph: 'NL00 BANK 0000 0000 00' },
                { label: 'BTW-nummer', ph: 'NL000000000B01' },
                { label: 'Factuuradres', ph: 'Zelfde als bedrijfsadres' },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>{f.label.toUpperCase()}</label>
                  <input placeholder={f.ph} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', boxSizing: 'border-box' }} />
                </div>
              ))}
              <button style={{ padding: '10px 20px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Opslaan</button>
            </div>
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px' }}>Wachtwoord</div>
              {['Huidig wachtwoord', 'Nieuw wachtwoord', 'Bevestig wachtwoord'].map(f => (
                <div key={f} style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>{f.toUpperCase()}</label>
                  <input type="password" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', boxSizing: 'border-box' }} />
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
            <button key={id} onClick={() => setPage(id)}
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
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 'var(--topbar)', flexShrink: 0, background: 'var(--white)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontStyle: 'italic', color: 'var(--muted)' }}>
            {page === 'dashboard' && 'Overzicht'}
            {page === 'wizard' && 'Nieuwe campagne'}
            {page === 'flyer' && 'Flyer editor'}
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
          {page === 'credits' && renderCredits()}
          {page === 'profiel' && renderProfiel()}
        </div>
      </main>
    </div>
  );
}
