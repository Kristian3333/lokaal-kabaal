'use client';

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { TIERS, type Tier } from '@/lib/tiers';
import { prijsPerStuk, type FlyerFormaat } from '@/lib/printone-pricing';
import ErrorBoundary from '@/components/ErrorBoundary';
import BrancheSelector from '@/components/dashboard/BrancheSelector';
import MonthSelector from '@/components/dashboard/MonthSelector';
import PriceCalculator from '@/components/dashboard/PriceCalculator';
import { type FlyerState } from '@/components/dashboard/FlyerPreview';
import FlyerPreview from '@/components/dashboard/FlyerPreview';

const NLMap = dynamic(() => import('@/components/NLMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '280px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
      Kaart laden...
    </div>
  ),
});

// ─── Constants ────────────────────────────────────────────────────────────────

const SPECS = [
  'Kapper / Barbershop', 'Nagelstudio', 'Schoonheidsspecialist', 'Tattoo & Piercing',
  'Restaurant', 'Café / Bar', 'Koffietentje', 'Bakkerij', 'Slagerij', 'Traiteur / Catering',
  'Afhaal & Bezorging', 'Pizzeria', 'Aziatisch restaurant', 'IJssalon',
  'Sportschool / Fitness', 'Yoga & Pilates studio', 'Fysiotherapeut', 'Personal trainer',
  'Dansschool', 'Zwembad & Wellness', 'Meubelwinkel', 'Keukenwinkel',
  'Interieurwinkel / Woonwinkel', 'Verfwinkel / Behangwinkel', 'Doe-het-zelf & Bouwmarkt',
  'Bloemist', 'Cadeauwinkel', 'Boekenwinkel', 'Speelgoedwinkel', 'Kinderkleding',
  'Boetiek / Kledingwinkel', 'Schoenenwinkel', 'Juwelier', 'Opticiën', 'Drogist',
  'Huisdierenwinkel', 'Rijschool', 'Stucadoor / Afbouwbedrijf', 'Stomerij / Wasserette',
  'Fietsenwinkel', 'Overig (neem contact op)',
];

const MAANDEN = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WizState {
  step: number;
  akkoord: { av: boolean; privacy: boolean };
  kluswaarde: number;
  spec: string;
  specQ: string;
  datum: string;
  centrum: string;
  straal: number;
  aantalFlyers: number;
  formaat: FlyerFormaat;
  dubbelzijdig: boolean;
  duurMaanden: number;
  filterBouwjaarMin: number;
  filterBouwjaarMax: number;
  filterWozMin: number;
  filterWozMax: number;
  filterEnergielabel: string[];
  proefFlyer: boolean;
  proefAdres: string;
  email: string;
  pc4Lijst: string[];
  pc4Add: string;
  flyerIndex: number;
}

