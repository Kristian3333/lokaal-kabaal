'use client';

import { useRef, useState } from 'react';
import { PREVIEW_PX } from '@/components/FlyerExport';
import FlyerExport from '@/components/FlyerExport';
import FlyerPreview, { type FlyerState, AdaptiveLogo } from '@/components/dashboard/FlyerPreview';
import FlyerBackPreview from '@/components/dashboard/FlyerBackPreview';
import { type PendingCampaign } from '@/components/dashboard/CampaignWizard';
import { FLYER_PRESETS, presetsForBranche, type FlyerPreset } from '@/lib/flyer-presets';
import { buildMailto } from '@/lib/contact-config';

// ─── Design Options ───────────────────────────────────────────────────────────

const DESIGNS: { id: FlyerState['design']; label: string; sub: string }[] = [
  { id: 'editorial', label: 'Editorial', sub: 'Magazine-stijl' },
  { id: 'geometric', label: 'Geometric', sub: 'Bold & modern' },
  { id: 'minimal', label: 'Minimal', sub: 'Luxury & clean' },
  { id: 'bold', label: 'Bold', sub: 'Foto centraal' },
  { id: 'retro', label: 'Retro', sub: 'Vintage poster' },
  { id: 'warm', label: 'Warm', sub: 'Buurt & sfeer' },
  { id: 'neon', label: 'Neon', sub: 'Dark & glowing' },
  { id: 'corporate', label: 'Corporate', sub: 'Professioneel' },
  { id: 'playful', label: 'Playful', sub: 'Fun & rondes' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type SavedFlyer = FlyerState & { naam: string; id: number };

interface FlyerDesignerProps {
  flyer: FlyerState;
  flyers: SavedFlyer[];
  activeFlyerIdx: number;
  previewSide: 'voor' | 'achter';
  scanLoading: boolean;
  scanMsg: string;
  aiLoading: boolean;
  pendingCampaign: PendingCampaign | null;
  onUpdateFlyer: (patch: Partial<FlyerState>) => void;
  onSetFlyers: (fs: SavedFlyer[]) => void;
  onSetActiveFlyerIdx: (i: number) => void;
  onSetPreviewSide: (side: 'voor' | 'achter') => void;
  onScanWebsite: () => void;
  onGenerateAI: () => void;
  onSetPage: (page: string) => void;
  onSetPendingCampaign: (pc: PendingCampaign | null) => void;
  flyerBedrijfsnaam: string;
  initFlyer: FlyerState;
  /** Optional: show Persoonlijke flyerhulp CTA for Agency + jaarcontract */
  userTier?: 'starter' | 'pro' | 'agency';
  isJaarcontract?: boolean;
  userEmail?: string;
}

/**
 * Flyer editor panel with design picker, website autofill, branding fields,
 * and a sticky preview sidebar with export controls.
 */
export default function FlyerDesigner({
  flyer,
  flyers,
  activeFlyerIdx,
  previewSide,
  scanLoading,
  scanMsg,
  aiLoading,
  pendingCampaign,
  onUpdateFlyer,
  onSetFlyers,
  onSetActiveFlyerIdx,
  onSetPreviewSide,
  onScanWebsite,
  onGenerateAI,
  onSetPage,
  onSetPendingCampaign,
  initFlyer,
  userTier,
  isJaarcontract,
  userEmail,
}: FlyerDesignerProps): React.JSX.Element {
  const logoRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLInputElement>(null);
  const flyerPreviewRef = useRef<HTMLDivElement>(null);
  const frontPrintRef = useRef<HTMLDivElement>(null);
  const backPrintRef = useRef<HTMLDivElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdateFlyer({ logoData: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdateFlyer({ heroImageUrl: ev.target?.result as string, heroScale: 100, heroOffsetX: 50, heroOffsetY: 50 });
    reader.readAsDataURL(file);
  };

  const scanError = scanMsg.includes('mislukt') || scanMsg.includes('blokkeert') || scanMsg.includes('niet bereikbaar') || scanMsg.includes('niet uitgelezen');

  return (
    <>
      <div className="fade-in">
        {/* Pending campaign approval banner */}
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
                {pendingCampaign.spec} · {pendingCampaign.aantalFlyers.toLocaleString('nl')} flyers/mnd · start {pendingCampaign.datum ? new Date(pendingCampaign.datum).toLocaleDateString('nl', { month: 'long', year: 'numeric' }) : '-'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => onSetPage('dashboard')}
                style={{ padding: '8px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)', cursor: 'pointer', fontSize: '12px' }}>
                Terug
              </button>
              <button onClick={() => { onSetPendingCampaign(null); onSetPage('dashboard'); }}
                style={{ padding: '8px 16px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
                Campagne goedkeuren →
              </button>
            </div>
          </div>
        )}

        {/* Persoonlijke flyerhulp (Agency jaarcontract) */}
        {userTier === 'agency' && isJaarcontract && (
          <div style={{
            background: 'var(--ink)', border: '1px solid rgba(0,232,122,0.35)',
            borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Persoonlijke flyerhulp · inbegrepen
              </div>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600, marginBottom: '2px' }}>
                Laat onze designers deze flyer voor je maken
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
                Wij leveren binnen 2 werkdagen een druk-klare flyer op maat.
              </div>
            </div>
            <a
              href={`${buildMailto('design')}${userEmail ? `&body=Account%3A%20${encodeURIComponent(userEmail)}` : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', background: 'var(--green)', color: 'var(--ink)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-mono)' }}
            >
              Stuur designaanvraag →
            </a>
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
                const newFlyer: SavedFlyer = { ...initFlyer, naam: `Flyer ${flyers.length + 1}`, id: newId };
                onSetFlyers([...flyers, newFlyer]);
                onSetActiveFlyerIdx(flyers.length);
              }}
              style={{ padding: '8px 16px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
              + Nieuwe flyer
            </button>
          )}
        </div>

        {/* Flyer tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {flyers.map((f, i) => (
            <button key={f.id} onClick={() => onSetActiveFlyerIdx(i)}
              style={{
                padding: '7px 14px',
                border: `2px solid ${activeFlyerIdx === i ? 'var(--green)' : 'var(--line)'}`,
                borderRadius: 'var(--radius)',
                background: activeFlyerIdx === i ? 'var(--green-bg)' : 'var(--paper)',
                cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)',
                fontWeight: activeFlyerIdx === i ? 700 : 400,
                color: activeFlyerIdx === i ? 'var(--green-dim)' : 'var(--ink)',
              }}>
              {f.naam}
              {flyers.length > 1 && (
                <span
                  onClick={e => {
                    e.stopPropagation();
                    if (flyers.length > 1) {
                      onSetFlyers(flyers.filter((_, idx) => idx !== i));
                      onSetActiveFlyerIdx(0);
                    }
                  }}
                  style={{ marginLeft: '8px', color: 'var(--muted)', fontWeight: 400, cursor: 'pointer' }}>x</span>
              )}
            </button>
          ))}
        </div>

        <div className="flyer-editor-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Template marketplace */}
            <TemplateMarketplace flyer={flyer} onUpdateFlyer={onUpdateFlyer} />

            {/* Design picker */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px' }}>Design</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>9 professionele stijlen -- kies wat bij jou past</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {DESIGNS.map(d => (
                  <button key={d.id} onClick={() => onUpdateFlyer({ design: d.id })}
                    style={{
                      padding: '10px 6px',
                      border: `2px solid ${flyer.design === d.id ? 'var(--green)' : 'var(--line)'}`,
                      borderRadius: 'var(--radius)',
                      background: flyer.design === d.id ? 'var(--green-bg)' : 'var(--paper)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: flyer.design === d.id ? 'var(--green-dim)' : 'var(--ink)', marginBottom: '2px' }}>{d.label}</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{d.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Website autofill */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px' }}>Autofill van website</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>Optioneel: vul je URL in om kleuren en logo over te nemen</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="www.jouwwebsite.nl"
                  value={flyer.websiteUrl}
                  onChange={e => onUpdateFlyer({ websiteUrl: e.target.value })}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)' }}
                />
                <button onClick={onScanWebsite} disabled={scanLoading || !flyer.websiteUrl}
                  style={{
                    padding: '8px 14px', background: 'var(--ink)', color: 'var(--paper)',
                    border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
                    fontSize: '12px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
                    opacity: (!flyer.websiteUrl || scanLoading) ? 0.5 : 1,
                  }}>
                  {scanLoading ? 'Ophalen...' : 'Ophalen \u2192'}
                </button>
              </div>
              {scanMsg && (
                <div style={{
                  marginTop: '8px', padding: '10px 12px', borderRadius: 'var(--radius)',
                  fontSize: '12px', fontFamily: 'var(--font-mono)', lineHeight: 1.6,
                  background: scanError ? 'rgba(255,80,80,0.07)' : 'var(--green-bg)',
                  border: `1px solid ${scanError ? 'rgba(255,80,80,0.25)' : 'rgba(0,232,122,0.25)'}`,
                  color: scanError ? '#c0392b' : 'var(--green-dim)',
                }}>
                  {scanMsg}
                </div>
              )}
            </div>

            {/* Colors */}
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
                      <input type="color" value={flyer[field] as string} onChange={e => onUpdateFlyer({ [field]: e.target.value })}
                        style={{ width: '40px', height: '36px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', cursor: 'pointer', padding: '2px' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{flyer[field] as string}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Business details */}
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
                      onChange={e => onUpdateFlyer({ [field]: e.target.value })}
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
                onChange={e => onUpdateFlyer({ usp: e.target.value })}
                placeholder={'Gratis eerste consult\nLokaal & betrouwbaar\n10% welkomstkorting'}
                rows={4}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: '13px', boxSizing: 'border-box' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                Een USP per regel (max 3 getoond)
              </div>
            </div>

            {/* Text generation */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>Flyertekst</div>
                <button onClick={onGenerateAI} disabled={aiLoading}
                  style={{ padding: '6px 14px', background: 'var(--green)', color: 'var(--ink)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '12px', fontWeight: 700, opacity: aiLoading ? 0.6 : 1, fontFamily: 'var(--font-mono)' }}>
                  {aiLoading ? 'Genereren...' : 'Tekst genereren'}
                </button>
              </div>
              <textarea
                value={flyer.tekst}
                onChange={e => onUpdateFlyer({ tekst: e.target.value })}
                placeholder="Klik op 'Tekst genereren' of schrijf je eigen tekst..."
                rows={5}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {/* QR code placement */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px' }}>QR-code plaatsing</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>Kies op welke kant de QR-code verschijnt</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {([
                  { id: 'achter' as const, label: 'Achter', sub: 'Standaard' },
                  { id: 'voor' as const, label: 'Voor', sub: 'Op voorkant' },
                  { id: 'beide' as const, label: 'Beide', sub: 'Voor + achter' },
                ]).map(opt => (
                  <button key={opt.id} onClick={() => onUpdateFlyer({ qrPlaats: opt.id })}
                    style={{
                      padding: '10px 6px',
                      border: `2px solid ${flyer.qrPlaats === opt.id ? 'var(--green)' : 'var(--line)'}`,
                      borderRadius: 'var(--radius)',
                      background: flyer.qrPlaats === opt.id ? 'var(--green-bg)' : 'var(--paper)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: flyer.qrPlaats === opt.id ? 'var(--green-dim)' : 'var(--ink)', marginBottom: '2px' }}>{opt.label}</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Back side */}
            <div style={{ background: 'var(--white)', border: `2px solid ${flyer.dubbelzijdig ? 'var(--green)' : 'var(--line)'}`, borderRadius: 'var(--radius)', padding: '20px', opacity: flyer.dubbelzijdig ? 1 : 0.5, transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>Achterkant</div>
                  {flyer.dubbelzijdig && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', background: 'var(--green)', color: 'var(--ink)', padding: '1px 6px', borderRadius: '2px', fontWeight: 700 }}>ACTIEF</span>}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={flyer.dubbelzijdig}
                    onChange={e => {
                      onUpdateFlyer({ dubbelzijdig: e.target.checked });
                      if (!e.target.checked) onSetPreviewSide('voor');
                    }}
                    style={{ accentColor: 'var(--green)' }} />
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: flyer.dubbelzijdig ? 'var(--green-dim)' : 'var(--muted)' }}>Dubbelzijdig (+€0,06/stuk)</span>
                </label>
              </div>
              {!flyer.dubbelzijdig ? (
                <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', padding: '12px 0' }}>
                  Zet dubbelzijdig aan om de achterkant te ontwerpen -- perfect voor openingstijden, contact en een QR-code.
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
                        onChange={e => onUpdateFlyer({ adres: e.target.value })}
                        placeholder="Kerkstraat 12, 3512 AB Utrecht"
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>OPENINGSTIJDEN (een per regel)</label>
                      <textarea
                        value={flyer.openingstijden}
                        onChange={e => onUpdateFlyer({ openingstijden: e.target.value })}
                        placeholder={'Ma\u2013Vr 09:00\u201318:00\nZa 10:00\u201317:00\nZo gesloten'}
                        rows={3}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>ACHTERKANT TEKST (slogan of aanbieding)</label>
                      <textarea
                        value={flyer.backTekst}
                        onChange={e => onUpdateFlyer({ backTekst: e.target.value })}
                        placeholder="Vragen? Wij helpen je graag verder. Kom langs of bel ons!"
                        rows={2}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper2)', resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Hero photo */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px' }}>Foto</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>Hoofdafbeelding op je flyer -- sleep in de preview om te herpositioneren</div>
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
                    <button onClick={() => onUpdateFlyer({ heroImageUrl: null })} style={{ fontSize: '12px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>Verwijderen</button>
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
                    <input type="range" min={50} max={200} step={5} value={flyer.heroScale ?? 100}
                      onChange={e => onUpdateFlyer({ heroScale: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: 'var(--green)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      <span>50%</span><span>200%</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { label: 'LINKS-RECHTS', field: 'heroOffsetX' as const, val: flyer.heroOffsetX },
                      { label: 'BOVEN-ONDER', field: 'heroOffsetY' as const, val: flyer.heroOffsetY },
                    ].map(({ label, field, val }) => (
                      <div key={field}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <label style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{label}</label>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', fontWeight: 700 }}>{val}%</span>
                        </div>
                        <input type="range" min={0} max={100} step={1} value={val}
                          onChange={e => onUpdateFlyer({ [field]: Number(e.target.value) })}
                          style={{ width: '100%', accentColor: 'var(--green)' }} />
                      </div>
                    ))}
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
                    <button onClick={() => onUpdateFlyer({ logoData: null })} style={{ fontSize: '12px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>Verwijderen</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky preview sidebar */}
          <div style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>Preview</div>
            {flyer.dubbelzijdig && (
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['voor', 'achter'] as const).map(side => (
                  <button key={side} onClick={() => onSetPreviewSide(side)}
                    style={{
                      flex: 1, padding: '6px',
                      border: `2px solid ${previewSide === side ? 'var(--green)' : 'var(--line)'}`,
                      borderRadius: 'var(--radius)',
                      background: previewSide === side ? 'var(--green-bg)' : 'var(--paper)',
                      cursor: 'pointer', fontSize: '11px', fontFamily: 'var(--font-mono)',
                      fontWeight: previewSide === side ? 700 : 400,
                      color: previewSide === side ? 'var(--green-dim)' : 'var(--muted)',
                    }}>
                    {side === 'voor' ? 'Voorkant' : 'Achterkant'}
                  </button>
                ))}
              </div>
            )}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div ref={flyerPreviewRef}>
                {(!flyer.dubbelzijdig || previewSide === 'voor')
                  ? <FlyerPreview flyer={flyer} formaat={(flyer.afmeting as 'a6' | 'a5' | 'sq') || 'a5'} onHeroOffsetChange={(x, y) => onUpdateFlyer({ heroOffsetX: x, heroOffsetY: y })} />
                  : <FlyerBackPreview flyer={flyer} formaat={(flyer.afmeting as 'a6' | 'a5' | 'sq') || 'a5'} />
                }
              </div>
              {/* Safe zone overlay */}
              <div style={{
                position: 'absolute', inset: '6px', border: '1px dashed rgba(0,232,122,0.35)',
                borderRadius: '4px', pointerEvents: 'none',
              }} title="Veiligheidszone (3mm van snijrand)" />
            </div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              Veiligheidszone = 3mm van snijrand
            </div>
            <div style={{ padding: '10px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>FORMAAT</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['a6', 'a5'] as const).map(f => (
                  <button key={f} onClick={() => onUpdateFlyer({ afmeting: f })}
                    style={{
                      padding: '4px 10px',
                      border: `1px solid ${flyer.afmeting === f ? 'var(--green)' : 'var(--line)'}`,
                      borderRadius: 'var(--radius)',
                      background: flyer.afmeting === f ? 'var(--green-bg)' : 'var(--paper)',
                      cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)',
                      fontWeight: flyer.afmeting === f ? 700 : 400,
                      color: flyer.afmeting === f ? 'var(--green-dim)' : 'var(--ink)',
                    }}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <FlyerExport
              frontRef={frontPrintRef}
              backRef={backPrintRef}
              formaat={(flyer.afmeting as 'a6' | 'a5' | 'sq') || 'a5'}
              dubbelzijdig={!!flyer.dubbelzijdig}
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
                Print-ready PDF downloaden
              </a>
            )}
            <button onClick={() => onSetPage('wizard')} style={{ width: '100%', padding: '12px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Campagne starten →</button>
          </div>
        </div>
      </div>

      {/* Offscreen print containers for PDF export */}
      <div aria-hidden style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none', opacity: 0 }}>
        <div ref={frontPrintRef} style={{ width: `${PREVIEW_PX.a5.w}px`, height: `${PREVIEW_PX.a5.h}px` }}>
          <FlyerPreview flyer={flyer} formaat="a5" />
        </div>
        {flyer.dubbelzijdig && (
          <div ref={backPrintRef} style={{ width: `${PREVIEW_PX.a5.w}px`, height: `${PREVIEW_PX.a5.h}px` }}>
            <FlyerBackPreview flyer={flyer} formaat="a5" />
          </div>
        )}
      </div>
    </>
  );
}

/**
 * TemplateMarketplace -- horizontal card strip of branche-specific flyer
 * presets. Clicking a card applies the preset's patch to the active flyer,
 * preserving bedrijfsnaam / logo / contact fields. Filter toggle between
 * branche-specific and all presets.
 */
function TemplateMarketplace({
  flyer,
  onUpdateFlyer,
}: {
  flyer: FlyerState;
  onUpdateFlyer: (patch: Partial<FlyerState>) => void;
}): React.JSX.Element {
  const [showAll, setShowAll] = useState(false);

  // Guess branche from bedrijfsnaam or slogan (crude but beats nothing);
  // the wizard's BRANCHE_OPTIES don't hit this component directly.
  const guess = (flyer.slogan + ' ' + flyer.bedrijfsnaam + ' ' + flyer.tekst).toLowerCase();
  const detectedBranche: FlyerPreset['branche'] =
    guess.includes('kap') ? 'kapper' :
    guess.includes('bakker') ? 'bakker' :
    guess.includes('restaurant') || guess.includes('cafe') ? 'restaurant' :
    guess.includes('install') ? 'installateur' :
    guess.includes('makelaar') ? 'makelaar' :
    guess.includes('fysio') ? 'fysio' :
    'generic';

  const presets = showAll ? FLYER_PRESETS : presetsForBranche(detectedBranche);

  function applyPreset(p: FlyerPreset): void {
    onUpdateFlyer(p.patch);
  }

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>Template marketplace</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            {showAll ? 'Alle templates' : `Templates voor ${detectedBranche === 'generic' ? 'jouw branche' : detectedBranche}`} -- één klik om toe te passen
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          style={{
            padding: '6px 12px', background: 'transparent', border: '1px solid var(--line)',
            borderRadius: 'var(--radius)', cursor: 'pointer',
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)',
          }}
        >
          {showAll ? 'Toon alleen mijn branche' : 'Toon alle templates'}
        </button>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '10px', marginTop: '14px',
      }}>
        {presets.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p)}
            aria-label={`Pas template ${p.label} toe`}
            style={{
              display: 'flex', flexDirection: 'column', gap: '8px',
              padding: '10px', background: 'var(--paper)',
              border: '1px solid var(--line)', borderRadius: 'var(--radius)',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', gap: '4px', height: '42px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ flex: 3, background: p.swatch[0] }} />
              <div style={{ flex: 1, background: p.swatch[1] }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>{p.label}</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px', lineHeight: 1.4 }}>
                {p.tagline}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
