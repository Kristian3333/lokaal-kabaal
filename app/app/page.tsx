'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

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
}

type Page = 'dashboard' | 'wizard' | 'flyer' | 'credits' | 'profiel';

// ─── Flyer Preview ────────────────────────────────────────────────────────────

function FlyerPreview({ flyer }: { flyer: FlyerState }) {
  const initials = flyer.bedrijfsnaam
    ? flyer.bedrijfsnaam.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'LK';
  const usps = flyer.usp ? flyer.usp.split('\n').filter(Boolean).slice(0, 3) : [];

  return (
    <div style={{
      width: '240px', height: '340px', background: flyer.kleur,
      borderRadius: '8px', overflow: 'hidden', position: 'relative',
      flexShrink: 0, fontFamily: 'var(--font-sans)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      {/* Top accent bar with diagonal cut */}
      <div style={{ position: 'relative', height: '72px', background: flyer.accent, overflow: 'hidden' }}>
        {/* Diagonal bottom edge */}
        <div style={{
          position: 'absolute', bottom: '-12px', left: 0, right: 0,
          height: '28px', background: flyer.kleur,
          clipPath: 'polygon(0 40%, 100% 0%, 100% 100%, 0% 100%)',
        }} />
        {/* Logo + naam in header */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
          {flyer.logoData ? (
            <img src={flyer.logoData} alt="logo" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px', background: '#fff' }} />
          ) : (
            <div style={{
              width: '36px', height: '36px', background: flyer.kleur, borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: flyer.accent, fontWeight: 800, fontSize: '13px', letterSpacing: '-0.03em',
            }}>{initials}</div>
          )}
          <div>
            <div style={{ color: flyer.kleur, fontWeight: 700, fontSize: '11px', lineHeight: 1.2 }}>
              {flyer.bedrijfsnaam || 'Jouw Bedrijfsnaam'}
            </div>
            {flyer.slogan && (
              <div style={{ color: `${flyer.kleur}bb`, fontSize: '8px', marginTop: '2px', fontStyle: 'italic' }}>{flyer.slogan}</div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 16px 0' }}>
        {/* Welcome heading */}
        <div style={{
          color: flyer.accent, fontFamily: 'var(--font-serif)',
          fontSize: '18px', fontStyle: 'italic', lineHeight: 1.2, marginBottom: '8px',
        }}>
          Welkom in<br />de buurt!
        </div>

        {/* Body text */}
        <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: '8.5px', lineHeight: 1.6, marginBottom: '10px' }}>
          {flyer.tekst || 'Wij heten je van harte welkom als nieuwe bewoner. Kom eens langs en ontdek wat wij voor jou kunnen betekenen in de buurt.'}
        </div>

        {/* USPs */}
        {usps.length > 0 && (
          <div style={{
            background: `${flyer.accent}18`, borderLeft: `2px solid ${flyer.accent}`,
            padding: '8px 10px', borderRadius: '0 4px 4px 0',
            display: 'flex', flexDirection: 'column', gap: '5px',
          }}>
            {usps.map((u, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '14px', height: '14px', background: flyer.accent, borderRadius: '50%',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: flyer.kleur, fontSize: '8px', fontWeight: 700 }}>✓</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '8px', fontWeight: 500 }}>{u}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '8px 16px 10px',
        background: `linear-gradient(to top, ${flyer.kleur}ff, ${flyer.kleur}00)`,
        paddingTop: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {flyer.telefoon && (
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '7.5px', fontFamily: 'var(--font-mono)' }}>
                ☎ {flyer.telefoon}
              </div>
            )}
            {flyer.website && (
              <div style={{ color: flyer.accent, fontSize: '7.5px', fontFamily: 'var(--font-mono)' }}>
                ⬡ {flyer.website}
              </div>
            )}
          </div>
          {/* Accent dot badge */}
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: flyer.accent, opacity: 0.15,
          }} />
        </div>
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
          { label: 'PC4-gebieden', val: String(stats.pc4Count), sub: 'volledig gedekt' },
          { label: 'Nieuwe bewoners/mnd', val: `~${stats.estAdressenMaand}`, sub: 'op basis van Kadaster' },
          { label: 'Referentie vorig jaar', val: `~${stats.referentieVorigjaar}`, sub: 'transacties in dit gebied' },
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
    websiteUrl: '', websiteScan: null,
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const logoRef = useRef<HTMLInputElement>(null);

  const updateFlyer = useCallback((patch: Partial<FlyerState>) => {
    setFlyer(f => ({ ...f, ...patch }));
  }, []);

  const updateWiz = useCallback((patch: Partial<WizState>) => {
    setWiz(w => ({ ...w, ...patch }));
  }, []);

  const generateAI = useCallback(async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec: wiz.spec, bedrijfsnaam: flyer.bedrijfsnaam,
          slogan: flyer.slogan,
        })
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
  }, [wiz.spec, flyer.bedrijfsnaam, flyer.slogan, updateFlyer]);

  const scanWebsite = useCallback(async () => {
    if (!flyer.websiteUrl) return;
    setScanLoading(true);
    setScanMsg('Website analyseren...');
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: flyer.websiteUrl })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) {
        setScanMsg(data.error);
        return;
      }
      const patch: Partial<FlyerState> = {};
      if (data.scan?.primaryColor) patch.kleur = data.scan.primaryColor;
      if (data.scan?.accentColor) patch.accent = data.scan.accentColor;
      if (data.scan?.brandName) patch.bedrijfsnaam = data.scan.brandName;
      if (data.scan?.slogan) patch.slogan = data.scan.slogan;
      if (data.tekst) patch.tekst = data.tekst;
      if (data.usp) patch.usp = data.usp;
      patch.websiteScan = data.scan || null;
      updateFlyer(patch);
      setScanMsg('Kleuren, naam en flyertekst overgenomen!');
    } catch (e) {
      setScanMsg('Fout bij verbinden. Controleer de URL en probeer opnieuw.');
      console.error(e);
    } finally {
      setScanLoading(false);
      setTimeout(() => setScanMsg(''), 5000);
    }
  }, [flyer.websiteUrl, flyer.kleur, flyer.accent, flyer.bedrijfsnaam, updateFlyer]);

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
    const campaigns = [
      { naam: 'Koffiehuis Utrecht', gebied: '3 PC4-gebieden · 8km', status: 'actief', flyers: 500, conversie: '4.2%', omzet: '€3.200' },
      { naam: 'Fietsenwinkel Leiden', gebied: '7 PC4-gebieden · 15km', status: 'actief', flyers: 750, conversie: '3.8%', omzet: '€2.100' },
      { naam: 'Bakkerij Eindhoven', gebied: '5 PC4-gebieden · 12km', status: 'voltooid', flyers: 1000, conversie: '5.1%', omzet: '€4.800' },
    ];
    return (
      <div className="fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Actieve campagnes', val: '2', delta: '+1 deze maand' },
            { label: 'Flyers verstuurd', val: '1.250', delta: 'deze maand' },
            { label: 'Gem. conversie', val: '4.0%', delta: '+0.3% t.o.v. vorig' },
            { label: 'Credits over', val: '3', delta: 'koop meer →' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: 'var(--green-dim)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{s.delta}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>Flyervolume per maand</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>2026</span>
            </div>
            <MiniChart />
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '12px' }}>Credits</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', color: 'var(--green)', lineHeight: 1 }}>3</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '4px', marginBottom: '16px' }}>credits beschikbaar</div>
            <button onClick={() => setPage('credits')} style={{
              width: '100%', padding: '10px', background: 'var(--green)', color: 'var(--ink)',
              border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
            }}>
              Credits kopen
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>Actieve campagnes</div>
            <button onClick={() => setPage('wizard')} style={{
              padding: '6px 14px', background: 'var(--ink)', color: 'var(--paper)',
              border: 'none', borderRadius: 'var(--radius)', fontSize: '12px', cursor: 'pointer', fontWeight: 600
            }}>+ Nieuwe campagne</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--paper2)' }}>
                  {['Naam', 'Werkgebied', 'Status', 'Flyers', 'Conversie', 'Omzet'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.naam}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{c.gebied}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '2px', fontSize: '11px', fontFamily: 'var(--font-mono)',
                        background: c.status === 'actief' ? 'var(--green-bg)' : 'var(--paper3)',
                        color: c.status === 'actief' ? 'var(--green-dim)' : 'var(--muted)'
                      }}>{c.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{c.flyers}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--green-dim)' }}>{c.conversie}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>{c.omzet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        {/* Progress */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i + 1 <= step ? 'var(--green)' : 'var(--line)', transition: 'background 0.3s' }} />
          ))}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '16px' }}>
          Stap {step} van 7
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

            {/* Website scan */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px' }}>Website scan</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>Voer je website in — wij halen automatisch je merkstijl op</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  placeholder="https://jouwwebsite.nl"
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
          <div style={{ position: 'sticky', top: '20px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '12px' }}>Preview</div>
            <FlyerPreview flyer={flyer} />
            <div style={{ marginTop: '12px', padding: '10px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>FORMAAT</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['a6', 'a5', 'a4'].map(f => (
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
            <button onClick={() => setPage('wizard')} style={{ marginTop: '12px', width: '100%', padding: '12px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Campagne starten →</button>
          </div>
        </div>
      </div>
    );
  }

  function renderCredits() {
    const history = [
      { datum: '2026-03-01', omschrijving: '500 flyers A5 · Utrecht centrum', bedrag: -1, saldo: 3 },
      { datum: '2026-02-15', omschrijving: 'Credits gekocht (5 stuks)', bedrag: +5, saldo: 4 },
      { datum: '2026-02-01', omschrijving: '750 flyers A5 · Rotterdam Noord', bedrag: -1, saldo: -1 },
    ];
    return (
      <div className="fade-in">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '4px' }}>Credits</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '20px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          1 credit = 1 campagne per werkgebied per maand
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Huidig saldo', val: '3 credits' },
            { label: 'Waarde per credit', val: '€245' },
            { label: 'Besteed dit jaar', val: '€490' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>{s.label.toUpperCase()}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green)' }}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginBottom: '16px' }}>Credits kopen</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            {[
              { credits: 1, prijs: 245, label: 'Starter', desc: '1 campagne · maand naar keuze' },
              { credits: 3, prijs: 675, label: 'Groeier', desc: '3 campagnes · bespaar €60', popular: true },
              { credits: 12, prijs: 2400, label: 'Dominantie', desc: '12 campagnes · bespaar €540' },
            ].map(p => (
              <div key={p.credits} style={{ border: `2px solid ${p.popular ? 'var(--green)' : 'var(--line)'}`, borderRadius: 'var(--radius)', padding: '20px', position: 'relative', background: p.popular ? 'var(--green-bg)' : 'var(--paper)' }}>
                {p.popular && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: 'var(--ink)', fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '2px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>MEEST GEKOZEN</div>}
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '4px' }}>{p.label}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--green)', marginBottom: '4px' }}>{p.credits} <span style={{ fontSize: '16px', color: 'var(--muted)' }}>credits</span></div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', marginBottom: '8px' }}>€{p.prijs.toLocaleString('nl')}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>{p.desc}</div>
                <button style={{ width: '100%', padding: '10px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Kopen</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-serif)', fontSize: '18px' }}>Transactiehistorie</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--paper2)' }}>
                  {['Datum', 'Omschrijving', 'Credits', 'Saldo'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>{h.datum}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>{h.omschrijving}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: h.bedrag > 0 ? 'var(--green-dim)' : 'var(--red)', fontWeight: 600 }}>{h.bedrag > 0 ? '+' : ''}{h.bedrag}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{h.saldo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