export interface PendingCampaign {
  spec: string;
  datum: string;
  centrum: string;
  aantalFlyers: number;
  formaat: string;
  dubbelzijdig: boolean;
  maxBudget: number;
  proefAdres: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the next 12 available months from next month. */
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

/** Estimates coverage area statistics from radius in km. */
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

/** Formats a price as Dutch Euro string. */
function formatPrijs(x: number): string {
  return '€' + x.toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Rounds n up to the nearest 50. */
function roundUp50(n: number): number {
  return Math.ceil(n / 50) * 50;
}

/** Returns subscription tier pricing summary for wizard. */
function berekenAbonnement(userTier: Tier): { tier: string; base: number; total: number } {
  const tierMap: Record<Tier, { name: string; monthly: number }> = {
    starter: { name: 'Starter', monthly: 99 },
    pro: { name: 'Pro', monthly: 199 },
    agency: { name: 'Agency', monthly: 499 },
  };
  const t = tierMap[userTier] ?? tierMap.starter;
  return { tier: t.name, base: t.monthly, total: t.monthly };
}

/** Computes the flyer price difference vs A6 baseline. */
function berekenPrijs(aantalFlyers: number, formaat: FlyerFormaat, dubbelzijdig: boolean): number {
  const pps = prijsPerStuk(formaat, dubbelzijdig);
  const a6Base = 0.69;
  return parseFloat(((pps - a6Base) * aantalFlyers).toFixed(2));
}

// ─── RoiCalc ─────────────────────────────────────────────────────────────────

/** Interactive ROI calculator shown on wizard step 1. */
function RoiCalc({ kluswaarde, onChange }: { kluswaarde: number; onChange: (v: number) => void }): React.JSX.Element {
  const flyers = 500;
  const conversie = 0.05;
  const klanten = Math.round(flyers * conversie);
  const omzet = klanten * kluswaarde;
  const kosten = berekenPrijs(flyers, 'a5', false);
  const roi = Math.round(((omzet - kosten) / kosten) * 100);

  return (
    <div style={{
      background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.2)',
      borderRadius: 'var(--radius)', padding: '20px', marginBottom: '20px',
    }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '12px' }}>ROI Calculator</div>
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
            borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--green)' }}>{s.val}</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CoverageVisual ───────────────────────────────────────────────────────────

/** Renders the postcode map and coverage statistics. */
function CoverageVisual({ centrum, straalKm, onPc4sChange, onEstChange }: {
  centrum: string;
  straalKm: number;
  onPc4sChange?: (pc4s: string[]) => void;
  onEstChange?: (est: number) => void;
}): React.JSX.Element {
  const [center, setCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pc4List, setPc4List] = useState<string[]>([]);

  // Geocode the centrum postcode via PDOK API
  const geocodeRef = useRef<string>('');
  const handleCentrumEffect = useCallback((c: string) => {
    if (!c || c.length < 4) { setCenter(null); return; }
    if (geocodeRef.current === c) return;
    geocodeRef.current = c;
    setLoading(true);
    fetch(`/api/geocode?pc4=${encodeURIComponent(c.trim())}`)
      .then(r => r.json())
      .then(data => {
        if (data.lat && data.lon) setCenter({ lat: data.lat, lon: data.lon });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Run geocoding when centrum changes
  handleCentrumEffect(centrum);

  const handlePc4sFound = (pc4s: string[]) => {
    setPc4List(pc4s);
    onPc4sChange?.(pc4s);
    if (pc4s.length > 0) {
      const totalAdressen = pc4s.length * 2800;
      const estMaand = Math.round(totalAdressen * 0.055 / 12);
      onEstChange?.(estMaand);
    }
  };

  const fallback = estimeerDekkingsgebied(straalKm);
  const totalAdressen = pc4List.length > 0
    ? pc4List.length * 2800
    : Math.round(Math.PI * straalKm * straalKm * 580);
  const estAdressenMaand = pc4List.length > 0
    ? Math.round(pc4List.length * 2800 * 0.055 / 12)
    : fallback.estAdressenMaand;
  const t = (v: string) => loading ? '...' : v;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ErrorBoundary>
        <NLMap
          center={center}
          straalKm={straalKm}
          centrumPc4={centrum.trim().padStart(4, '0')}
          onPc4sFound={handlePc4sFound}
        />
      </ErrorBoundary>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        {[
          { label: 'WONINGEN IN WERKGEBIED', val: t(`~${totalAdressen.toLocaleString('nl')}`), sub: pc4List.length > 0 ? `${pc4List.length} PC4-gebieden · ~2.800/PC4` : `schatting · ${straalKm} km straal` },
          { label: 'NIEUWE HUISHOUDENS/MND', val: t(`~${estAdressenMaand}`), sub: loading ? 'laden...' : '5,5% instroom/jaar (CBS)' },
          { label: 'DOELGROEP PER JAAR', val: t(`~${(estAdressenMaand * 12).toLocaleString('nl')}`), sub: 'nieuwe huishoudens om te bereiken' },
        ].map(({ label, val, sub }) => (
          <div key={label} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '12px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--green)', lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{sub}</div>
          </div>
        ))}
      </div>
      {pc4List.length > 0 && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginBottom: '6px' }}>
            PC4-GEBIEDEN IN BEZORGGEBIED ({pc4List.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {pc4List.map(pc4 => (
              <span key={pc4} style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                color: 'var(--green)', background: 'var(--green-bg)',
                border: '1px solid rgba(0,232,122,0.25)', borderRadius: '3px', padding: '2px 6px',
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
        Verwachte verhuizingen in dit gebied: ~{estAdressenMaand} huishoudens/mnd -- dit wordt je startaantal in de volgende stap
      </div>
    </div>
  );
}

// ─── CampaignWizard Props ─────────────────────────────────────────────────────

interface CampaignWizardProps {
  wiz: WizState;
  userTier: Tier;
  flyer: FlyerState;
  flyers: Array<FlyerState & { naam: string; id: number }>;
  onUpdateWiz: (patch: Partial<WizState>) => void;
  onSetActiveFlyerIdx: (i: number) => void;
  onSetPage: (page: string) => void;
  onSetPendingCampaign: (pc: PendingCampaign | null) => void;
  userEmail: string;
  isJaarcontract: boolean;
}

// ─── CampaignWizard ───────────────────────────────────────────────────────────

/**
 * 8-step campaign creation wizard.
 * Manages step navigation, address validation, and Stripe checkout redirect.
 */
export default function CampaignWizard({
  wiz,
  userTier,
  flyer,
  flyers,
  onUpdateWiz,
  onSetActiveFlyerIdx,
  onSetPage,
  onSetPendingCampaign,
  userEmail,
  isJaarcontract,
}: CampaignWizardProps): React.JSX.Element {
  const {
    step, akkoord, kluswaarde, spec, specQ, datum, centrum, straal,
    aantalFlyers, formaat, dubbelzijdig, proefFlyer, proefAdres, flyerIndex,
    duurMaanden, filterBouwjaarMin, filterBouwjaarMax,
    filterWozMin, filterWozMax, filterEnergielabel,
  } = wiz;

  const [adresStatus, setAdresStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [adresFeedback, setAdresFeedback] = useState<{
    volledig?: string; adresRegel?: string; postcode?: string;
    stad?: string; error?: string; suggesties?: string[];
  }>({});
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [largeOrderSent, setLargeOrderSent] = useState(false);
  const adresTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wizardFlyerRef = useRef<HTMLDivElement>(null);

  const availableMonths = getAvailableMonths();
  const stats = estimeerDekkingsgebied(straal);
  const actualPc4Count = wiz.pc4Lijst.length > 0 ? wiz.pc4Lijst.length : stats.pc4Count;
  const abonnement = berekenAbonnement(userTier);
  const prijs = abonnement.total;
  const proefPrijs = 4.95;
  const totaal = prijs + (proefFlyer ? proefPrijs : 0);

  const tierOrder: Tier[] = ['starter', 'pro', 'agency'];
  const kanFiltersGebruiken = tierOrder.indexOf(userTier) >= tierOrder.indexOf('pro');

  const canNext = (
    (step === 1 && akkoord.av && akkoord.privacy) ||
    (step === 2 && spec !== '') ||
    (step === 3 && datum !== '') ||
    (step === 4 && centrum !== '') ||
    step === 5 ||
    step === 6 ||
    (step === 7 && (wiz.email || '').includes('@') && (!proefFlyer || adresStatus === 'ok')) ||
    step === 8
  );

  const handleNext = async () => {
    if (step === 7 && proefFlyer) {
      setOrderLoading(true);
      setOrderError('');
      try {
        const flyerHtml = wizardFlyerRef.current
          ? `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:sans-serif}</style></head><body>${wizardFlyerRef.current.innerHTML}</body></html>`
          : '<html><body><p>Flyer</p></body></html>';

        const adresRegel = adresFeedback.adresRegel || proefAdres.split(',')[0].trim();
        const postcode = adresFeedback.postcode || '';
        const stad = adresFeedback.stad || '';

        const res = await fetch('/api/printone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flyerHtml, formaat, finish: 'GLOSSY',
            recipient: {
              name: flyer.bedrijfsnaam || 'Klant',
              address: adresRegel, city: stad, postalCode: postcode, country: 'NL',
            },
            sender: {
              name: 'LokaalKabaal', address: 'Keizersgracht 1',
              city: 'Amsterdam', postalCode: '1015CN', country: 'NL',
            },
            templateNaam: `Proef -- ${flyer.bedrijfsnaam || 'LokaalKabaal'} -- ${new Date().toISOString().slice(0, 10)}`,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setOrderError(data.error || 'Bestelling mislukt');
          return;
        }
        onSetPendingCampaign({
          spec, datum, centrum, aantalFlyers, formaat, dubbelzijdig,
          maxBudget: berekenPrijs(aantalFlyers, formaat, dubbelzijdig),
          proefAdres,
        });
        onUpdateWiz({ step: step + 1 });
      } catch {
        setOrderError('Verbindingsfout -- probeer opnieuw');
      } finally {
        setOrderLoading(false);
      }
    } else {
      onUpdateWiz({ step: step + 1 });
    }
  };

  const handleStripeCheckout = async () => {
    setOrderLoading(true);
    setOrderError('');
    try {
      if (aantalFlyers > 5000) {
        fetch('/api/notify-large-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aantalFlyers, spec, centrum, straal, email: wiz.email || '', bedrijfsnaam: flyer.bedrijfsnaam || '' }),
        }).then(() => setLargeOrderSent(true)).catch(() => {});
      }
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: userTier,
          billing: isJaarcontract ? 'yearly' : 'monthly',
          email: wiz.email || 'klant@lokaalkabaal.nl',
          bedrijfsnaam: flyer.bedrijfsnaam || 'Klant',
          branche: spec, centrum, duurMaanden,
          verwachtAantalPerMaand: stats.estAdressenMaand,
          formaat, dubbelzijdig,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setOrderError(data.error || 'Stripe checkout mislukt');
      }
    } catch {
      setOrderError('Verbindingsfout -- probeer opnieuw');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleAdresChange = (val: string) => {
    onUpdateWiz({ proefAdres: val });
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
  };

  return (
    <div className="fade-in wizard-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topbar))', overflow: 'hidden' }}>
      {/* Progress bar */}
      <div style={{ flexShrink: 0, background: 'var(--paper)', padding: '12px 24px 10px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', maxWidth: '680px' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i + 1 <= step ? 'var(--green)' : 'var(--line)', transition: 'background 0.3s' }} />
          ))}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
          Stap {step} van 8 -- {['Akkoord', 'Branche', 'Startdatum', 'Werkgebied', 'Formaat & aantallen', 'Duur & filters', 'Controleer', 'Bevestiging'][step - 1]}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="wizard-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px', maxWidth: '680px', margin: '0 auto' }}>

          {/* STAP 1: Akkoord */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>Welkom bij LokaalKabaal</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                Bereik nieuwe huiseigenaren in jouw postcodes met een fysieke flyer. Elke maand verwerken wij alle eigendomsoverdrachten en sturen op de 25e automatisch jouw flyer naar elk nieuw adres. Geen handmatig werk.
              </p>
              <RoiCalc kluswaarde={kluswaarde} onChange={v => onUpdateWiz({ kluswaarde: v })} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { key: 'av' as const, label: 'Ik ga akkoord met de algemene voorwaarden' },
                  { key: 'privacy' as const, label: 'Ik ga akkoord met het privacybeleid' },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={akkoord[key]}
                      onChange={e => onUpdateWiz({ akkoord: { ...akkoord, [key]: e.target.checked } })}
                      style={{ marginTop: '2px', accentColor: 'var(--green)', width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '13px', lineHeight: 1.5 }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STAP 2: Branche */}
          {step === 2 && (
            <BrancheSelector
              specs={SPECS}
              selected={spec}
              searchQuery={specQ}
              onSearchChange={q => onUpdateWiz({ specQ: q })}
              onSelect={s => onUpdateWiz({ spec: s })}
            />
          )}

          {/* STAP 3: Datum */}
          {step === 3 && (
            <MonthSelector
              availableMonths={availableMonths}
              selected={datum}
              onSelect={v => onUpdateWiz({ datum: v })}
            />
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
                    type="text" placeholder="bijv. 3512" maxLength={4} value={centrum}
                    onChange={e => onUpdateWiz({ centrum: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', fontSize: '16px', fontFamily: 'var(--font-mono)', background: 'var(--paper2)', boxSizing: 'border-box', letterSpacing: '0.1em' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>
                    STRAAL: {straal} KM
                  </label>
                  <input
                    type="range" min={1} max={250} step={1} value={Math.min(straal, 250)}
                    onChange={e => onUpdateWiz({ straal: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--green)', marginTop: '8px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    <span>1 km</span><span>50 km</span><span>150 km</span><span>250 km</span>
                  </div>
                </div>
              </div>

              {(() => {
                const maxPc4s = TIERS[userTier].maxPc4s;
                return (
                  <CoverageVisual
                    centrum={centrum}
                    straalKm={straal}
                    onPc4sChange={list => {
                      const capped = maxPc4s !== null ? list.slice(0, maxPc4s) : list;
                      onUpdateWiz({ pc4Lijst: capped });
                    }}
                    onEstChange={est => onUpdateWiz({ aantalFlyers: roundUp50(Math.max(250, est)) })}
                  />
                );
              })()}

              {/* PC4 tier limit notice */}
              {(() => {
                const maxPc4s = TIERS[userTier].maxPc4s;
                const atLimit = maxPc4s !== null && wiz.pc4Lijst.length >= maxPc4s;
                return atLimit ? (
                  <div style={{ marginTop: '12px', background: 'rgba(255,200,0,0.07)', border: '1px solid rgba(255,200,0,0.25)', borderRadius: 'var(--radius)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#b8860b', fontFamily: 'var(--font-mono)' }}>
                      Limiet bereikt: max. {maxPc4s} pc4&apos;s voor {TIERS[userTier].label}
                    </div>
                    <a href="/#prijzen" style={{ fontSize: '11px', color: '#b8860b', fontFamily: 'var(--font-mono)', fontWeight: 700, textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                      Upgrade →
                    </a>
                  </div>
                ) : null;
              })()}

              {/* PC4 chip editor */}
              {wiz.pc4Lijst.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                    GESELECTEERDE POSTCODES ({wiz.pc4Lijst.length}{TIERS[userTier].maxPc4s !== null ? `/${TIERS[userTier].maxPc4s}` : ''}) -- klik x om te verwijderen
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
                          onClick={() => onUpdateWiz({ pc4Lijst: wiz.pc4Lijst.filter(p => p !== pc4) })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green-dim)', padding: '0 0 0 2px', fontSize: '13px', lineHeight: 1 }}
                        >x</button>
                      </span>
                    ))}
                  </div>
                  {(() => {
                    const maxPc4s = TIERS[userTier].maxPc4s;
                    const atLimit = maxPc4s !== null && wiz.pc4Lijst.length >= maxPc4s;
                    return !atLimit ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text" maxLength={4} placeholder="+ postcode toevoegen"
                          value={wiz.pc4Add}
                          onChange={e => onUpdateWiz({ pc4Add: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              const v = wiz.pc4Add.trim();
                              if (/^\d{4}$/.test(v) && !wiz.pc4Lijst.includes(v))
                                onUpdateWiz({ pc4Lijst: [...wiz.pc4Lijst, v].sort(), pc4Add: '' });
                              else
                                onUpdateWiz({ pc4Add: '' });
                            }
                          }}
                          style={{ padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontSize: '13px', width: '160px', background: 'var(--paper2)' }}
                        />
                        <button
                          onClick={() => {
                            const v = wiz.pc4Add.trim();
                            if (/^\d{4}$/.test(v) && !wiz.pc4Lijst.includes(v))
                              onUpdateWiz({ pc4Lijst: [...wiz.pc4Lijst, v].sort(), pc4Add: '' });
                            else
                              onUpdateWiz({ pc4Add: '' });
                          }}
                          style={{ padding: '7px 14px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Voeg toe
                        </button>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          )}

          {/* STAP 5: Formaat & Aantallen */}
          {step === 5 && (
            <PriceCalculator
              formaat={formaat}
              dubbelzijdig={dubbelzijdig}
              estAdressenMaand={stats.estAdressenMaand}
              onFormaatChange={f => onUpdateWiz({ formaat: f })}
              onDubbelzijdigChange={checked => onUpdateWiz({ dubbelzijdig: checked })}
              abonnement={abonnement}
              actualPc4Count={actualPc4Count}
              formatPrijs={formatPrijs}
              centrum={centrum}
              straal={straal}
              spec={spec}
            />
          )}

          {/* STAP 6: Campagne duur & doelgroepfilters */}
          {step === 6 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>Campagneduur & doelgroep</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
                Kies hoe lang je campagne loopt. Elke 25e van de maand gaat een batch de deur uit.
              </p>
              <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                    HOEVEEL MAANDEN WIL JE DEZE CAMPAGNE DRAAIEN?
                  </label>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green)', lineHeight: 1 }}>
                    {duurMaanden} mnd
                  </span>
                </div>
                <input
                  type="range" min={1} max={24} step={1} value={duurMaanden}
                  onChange={e => onUpdateWiz({ duurMaanden: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--green)', marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  <span>1 mnd</span><span>6 mnd</span><span>12 mnd</span><span>24 mnd</span>
                </div>
                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {[
                    { label: 'VERWACHT FLYERS', val: `${stats.estAdressenMaand.toLocaleString('nl')}/mnd`, color: 'var(--green)' },
                    { label: 'TOTAAL FLYERS', val: (stats.estAdressenMaand * duurMaanden).toLocaleString('nl'), color: 'var(--ink)' },
                    { label: 'TOTAAL PRINTKOSTEN', val: `€${(prijsPerStuk(formaat, dubbelzijdig) * stats.estAdressenMaand * duurMaanden).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`, color: 'var(--ink)' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>{label}</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', background: 'rgba(255,200,0,0.06)', border: '1px solid rgba(255,200,0,0.2)', borderRadius: 'var(--radius)', padding: '8px 12px' }}>
                  Incasso op de 25e van de maand · surplusflyers worden als credits bijgeschreven en automatisch toegepast
                </div>
              </div>

              {/* Advanced targeting filters */}
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>GEAVANCEERDE DOELGROEPFILTERS</div>
                  {!kanFiltersGebruiken && (
                    <div style={{ fontSize: '10px', background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.3)', borderRadius: '4px', padding: '3px 8px', color: '#b8860b', fontFamily: 'var(--font-mono)' }}>
                      Pro of Agency vereist
                    </div>
                  )}
                </div>
                <div style={{ position: 'relative', opacity: kanFiltersGebruiken ? 1 : 0.4, pointerEvents: kanFiltersGebruiken ? 'auto' : 'none' }}>
                  {/* Bouwjaar */}
                  <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>Bouwjaar woning</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        { label: 'VANAF', val: filterBouwjaarMin, min: 1800, max: filterBouwjaarMax, onChange: (v: number) => onUpdateWiz({ filterBouwjaarMin: Math.min(v, filterBouwjaarMax) }) },
                        { label: 'T/M', val: filterBouwjaarMax, min: filterBouwjaarMin, max: new Date().getFullYear(), onChange: (v: number) => onUpdateWiz({ filterBouwjaarMax: Math.max(v, filterBouwjaarMin) }) },
                      ].map(f => (
                        <div key={f.label}>
                          <label style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>{f.label}</label>
                          <input type="number" min={f.min} max={f.max} value={f.val}
                            onChange={e => f.onChange(Number(e.target.value))}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* WOZ-waarde */}
                  <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>WOZ-waarde woning</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        { label: 'VANAF (€)', val: filterWozMin, min: 0, max: filterWozMax, step: 10000, onChange: (v: number) => onUpdateWiz({ filterWozMin: Math.min(v, filterWozMax) }) },
                        { label: 'T/M (€)', val: filterWozMax, min: filterWozMin, max: 5000000, step: 10000, onChange: (v: number) => onUpdateWiz({ filterWozMax: Math.max(v, filterWozMin) }) },
                      ].map(f => (
                        <div key={f.label}>
                          <label style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>{f.label}</label>
                          <input type="number" min={f.min} max={f.max} step={f.step} value={f.val}
                            onChange={e => f.onChange(Number(e.target.value))}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Energielabel */}
                  <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>Energielabel</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'].map(label => {
                        const selected = filterEnergielabel.includes(label);
                        return (
                          <button key={label}
                            onClick={() => {
                              const next = selected
                                ? filterEnergielabel.filter(l => l !== label)
                                : [...filterEnergielabel, label];
                              onUpdateWiz({ filterEnergielabel: next });
                            }}
                            style={{
                              padding: '6px 12px',
                              border: `2px solid ${selected ? 'var(--green)' : 'var(--line)'}`,
                              borderRadius: 'var(--radius)', cursor: 'pointer',
                              fontWeight: selected ? 700 : 400,
                              background: selected ? 'var(--green-bg)' : 'var(--paper)',
                              color: selected ? 'var(--green-dim)' : 'var(--ink)',
                              fontSize: '12px', fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
                            }}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    {filterEnergielabel.length === 0 && (
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>Geen selectie = alle energielabels</div>
                    )}
                  </div>
                </div>
                {/* Lock overlay for Starter tier */}
                {!kanFiltersGebruiken && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(255,255,255,0.95) 60%, transparent)', padding: '20px 16px 16px', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', minHeight: '80px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', marginBottom: '6px' }}>Vergrendeld</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Beschikbaar vanaf Pro</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '10px' }}>Upgrade voor bouwjaar, WOZ-waarde en energielabel-filtering</div>
                      <a href="/login" style={{ display: 'inline-block', padding: '8px 18px', background: 'var(--ink)', color: '#fff', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                        Upgrade naar Pro →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STAP 7: Proef flyer + overzicht */}
          {step === 7 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>Controleer & proef flyer</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
                Bekijk je instellingen. Optioneel: stuur een proef flyer naar je eigen adres.
              </p>

              {/* Flyer picker */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>FLYER VOOR DEZE CAMPAGNE</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {flyers.map((f, i) => (
                    <button key={f.id} onClick={() => { onSetActiveFlyerIdx(i); onUpdateWiz({ flyerIndex: i }); }}
                      style={{
                        padding: '8px 14px',
                        border: `2px solid ${flyerIndex === i ? 'var(--green)' : 'var(--line)'}`,
                        borderRadius: 'var(--radius)',
                        background: flyerIndex === i ? 'var(--green-bg)' : 'var(--paper)',
                        cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)',
                        fontWeight: flyerIndex === i ? 700 : 400,
                        color: flyerIndex === i ? 'var(--green-dim)' : 'var(--ink)',
                      }}>
                      {f.naam}
                    </button>
                  ))}
                  <button onClick={() => onSetPage('flyer')}
                    style={{ padding: '8px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                    Bewerken →
                  </button>
                </div>
                <div ref={wizardFlyerRef} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <FlyerPreview flyer={flyer} formaat={formaat} />
                </div>
              </div>

              {/* Summary grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {[
                  { l: 'Branche', v: spec || '-' },
                  { l: 'Startdatum', v: datum ? new Date(datum).toLocaleDateString('nl', { month: 'long', year: 'numeric' }) : '-' },
                  { l: 'Werkgebied', v: centrum ? `${centrum} · ${straal} km` : '-' },
                  { l: 'PC4-gebieden', v: wiz.pc4Lijst.length > 0 ? wiz.pc4Lijst.join(', ') : `~${stats.pc4Count} gebieden` },
                  { l: 'Formaat', v: `${formaat.toUpperCase()}${dubbelzijdig ? ' dubbelzijdig' : ' enkelvoudig'}` },
                  { l: 'Abonnement', v: `${abonnement.tier} · ${formatPrijs(abonnement.total)}/mnd` },
                  { l: 'Campagneduur', v: `${duurMaanden} maand${duurMaanden !== 1 ? 'en' : ''}` },
                  { l: 'Bezorging', v: 'Elke 25e van de maand' },
                ].map(({ l, v }) => (
                  <div key={l} style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>{l.toUpperCase()}</div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Proef flyer opt-in */}
              <div style={{ border: `2px solid ${proefFlyer ? 'var(--green)' : 'var(--line)'}`, borderRadius: 'var(--radius)', padding: '20px', background: proefFlyer ? 'var(--green-bg)' : 'var(--paper)', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: proefFlyer ? '16px' : '0' }}>
                  <input type="checkbox" checked={proefFlyer} onChange={e => onUpdateWiz({ proefFlyer: e.target.checked })} style={{ accentColor: 'var(--green)', width: '16px', height: '16px', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>Proef flyer thuis ontvangen (+€4,95 eenmalig)</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
                      Wij sturen 1 proef flyer naar jouw eigen adres. Zodra je hem hebt ontvangen, log je in op het dashboard en keur je de campagne goed -- of pas je de flyer nog aan.
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
                        onChange={e => handleAdresChange(e.target.value)}
                        style={{
                          width: '100%', padding: '10px 36px 10px 12px',
                          border: `1px solid ${adresStatus === 'ok' ? 'var(--green)' : adresStatus === 'error' ? '#e74c3c' : 'var(--line)'}`,
                          borderRadius: 'var(--radius)', background: '#fff',
                          fontFamily: 'var(--font-mono)', boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>
                        {adresStatus === 'checking' && <span style={{ color: 'var(--muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>...</span>}
                        {adresStatus === 'ok' && <span style={{ color: 'var(--green)' }}>v</span>}
                        {adresStatus === 'error' && <span style={{ color: '#e74c3c' }}>x</span>}
                      </div>
                    </div>
                    {adresStatus === 'ok' && adresFeedback.volledig && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--green-dim)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        v Gevonden: {adresFeedback.volledig}
                      </div>
                    )}
                    {adresStatus === 'error' && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: '#e74c3c', fontFamily: 'var(--font-mono)' }}>
                        {adresFeedback.error || 'Adres niet herkend'}
                        {adresFeedback.suggesties && adresFeedback.suggesties.length > 0 && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ color: 'var(--muted)' }}>Bedoelde je: </span>
                            {adresFeedback.suggesties.map((s, i) => (
                              <button key={i} onClick={() => { onUpdateWiz({ proefAdres: s }); setAdresStatus('idle'); setAdresFeedback({}); }}
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

              {/* Email for Stripe */}
              <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>E-MAILADRES (voor betalingsbevestiging)</label>
                <input
                  type="email"
                  value={wiz.email ?? ''}
                  onChange={e => onUpdateWiz({ email: e.target.value })}
                  placeholder="jouw@email.nl"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: '#fff', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }}
                />
              </div>

              {/* Total */}
              <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{abonnement.tier} abonnement · {formaat.toUpperCase()}{dubbelzijdig ? ' dubbelzijdig' : ''} · {duurMaanden} mnd</span>
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

          {/* STAP 8: Bevestiging */}
          {step === 8 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {proefFlyer ? (
                <>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '56px', color: 'var(--green)', marginBottom: '12px', lineHeight: 1 }}>v</div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '8px' }}>Proef flyer onderweg!</h2>
                  <p style={{ color: 'var(--muted)', maxWidth: '420px', margin: '0 auto 8px', lineHeight: 1.6 }}>
                    Je proef flyer wordt verstuurd naar <strong>{proefAdres}</strong>. Verwacht hem binnen 2-4 werkdagen.
                  </p>
                  <div style={{ maxWidth: '420px', margin: '0 auto 20px', textAlign: 'left' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', textAlign: 'center' }}>WAT GEBEURT ER DAARNA?</div>
                    {[
                      { n: '1', text: 'Ontvang je proef flyer thuis in de bus' },
                      { n: '2', text: 'Log in op het dashboard en keur de flyer goed (of pas hem nog aan)' },
                      { n: '3', text: 'Na jouw goedkeuring gaat de echte campagne van start' },
                    ].map(s => (
                      <div key={s.n} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--green)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, flexShrink: 0 }}>{s.n}</div>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, paddingTop: '2px' }}>{s.text}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: '11px', marginBottom: '20px', fontFamily: 'var(--font-mono)' }}>
                    Betaald: €4,95 incl. verzending · Campagne nog niet actief
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => onSetPage('dashboard')} style={{ padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>Naar dashboard →</button>
                    <button onClick={() => onUpdateWiz({ step: 1, akkoord: { av: false, privacy: false }, spec: '', datum: '', centrum: '', proefFlyer: false, proefAdres: '', email: '' })} style={{ padding: '12px 24px', background: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '14px' }}>+ Nog een campagne</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '64px', color: 'var(--green)', marginBottom: '12px', lineHeight: 1 }}>€</div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '8px' }}>Betaal & activeer je campagne</h2>
                  <p style={{ color: 'var(--muted)', maxWidth: '420px', margin: '0 auto 8px', lineHeight: 1.6 }}>
                    Je flyers gaan elke maand op de <strong>25e</strong> de deur uit naar nieuwe bewoners in <strong>{centrum || 'jouw werkgebied'}</strong>.
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px', fontFamily: 'var(--font-mono)' }}>
                    Eerste bezorging: {datum ? new Date(datum).toLocaleDateString('nl', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} · Betaling via Stripe
                  </p>
                  <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px', maxWidth: '420px', margin: '0 auto 20px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{abonnement.tier} · ~{stats.estAdressenMaand}/mnd flyers · {duurMaanden} mnd campagne</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{formatPrijs(prijs)}/mnd</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      Vaste maandprijs -- geen verassingen. Factuur op de 1e v/d maand.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleStripeCheckout}
                      disabled={orderLoading}
                      style={{
                        padding: '14px 32px',
                        background: orderLoading ? 'var(--line)' : 'var(--ink)',
                        color: orderLoading ? 'var(--muted)' : 'var(--paper)',
                        border: 'none', borderRadius: 'var(--radius)',
                        fontWeight: 700, cursor: orderLoading ? 'not-allowed' : 'pointer', fontSize: '15px',
                      }}>
                      {orderLoading ? 'Laden...' : 'Betalen via Stripe →'}
                    </button>
                    <button onClick={() => onSetPage('dashboard')} style={{ padding: '14px 24px', background: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '14px' }}>Annuleren</button>
                  </div>
                  {orderError && <div style={{ marginTop: '12px', fontSize: '12px', color: '#c0392b', fontFamily: 'var(--font-mono)' }}>x {orderError}</div>}
                  {largeOrderSent && (
                    <div style={{ marginTop: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(0,232,122,0.07)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
                      <span style={{ color: 'var(--green)', fontSize: '16px', flexShrink: 0 }}>v</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)', marginBottom: '2px' }}>Maatwerkaanvraag verstuurd</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
                          Uw aanvraag voor {aantalFlyers.toLocaleString('nl')} flyers is doorgestuurd naar support@lokaalkabaal.nl. We nemen binnen 24 uur contact op.
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nav buttons -- pinned to bottom */}
      {step < 8 && (
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--line)', background: 'var(--paper)', padding: '12px 24px' }}>
          {orderError && (
            <div style={{ marginBottom: '10px', padding: '10px 14px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 'var(--radius)', fontSize: '12px', color: '#c0392b', fontFamily: 'var(--font-mono)' }}>
              x {orderError}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => step > 1 ? onUpdateWiz({ step: step - 1 }) : onSetPage('dashboard')}
              style={{ padding: '10px 20px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)', cursor: 'pointer', fontSize: '13px' }}>
              {step === 1 ? 'Annuleren' : 'Terug'}
            </button>
            <button
              disabled={!canNext || orderLoading}
              onClick={handleNext}
              style={{
                padding: '10px 24px',
                background: (canNext && !orderLoading) ? 'var(--ink)' : 'var(--line)',
                color: (canNext && !orderLoading) ? 'var(--paper)' : 'var(--muted)',
                border: 'none', borderRadius: 'var(--radius)',
                cursor: (canNext && !orderLoading) ? 'pointer' : 'not-allowed',
                fontWeight: 700, fontSize: '13px', transition: 'all 0.15s',
              }}>
              {orderLoading ? 'Bestelling plaatsen...' : step === 7 ? (proefFlyer ? 'Proef bestellen -- €4,95 →' : 'Campagne activeren →') : 'Volgende →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
