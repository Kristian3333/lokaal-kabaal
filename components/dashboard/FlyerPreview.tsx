'use client';

/**
 * FlyerPreview -- renders a live preview of a flyer in one of 9 designs.
 * Used in the flyer editor and in wizard step 7.
 */

import { useState } from 'react';
import { PREVIEW_PX } from '@/components/FlyerExport';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FlyerState {
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

// ─── AdaptiveLogo ─────────────────────────────────────────────────────────────

/**
 * Renders a logo image that adapts its dimensions to preserve the natural aspect ratio.
 */
export function AdaptiveLogo({ src, baseSize, style, alt }: {
  src: string;
  baseSize: number;
  style?: React.CSSProperties;
  alt?: string;
}): React.JSX.Element {
  const [aspect, setAspect] = useState<number>(1);
  const targetArea = baseSize * baseSize * 1.5;
  const rawW = Math.sqrt(targetArea * aspect);
  const w = Math.round(Math.min(rawW, baseSize * 3));
  const h = Math.round(w / aspect);
  const imgStyle: React.CSSProperties = {
    width: w,
    height: h,
    maxWidth: `${baseSize * 3}px`,
    objectFit: 'contain' as const,
    flexShrink: 1,
    ...style,
  };
  return (
    <img
      src={src}
      alt={alt ?? 'Logo'}
      style={imgStyle}
      onLoad={e => {
        const img = e.currentTarget;
        if (img.naturalWidth && img.naturalHeight) setAspect(img.naturalWidth / img.naturalHeight);
      }}
    />
  );
}

// ─── QR Code (decorative placeholder) ────────────────────────────────────────

/**
 * Renders a decorative QR code pattern. Not a real QR code -- purely visual.
 */
export function QrCode({ size = 40, fg = '#000', bg = 'transparent' }: {
  size?: number;
  fg?: string;
  bg?: string;
}): React.JSX.Element {
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

// ─── FlyerPreview ─────────────────────────────────────────────────────────────

/**
 * Renders the front face of a flyer in one of 9 designs.
 * Supports draggable hero image repositioning.
 */
export default function FlyerPreview({ flyer, formaat = 'a5', onHeroOffsetChange }: {
  flyer: FlyerState;
  formaat?: 'a6' | 'a5' | 'sq';
  onHeroOffsetChange?: (x: number, y: number) => void;
}): React.JSX.Element | null {
  const usps = flyer.usp ? flyer.usp.split('\n').filter(Boolean).slice(0, 3) : [];
  const naam = flyer.bedrijfsnaam || 'Jouw Bedrijfsnaam';
  const tekst = flyer.tekst || 'Wij heten je van harte welkom als nieuwe bewoner. Kom eens langs en ontdek wat wij voor jou kunnen betekenen in de buurt.';
  const initials = naam.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  const ox = flyer.heroOffsetX ?? 50;
  const oy = flyer.heroOffsetY ?? 50;
  const hs = flyer.heroScale ?? 100;

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

  const heroImgStyle = (h: string): React.CSSProperties => {
    const scalePct = hs / 100;
    return {
      width: scalePct === 1 ? '100%' : `${scalePct * 100}%`,
      height: scalePct === 1 ? h : `calc(${h} * ${scalePct})`,
      maxWidth: 'none',
      objectFit: 'cover' as const,
      display: 'block',
      objectPosition: `${ox}% ${oy}%`,
      marginLeft: scalePct === 1 ? 0 : `${-(scalePct - 1) * 50}%`,
      marginTop: scalePct === 1 ? 0 : `calc(${h} * ${-(scalePct - 1) * 0.5})`,
      cursor: onHeroOffsetChange ? 'grab' : 'default',
      userSelect: 'none' as const,
    };
  };

  const pxDims = PREVIEW_PX[formaat] ?? PREVIEW_PX['a5'];
  const a5Dims = PREVIEW_PX['a5'];
  const isA6 = formaat === 'a6';
  const zoomRatio = isA6 ? pxDims.w / a5Dims.w : 1;
  const base: React.CSSProperties = {
    width: `${a5Dims.w}px`, height: `${a5Dims.h}px`, borderRadius: '8px', overflow: 'hidden',
    position: 'relative', flexShrink: 0, fontFamily: 'var(--font-sans)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
    zoom: zoomRatio,
  };

  const ctaText = flyer.cta || '10% welkomstkorting';
  const clampStyle = (lines: number): React.CSSProperties => ({
    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical' as const,
  });
  const ellipsisStyle: React.CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
  const dragOverlay = onHeroOffsetChange ? (
    <div data-html2canvas-ignore="true" style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.52)', borderRadius: '3px', padding: '2px 5px', pointerEvents: 'none', zIndex: 2 }}>
      <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-mono)' }}>&#8597; sleep</span>
    </div>
  ) : null;

  if (flyer.design === 'editorial') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    return (
      <div style={{ ...base, background: flyer.kleur, display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '10px', background: flyer.accent, zIndex: 1 }} />
        <div style={{ flex: 1, padding: '18px 16px 0 22px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.18em', color: flyer.accent, textTransform: 'uppercase', marginBottom: '10px', opacity: 0.9, flexShrink: 0 }}>
            Nieuwe bewoners &middot; Welkomst
          </div>
          {flyer.heroImageUrl ? (
            <>
              <div style={{ position: 'relative', marginBottom: '8px', borderRadius: '3px', overflow: 'hidden', flexShrink: 0, height: '85px' }}>
                <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle('85px'), borderRadius: '3px' }} onMouseDown={handleHeroDrag} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.35) 100%)', pointerEvents: 'none' }} />
                {dragOverlay}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: '#fff', lineHeight: 1.05, marginBottom: '6px', letterSpacing: '-0.02em', flexShrink: 0, ...clampStyle(2) }}>
                {headline}
              </div>
            </>
          ) : (
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '30px', fontWeight: 400, color: '#fff', lineHeight: 1.0, marginBottom: '10px', letterSpacing: '-0.03em', flexShrink: 0, ...clampStyle(3) }}>
              {headline.split(' ').slice(0, 2).join(' ')}<br />
              <em style={{ color: flyer.accent, fontStyle: 'italic' }}>{headline.split(' ').slice(2).join(' ') || 'de buurt.'}</em>
            </div>
          )}
          <div style={{ width: '28px', height: '2px', background: flyer.accent, marginBottom: '8px', flexShrink: 0 }} />
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: '8px', ...clampStyle(4), flexShrink: 1, minHeight: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
                  <span style={{ color: flyer.accent, fontSize: '9px', lineHeight: 1.4, flexShrink: 0, fontWeight: 700 }}>&#8250;</span>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '8px', lineHeight: 1.4, ...ellipsisStyle }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'inline-block', background: flyer.accent, borderRadius: '2px', padding: '5px 10px', flexShrink: 0 }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: flyer.kleur, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{ctaText}</span>
          </div>
        </div>
        <div style={{ borderTop: `1px solid rgba(255,255,255,0.08)`, padding: '9px 16px 9px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontWeight: 800, fontSize: '9px', color: '#fff', letterSpacing: '0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{naam}</div>
            {flyer.website && <div style={{ fontSize: '7px', color: flyer.accent, fontFamily: 'var(--font-mono)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{flyer.website}</div>}
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

  if (flyer.design === 'geometric') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    return (
      <div style={{ ...base, background: '#f5f4f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', bottom: '40px', left: '-50px', width: '180px', height: '180px', borderRadius: '50%', background: flyer.kleur, opacity: 0.06 }} />
        <div style={{ position: 'absolute', bottom: '20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: flyer.accent, opacity: 0.10 }} />
        {flyer.heroImageUrl ? (
          <div style={{ position: 'relative', height: '100px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle('100px') }} onMouseDown={handleHeroDrag} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 30%, ${flyer.kleur}cc 100%)`, pointerEvents: 'none' }} />
            {dragOverlay}
            <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.15em', marginBottom: '3px' }}>WELKOM IN DE BUURT</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#fff', lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.02em', ...clampStyle(2) }}>{headline}</div>
            </div>
          </div>
        ) : (
          <div style={{ background: flyer.kleur, padding: '16px 16px 20px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ position: 'absolute', bottom: '-25px', right: '-15px', width: '80px', height: '80px', borderRadius: '50%', border: `10px solid ${flyer.accent}`, opacity: 0.35 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.14em', marginBottom: '6px' }}>WELKOM IN DE BUURT</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#fff', lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.02em', ...clampStyle(3) }}>{headline}</div>
            {flyer.slogan && <div style={{ fontSize: '8px', color: flyer.accent, marginTop: '4px', fontStyle: 'italic' }}>{flyer.slogan}</div>}
          </div>
        )}
        {flyer.heroImageUrl && (
          <div style={{ background: flyer.kleur, padding: '8px 14px 6px', display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flexShrink: 0 }}>
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={20} />
              : <div style={{ width: '20px', height: '20px', background: flyer.accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 900, color: flyer.kleur, flexShrink: 0 }}>{initials}</div>
            }
            <div style={{ fontWeight: 700, fontSize: '9px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{naam}</div>
          </div>
        )}
        <div style={{ padding: '10px 14px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '8px', color: '#444', lineHeight: 1.65, marginBottom: '10px', ...clampStyle(4), flexShrink: 1, minHeight: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${flyer.kleur}12`, borderRadius: '20px', padding: '5px 10px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: flyer.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: flyer.kleur, fontSize: '7px', fontWeight: 900 }}>&#10003;</span>
                  </div>
                  <span style={{ fontSize: '7.5px', color: flyer.kleur, fontWeight: 600, ...ellipsisStyle }}>{u}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ background: flyer.accent, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '8px', fontWeight: 800, color: flyer.kleur, fontFamily: 'var(--font-mono)' }}>{ctaText}</span>
          {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.kleur} bg="transparent" />}
          <span style={{ fontSize: '7px', color: `${flyer.kleur}bb`, fontFamily: 'var(--font-mono)' }}>{flyer.website || ''}</span>
        </div>
      </div>
    );
  }

  if (flyer.design === 'minimal') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    return (
      <div style={{ ...base, background: '#faf9f7', display: 'flex', flexDirection: 'column' }}>
        {flyer.heroImageUrl ? (
          <div style={{ position: 'relative', height: '110px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle('110px') }} onMouseDown={handleHeroDrag} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(250,249,247,0.95) 100%)', pointerEvents: 'none' }} />
            {dragOverlay}
          </div>
        ) : (
          <div style={{ flexShrink: 0 }}>
            <div style={{ height: '5px', background: flyer.accent }} />
            <div style={{ height: '1px', background: flyer.kleur, margin: '0 20px' }} />
          </div>
        )}
        <div style={{ padding: flyer.heroImageUrl ? '4px 20px 0' : '14px 20px 0', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', color: flyer.kleur, fontWeight: 400, letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{naam}</div>
              {flyer.slogan && <div style={{ fontSize: '7px', color: '#999', marginTop: '2px', letterSpacing: '0.10em', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{flyer.slogan}</div>}
            </div>
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={28} />
              : <div style={{ width: '28px', height: '28px', border: `1px solid ${flyer.kleur}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: flyer.kleur, flexShrink: 0 }}>{initials}</div>
            }
          </div>
          {!flyer.heroImageUrl && <div style={{ height: '1px', background: '#e8e6e0', marginBottom: '12px', flexShrink: 0 }} />}
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: flyer.heroImageUrl ? '19px' : '22px', fontWeight: 400, color: flyer.kleur, lineHeight: 1.1, marginBottom: '5px', letterSpacing: '-0.02em', flexShrink: 0, ...clampStyle(2) }}>
            {headline}
          </div>
          <div style={{ width: '20px', height: '2px', background: flyer.accent, marginBottom: '10px', flexShrink: 0 }} />
          <div style={{ fontSize: '8px', color: '#666', lineHeight: 1.65, marginBottom: '10px', ...clampStyle(4), flexShrink: 1, minHeight: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ borderTop: '1px solid #ede9e3', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: flyer.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: '7.5px', color: '#444', lineHeight: 1.4, ...ellipsisStyle }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', borderBottom: `1.5px solid ${flyer.accent}`, paddingBottom: '1px', flexShrink: 0 }}>
            <span style={{ fontSize: '8px', fontWeight: 700, color: flyer.kleur, letterSpacing: '0.04em' }}>{ctaText}</span>
            <span style={{ fontSize: '8px', color: flyer.accent, fontWeight: 700 }}>&#8594;</span>
          </div>
        </div>
        <div style={{ padding: '7px 20px', borderTop: '1px solid #e8e6e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          {flyer.website && <span style={{ fontSize: '7px', color: '#999', fontFamily: 'var(--font-mono)' }}>{flyer.website}</span>}
          {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.kleur} bg="transparent" />}
          {flyer.telefoon && <span style={{ fontSize: '7px', color: '#999', fontFamily: 'var(--font-mono)' }}>{flyer.telefoon}</span>}
        </div>
      </div>
    );
  }

  if (flyer.design === 'bold') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    return (
      <div style={{ ...base, background: flyer.kleur, display: 'flex', flexDirection: 'column' }}>
        {flyer.heroImageUrl ? (
          <div style={{ position: 'relative', height: '140px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle('140px') }} onMouseDown={handleHeroDrag} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)', pointerEvents: 'none' }} />
            {dragOverlay}
            <div style={{ position: 'absolute', top: '10px', left: '12px', background: flyer.accent, borderRadius: '2px', padding: '3px 7px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', fontWeight: 800, color: flyer.kleur, letterSpacing: '0.1em' }}>NIEUW IN DE BUURT</span>
            </div>
            <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.6)', ...clampStyle(2) }}>{headline}</div>
            </div>
          </div>
        ) : (
          <div style={{ height: '110px', background: flyer.accent, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '14px 16px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.18em', color: flyer.kleur, opacity: 0.75, marginBottom: '5px', textTransform: 'uppercase' }}>Nieuw in de buurt</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, color: flyer.kleur, lineHeight: 1.0, letterSpacing: '-0.02em', ...clampStyle(3) }}>{headline}</div>
          </div>
        )}
        <div style={{ padding: '12px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '36px', height: '3px', background: flyer.accent, marginBottom: '8px', borderRadius: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, marginBottom: '8px', ...clampStyle(3), flexShrink: 1, minHeight: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '13px', height: '13px', background: flyer.accent, borderRadius: '2px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '7px', color: flyer.kleur, fontWeight: 900 }}>&#10003;</span>
                  </div>
                  <span style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.85)', ...ellipsisStyle }}>{u}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ background: flyer.accent, padding: '7px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: flyer.kleur, fontFamily: 'var(--font-mono)' }}>{ctaText}</span>
            {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.kleur} bg="transparent" />}
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={20} style={{ borderRadius: '2px' }} />
              : <span style={{ fontSize: '7px', fontWeight: 700, color: flyer.kleur, fontFamily: 'var(--font-mono)' }}>{flyer.website || ''}</span>
            }
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '5px 16px' }}>
            <div style={{ fontWeight: 700, fontSize: '8px', color: 'rgba(255,255,255,0.7)' }}>{naam}</div>
          </div>
        </div>
      </div>
    );
  }

  if (flyer.design === 'retro') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    const bg = '#F5EDD8';
    return (
      <div style={{ ...base, background: bg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '6px', background: flyer.kleur, flexShrink: 0 }} />
        <div style={{ height: '2px', background: flyer.accent, flexShrink: 0 }} />
        <div style={{ padding: '10px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', flexShrink: 0 }}>
            <div style={{ border: `2px solid ${flyer.kleur}`, borderRadius: '50px', padding: '3px 14px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', letterSpacing: '0.22em', color: flyer.kleur, textTransform: 'uppercase' }}>Welkom &middot; Nieuw in de buurt</span>
            </div>
          </div>
          {flyer.heroImageUrl ? (
            <div style={{ position: 'relative', marginBottom: '8px', border: `2px solid ${flyer.kleur}`, overflow: 'hidden', flexShrink: 0, width: '100%', height: '65px' }}>
              <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle('65px') }} onMouseDown={handleHeroDrag} />
              {dragOverlay}
            </div>
          ) : null}
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: flyer.heroImageUrl ? '18px' : '24px', fontWeight: 700, color: flyer.kleur, lineHeight: 1.0, textAlign: 'center', letterSpacing: '-0.01em', marginBottom: '4px', flexShrink: 0, width: '100%', ...clampStyle(2) }}>{headline}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '7px 0', flexShrink: 0, width: '100%' }}>
            <div style={{ flex: 1, height: '1px', background: flyer.kleur, opacity: 0.25 }} />
            <div style={{ width: '5px', height: '5px', background: flyer.accent, transform: 'rotate(45deg)', flexShrink: 0 }} />
            <div style={{ flex: 1, height: '1px', background: flyer.kleur, opacity: 0.25 }} />
          </div>
          <div style={{ fontSize: '7.5px', color: '#4a3a28', lineHeight: 1.65, marginBottom: '8px', textAlign: 'center', width: '100%', ...clampStyle(3), flexShrink: 1, minHeight: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px', marginBottom: '8px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <span key={i} style={{ fontSize: '7px', background: flyer.kleur, color: bg, padding: '3px 8px', borderRadius: '2px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{u}</span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ background: flyer.accent, borderRadius: '2px', padding: '4px 12px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7.5px', fontWeight: 800, color: flyer.kleur, letterSpacing: '0.06em' }}>{ctaText}</span>
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
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

  if (flyer.design === 'warm') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    const bg = '#FFF8F0';
    return (
      <div style={{ ...base, background: bg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: flyer.kleur, borderRadius: '0 0 36px 0', padding: '15px 16px 18px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '70px', height: '70px', borderRadius: '50%', background: flyer.accent, opacity: 0.22 }} />
          <div style={{ position: 'absolute', bottom: '-25px', left: '10px', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          {flyer.heroImageUrl && (
            <div style={{ position: 'relative', marginBottom: '8px', borderRadius: '8px', overflow: 'hidden', height: '58px' }}>
              <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle('58px'), borderRadius: '8px' }} onMouseDown={handleHeroDrag} />
              {dragOverlay}
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.16em', marginBottom: '5px', textTransform: 'uppercase' }}>Hoi nieuwe buur!</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#fff', lineHeight: 1.05, letterSpacing: '-0.01em', fontWeight: 400, ...clampStyle(2) }}>{headline}</div>
        </div>
        <div style={{ padding: '12px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px', overflow: 'hidden', flexShrink: 0 }}>
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={18} style={{ borderRadius: '50%', flexShrink: 0 }} />
              : <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: flyer.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 900, color: flyer.kleur }}>{initials}</div>
            }
            <div style={{ fontSize: '10px', fontWeight: 700, color: flyer.kleur, ...ellipsisStyle }}>{naam}</div>
          </div>
          <div style={{ fontSize: '8px', color: '#5a4a3a', lineHeight: 1.65, marginBottom: '8px', ...clampStyle(3), flexShrink: 1, minHeight: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'center', background: `${flyer.accent}16`, borderRadius: '6px', padding: '4px 8px' }}>
                  <span style={{ fontSize: '8px', color: flyer.accent, flexShrink: 0, lineHeight: 1 }}>&#9829;</span>
                  <span style={{ fontSize: '7.5px', color: '#5a4a3a', lineHeight: 1.4, ...ellipsisStyle }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ background: flyer.accent, borderRadius: '20px', padding: '6px 14px', display: 'inline-block', flexShrink: 0 }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: flyer.kleur, fontFamily: 'var(--font-mono)' }}>{ctaText}</span>
          </div>
        </div>
        <div style={{ padding: '6px 16px', borderTop: `1px solid ${flyer.accent}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          {flyer.website && <span style={{ fontSize: '7px', color: '#999', fontFamily: 'var(--font-mono)' }}>{flyer.website}</span>}
          {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.kleur} bg="transparent" />}
          {flyer.telefoon && <span style={{ fontSize: '7px', color: '#999', fontFamily: 'var(--font-mono)' }}>{flyer.telefoon}</span>}
        </div>
      </div>
    );
  }

  if (flyer.design === 'neon') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    const bg = '#0A0A12';
    return (
      <div style={{ ...base, background: bg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: flyer.accent, opacity: 0.07, filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '40px', right: '-60px', width: '160px', height: '160px', borderRadius: '50%', background: flyer.kleur, opacity: 0.06, filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ height: '2px', background: `linear-gradient(90deg, transparent 0%, ${flyer.accent} 40%, ${flyer.accent} 60%, transparent 100%)`, boxShadow: `0 0 10px ${flyer.accent}`, flexShrink: 0 }} />
        <div style={{ padding: '14px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexShrink: 0 }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: flyer.accent, boxShadow: `0 0 6px ${flyer.accent}`, flexShrink: 0 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.2em', color: flyer.accent, textTransform: 'uppercase', opacity: 0.9 }}>Nieuwe bewoners</div>
          </div>
          {flyer.heroImageUrl && (
            <div style={{ position: 'relative', marginBottom: '10px', borderRadius: '4px', overflow: 'hidden', border: `1px solid ${flyer.accent}35`, flexShrink: 0, height: '72px' }}>
              <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle('72px') }} onMouseDown={handleHeroDrag} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 35%, ${bg}70)`, pointerEvents: 'none' }} />
              {dragOverlay}
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#fff', lineHeight: 1.05, marginBottom: '6px', letterSpacing: '-0.02em', textShadow: `0 0 20px ${flyer.accent}55`, flexShrink: 0, ...clampStyle(2) }}>{headline}</div>
          <div style={{ height: '1px', background: `linear-gradient(90deg, ${flyer.accent} 0%, transparent 100%)`, marginBottom: '8px', boxShadow: `0 0 5px ${flyer.accent}`, flexShrink: 0 }} />
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, marginBottom: '8px', ...clampStyle(3), flexShrink: 1, minHeight: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: flyer.accent, fontSize: '9px', fontWeight: 900, textShadow: `0 0 8px ${flyer.accent}`, lineHeight: 1 }}>&#8250;</span>
                  <span style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.72)', ...ellipsisStyle }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'inline-block', border: `1px solid ${flyer.accent}`, borderRadius: '3px', padding: '4px 10px', boxShadow: `0 0 8px ${flyer.accent}40, inset 0 0 8px ${flyer.accent}10`, flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', fontWeight: 700, color: flyer.accent, textShadow: `0 0 8px ${flyer.accent}` }}>{ctaText}</span>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${flyer.accent}25`, padding: '7px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${bg}f0`, flexShrink: 0 }}>
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

  if (flyer.design === 'corporate') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    return (
      <div style={{ ...base, background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: flyer.kleur, padding: '13px 16px 11px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', color: flyer.accent, letterSpacing: '0.20em', textTransform: 'uppercase', marginBottom: '5px', opacity: 0.9 }}>Welkomstaanbieding</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', color: '#fff', fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{naam}</div>
            </div>
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={28} style={{ borderRadius: '3px', background: 'rgba(255,255,255,0.1)', padding: '3px' }} />
              : <div style={{ width: '28px', height: '28px', background: flyer.accent, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900, color: flyer.kleur, flexShrink: 0 }}>{initials}</div>
            }
          </div>
        </div>
        <div style={{ height: '3px', background: flyer.accent, flexShrink: 0 }} />
        {flyer.heroImageUrl ? (
          <div style={{ position: 'relative', height: '82px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle('82px') }} onMouseDown={handleHeroDrag} />
            {dragOverlay}
          </div>
        ) : (
          <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: flyer.kleur, lineHeight: 1.1, ...clampStyle(2) }}>{headline}</div>
          </div>
        )}
        <div style={{ padding: '10px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {flyer.heroImageUrl && <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: flyer.kleur, lineHeight: 1.2, marginBottom: '6px', flexShrink: 0, ...clampStyle(2) }}>{headline}</div>}
          <div style={{ width: '24px', height: '2px', background: flyer.accent, marginBottom: '7px', flexShrink: 0 }} />
          <div style={{ fontSize: '7.5px', color: '#444', lineHeight: 1.65, marginBottom: '8px', ...clampStyle(3), flexShrink: 1, minHeight: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', borderLeft: `2px solid ${flyer.accent}`, paddingLeft: '7px' }}>
                  <span style={{ fontSize: '7.5px', color: '#333', fontWeight: 500, ...ellipsisStyle }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ background: flyer.kleur, borderRadius: '2px', padding: '5px 10px', display: 'inline-block', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7.5px', fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>{ctaText}</span>
          </div>
        </div>
        <div style={{ background: '#f4f4f4', borderTop: `2px solid ${flyer.accent}`, padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          {flyer.website && <span style={{ fontSize: '7px', color: '#777', fontFamily: 'var(--font-mono)' }}>{flyer.website}</span>}
          {(flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide') && <QrCode size={26} fg={flyer.kleur} bg="transparent" />}
          {flyer.telefoon && <span style={{ fontSize: '7px', color: '#777', fontFamily: 'var(--font-mono)' }}>{flyer.telefoon}</span>}
        </div>
      </div>
    );
  }

  if (flyer.design === 'playful') {
    const headline = flyer.headline || 'Hoi nieuwe buurman!';
    const bg = '#FFFBF0';
    return (
      <div style={{ ...base, background: bg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: `linear-gradient(125deg, ${flyer.kleur} 0%, ${flyer.accent} 100%)`, padding: '13px 16px 16px', borderRadius: '0 0 28px 0', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ position: 'absolute', bottom: '-15px', right: '20px', width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.75)', marginBottom: '5px', textTransform: 'uppercase' }}>Nieuw in de buurt?</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#fff', lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.01em', ...clampStyle(2) }}>{headline}</div>
        </div>
        <div style={{ padding: '12px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'inline-block', background: flyer.kleur, borderRadius: '20px', padding: '4px 11px', marginBottom: '8px', maxWidth: '100%', flexShrink: 0 }}>
            <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', ...ellipsisStyle, display: 'block' }}>{naam}</span>
          </div>
          {flyer.heroImageUrl && (
            <div style={{ position: 'relative', marginBottom: '8px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, height: '55px' }}>
              <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle('55px'), borderRadius: '10px' }} onMouseDown={handleHeroDrag} />
              {dragOverlay}
            </div>
          )}
          <div style={{ fontSize: '8px', color: '#555', lineHeight: 1.65, marginBottom: '8px', ...clampStyle(3), flexShrink: 1, minHeight: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'center', background: `${flyer.accent}18`, borderRadius: '8px', padding: '4px 9px' }}>
                  <span style={{ fontSize: '9px', color: flyer.accent, lineHeight: 1 }}>&#9733;</span>
                  <span style={{ fontSize: '7.5px', color: '#444', fontWeight: 500, ...ellipsisStyle }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ background: `linear-gradient(90deg, ${flyer.kleur}, ${flyer.accent})`, borderRadius: '20px', padding: '6px 14px', display: 'inline-block', flexShrink: 0 }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>{ctaText}</span>
          </div>
        </div>
        <div style={{ padding: '6px 16px', background: `${flyer.kleur}08`, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
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

  return null;
}
