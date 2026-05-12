'use client';

/**
 * FlyerPreview -- 5 welcome-to-the-neighborhood templates rendered into
 * the A5/A6/SQ postcard canvas. Used in the editor and the wizard
 * print-preview.
 *
 * Sizing is deliberately tight: the A5 print canvas is 231 x 324 CSS px
 * (1.5 px/mm) which means hero + headline + body + 3 USPs + CTA-row +
 * footer must all fit under ~324 px before the design clips. Recent
 * iterations of the layout overflowed when users filled every field;
 * this version trims every numeric down a step (smaller fonts, tighter
 * margins, leaner hero heights) so the worst-case "all fields filled"
 * flyer still lands inside the canvas.
 */

import { useState } from 'react';
import {
  PREVIEW_PX,
  previewPxForFormaat,
  heroHeightForCanvas,
  bodyClampForCanvas,
  uspLimitForCanvas,
} from '@/lib/flyer-export-math';
import { FlyerQrCode } from './FlyerQrCode';

// ─── Legacy design ID migration ───────────────────────────────────────────────

/** The 5 active welcome templates. */
export const VALID_DESIGNS = ['editorial', 'warm', 'bold', 'minimal', 'playful'] as const;

const LEGACY_DESIGN_MAP: Record<string, FlyerState['design']> = {
  geometric: 'editorial',
  retro: 'playful',
  neon: 'bold',
  corporate: 'minimal',
};

export function migrateDesignId(raw: string): FlyerState['design'] {
  if (raw in LEGACY_DESIGN_MAP) return LEGACY_DESIGN_MAP[raw];
  return (VALID_DESIGNS as readonly string[]).includes(raw)
    ? (raw as FlyerState['design'])
    : 'editorial';
}

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
  design: 'editorial' | 'warm' | 'bold' | 'minimal' | 'playful';
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

// ─── FlyerPreview ─────────────────────────────────────────────────────────────

export default function FlyerPreview({ flyer, formaat = 'a5', onHeroOffsetChange, forPrint = false }: {
  flyer: FlyerState;
  formaat?: 'a6' | 'a5' | 'sq';
  onHeroOffsetChange?: (x: number, y: number) => void;
  forPrint?: boolean;
}): React.JSX.Element | null {
  const usps = flyer.usp ? flyer.usp.split('\n').filter(Boolean).slice(0, uspLimitForCanvas(3, formaat)) : [];
  const naam = flyer.bedrijfsnaam || 'Jouw Bedrijfsnaam';
  const tekst = flyer.tekst || 'Wij heten je van harte welkom als nieuwe bewoner. Kom langs en ontdek wat wij voor jou kunnen betekenen in de buurt.';
  const initials = naam.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  const ox = flyer.heroOffsetX ?? 50;
  const oy = flyer.heroOffsetY ?? 50;
  const hs = flyer.heroScale ?? 100;
  const showFrontQr = flyer.qrPlaats === 'voor' || flyer.qrPlaats === 'beide';

  const handleHeroDrag = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!onHeroOffsetChange) return;
    e.preventDefault();
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const onMove = (mv: MouseEvent) => {
      const dx = ((mv.clientX - startX) / rect.width) * 100;
      const dy = ((mv.clientY - startY) / rect.height) * 100;
      onHeroOffsetChange(Math.max(0, Math.min(100, ox - dx)), Math.max(0, Math.min(100, oy - dy)));
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

  const pxDims = previewPxForFormaat(formaat);
  const a5Dims = PREVIEW_PX.a5;
  const isSquare = formaat === 'sq';
  const zoomRatio = formaat === 'a6' ? pxDims.w / a5Dims.w : 1;
  const canvasW = isSquare ? pxDims.w : a5Dims.w;
  const canvasH = isSquare ? pxDims.h : a5Dims.h;
  const heroH = (a5Px: number) => heroHeightForCanvas(a5Px, formaat);
  const bodyN = (a5Lines: number) => bodyClampForCanvas(a5Lines, formaat);
  const base: React.CSSProperties = {
    width: `${canvasW}px`, height: `${canvasH}px`, overflow: 'hidden',
    position: 'relative', flexShrink: 0, fontFamily: 'var(--font-sans)',
    ...(forPrint
      ? {}
      : { borderRadius: '8px', boxShadow: '0 12px 40px rgba(0,0,0,0.35)', zoom: zoomRatio }),
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

  const Qr = (opts: { size?: number; fg: string; bg: string }) =>
    <FlyerQrCode website={flyer.website} email={flyer.email} telefoon={flyer.telefoon} size={opts.size ?? 42} fg={opts.fg} bg={opts.bg} />;

  // ── 1. EDITORIAL ────────────────────────────────────────────────────────────
  if (flyer.design === 'editorial') {
    const headline = flyer.headline || 'Welkom in de buurt.';
    return (
      <div style={{ ...base, background: flyer.kleur, display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '7px', background: flyer.accent, zIndex: 1 }} />
        <div style={{ flex: 1, padding: '14px 16px 0 20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', letterSpacing: '0.18em', color: flyer.accent, textTransform: 'uppercase' }}>
              Welkom in de buurt
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6px', color: 'rgba(255,255,255,0.42)', letterSpacing: '0.1em' }}>
              VOOR NIEUWE BUREN
            </div>
          </div>
          {flyer.heroImageUrl && (
            <div style={{ position: 'relative', marginBottom: '8px', borderRadius: '3px', overflow: 'hidden', flexShrink: 0, height: `${heroH(56)}px` }}>
              <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle(`${heroH(56)}px`), borderRadius: '3px' }} onMouseDown={handleHeroDrag} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.45) 100%)' }} />
              {dragOverlay}
            </div>
          )}
          <div data-headline-clamp="true" style={{ fontFamily: 'var(--font-serif)', fontSize: flyer.heroImageUrl ? '20px' : '26px', fontWeight: 400, color: '#fff', lineHeight: 1.0, marginBottom: '4px', letterSpacing: '-0.03em', flexShrink: 0, ...clampStyle(flyer.heroImageUrl ? 2 : 3) }}>
            {headline}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', flexShrink: 0, ...ellipsisStyle }}>
            Van {naam}
          </div>
          <div style={{ width: '28px', height: '2px', background: flyer.accent, marginBottom: '6px', flexShrink: 0 }} />
          <div style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '6px', ...clampStyle(bodyN(3)), flexShrink: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '6px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  <span style={{ color: flyer.accent, fontSize: '8.5px', lineHeight: 1.4, flexShrink: 0, fontWeight: 700 }}>+</span>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '7.5px', lineHeight: 1.4, ...ellipsisStyle }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', flexShrink: 0, paddingBottom: '8px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>
                Welkomstaanbieding
              </div>
              <div style={{ display: 'inline-block', background: flyer.accent, borderRadius: '2px', padding: '4px 9px' }}>
                <span style={{ fontSize: '8px', fontWeight: 800, color: flyer.kleur, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{ctaText}</span>
              </div>
            </div>
            {showFrontQr && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <Qr size={42} fg="#fff" bg={flyer.kleur} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '5.5px', color: flyer.accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Scan & ontdek
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '7px 16px 12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '8.5px', color: '#fff', letterSpacing: '0.01em', ...ellipsisStyle }}>{naam}</div>
            {flyer.website && <div style={{ fontSize: '6.5px', color: flyer.accent, fontFamily: 'var(--font-mono)', marginTop: '1px', ...ellipsisStyle }}>{flyer.website}</div>}
          </div>
          {flyer.logoData
            ? <AdaptiveLogo src={flyer.logoData} baseSize={22} style={{ borderRadius: '3px' }} />
            : <div style={{ width: '22px', height: '22px', background: flyer.accent, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: flyer.kleur, fontWeight: 900, fontSize: '8.5px' }}>{initials}</div>
          }
        </div>
      </div>
    );
  }

  // ── 2. WARM ─────────────────────────────────────────────────────────────────
  if (flyer.design === 'warm') {
    const headline = flyer.headline || 'Hoi nieuwe buur!';
    const bg = '#FFF8F0';
    return (
      <div style={{ ...base, background: bg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: flyer.kleur, borderRadius: '0 0 32px 0', padding: '14px 16px 16px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: '-18px', right: '-18px', width: '76px', height: '76px', borderRadius: '50%', background: flyer.accent, opacity: 0.22 }} />
          {flyer.heroImageUrl && (
            <div style={{ position: 'relative', marginBottom: '8px', borderRadius: '8px', overflow: 'hidden', height: `${heroH(50)}px` }}>
              <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle(`${heroH(50)}px`), borderRadius: '8px' }} onMouseDown={handleHeroDrag} />
              {dragOverlay}
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', color: flyer.accent, letterSpacing: '0.18em', marginBottom: '4px', textTransform: 'uppercase' }}>
            Welkom in de buurt
          </div>
          <div data-headline-clamp="true" style={{ fontFamily: 'var(--font-serif)', fontSize: '21px', color: '#fff', lineHeight: 1.0, letterSpacing: '-0.02em', fontWeight: 700, ...clampStyle(2) }}>
            {headline}
          </div>
        </div>
        <div style={{ padding: '12px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px', flexShrink: 0 }}>
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={20} style={{ borderRadius: '50%', flexShrink: 0 }} />
              : <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: flyer.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7.5px', fontWeight: 900, color: flyer.kleur }}>{initials}</div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '9.5px', fontWeight: 700, color: flyer.kleur, ...ellipsisStyle }}>{naam}</div>
              <div style={{ fontSize: '7px', color: '#9a8775', fontStyle: 'italic', ...ellipsisStyle }}>al jaren in de buurt</div>
            </div>
          </div>
          <div style={{ fontSize: '7.5px', color: '#5a4a3a', lineHeight: 1.5, marginBottom: '6px', ...clampStyle(bodyN(3)), flexShrink: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '6px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center', background: `${flyer.accent}1f`, borderRadius: '5px', padding: '3px 8px' }}>
                  <span style={{ fontSize: '8px', color: flyer.accent, flexShrink: 0, lineHeight: 1 }}>&#9829;</span>
                  <span style={{ fontSize: '7.5px', color: '#5a4a3a', lineHeight: 1.35, ...ellipsisStyle }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ background: flyer.accent, borderRadius: '18px', padding: '5px 12px', display: 'inline-block' }}>
                <span style={{ fontSize: '8px', fontWeight: 800, color: flyer.kleur, fontFamily: 'var(--font-mono)' }}>{ctaText}</span>
              </div>
            </div>
            {showFrontQr && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <Qr size={44} fg={flyer.kleur} bg="#fff" />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '5.5px', color: '#9a8775', letterSpacing: '0.06em' }}>Scan om kennis te maken</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: '5px 16px 12px', borderTop: `1px solid ${flyer.accent}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: '6px' }}>
          {flyer.website && <span style={{ fontSize: '6.5px', color: '#9a8775', fontFamily: 'var(--font-mono)', flex: 1, minWidth: 0, ...ellipsisStyle }}>{flyer.website}</span>}
          {flyer.telefoon && <span style={{ fontSize: '6.5px', color: '#9a8775', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{flyer.telefoon}</span>}
        </div>
      </div>
    );
  }

  // ── 3. BOLD ─────────────────────────────────────────────────────────────────
  if (flyer.design === 'bold') {
    const headline = flyer.headline || 'Nieuw hier?';
    return (
      <div style={{ ...base, background: flyer.kleur, display: 'flex', flexDirection: 'column' }}>
        {flyer.heroImageUrl ? (
          <div style={{ position: 'relative', height: `${heroH(100)}px`, overflow: 'hidden', flexShrink: 0 }}>
            <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle(`${heroH(100)}px`) }} onMouseDown={handleHeroDrag} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)' }} />
            {dragOverlay}
            <div style={{ position: 'absolute', top: '10px', left: '12px', background: flyer.accent, borderRadius: '2px', padding: '3px 7px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', fontWeight: 800, color: flyer.kleur, letterSpacing: '0.12em' }}>NIEUW IN DE BUURT</span>
            </div>
            <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px' }}>
              <div data-headline-clamp="true" style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.6)', ...clampStyle(2) }}>{headline}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, marginTop: '3px', letterSpacing: '0.06em', ...ellipsisStyle }}>Welkom van {naam}</div>
            </div>
          </div>
        ) : (
          <div style={{ height: `${heroH(100)}px`, background: flyer.accent, padding: '12px 14px 14px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: '-25px', right: '-25px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.16em', color: flyer.kleur, opacity: 0.72, marginBottom: '5px', textTransform: 'uppercase' }}>Nieuw in de buurt</div>
            <div data-headline-clamp="true" style={{ fontFamily: 'var(--font-serif)', fontSize: '25px', fontWeight: 700, color: flyer.kleur, lineHeight: 1.0, letterSpacing: '-0.02em', ...clampStyle(2) }}>{headline}</div>
          </div>
        )}
        <div style={{ padding: '10px 14px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '30px', height: '3px', background: flyer.accent, marginBottom: '6px', borderRadius: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5, marginBottom: '6px', ...clampStyle(bodyN(3)), flexShrink: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '6px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
                  <div style={{ width: '11px', height: '11px', background: flyer.accent, borderRadius: '2px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '6.5px', color: flyer.kleur, fontWeight: 900 }}>&#10003;</span>
                  </div>
                  <span style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.85)', ...ellipsisStyle }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ background: flyer.accent, padding: '5px 10px', borderRadius: '2px', display: 'inline-block' }}>
                <span style={{ fontSize: '8px', fontWeight: 800, color: flyer.kleur, fontFamily: 'var(--font-mono)' }}>{ctaText}</span>
              </div>
            </div>
            {showFrontQr && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <Qr size={44} fg={flyer.kleur} bg={flyer.accent} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '5.5px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>Scan voor info</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '7px 14px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '8.5px', color: '#fff', ...ellipsisStyle }}>{naam}</div>
            {flyer.website && <div style={{ fontSize: '6.5px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)', ...ellipsisStyle }}>{flyer.website}</div>}
          </div>
          {flyer.logoData && <AdaptiveLogo src={flyer.logoData} baseSize={20} style={{ borderRadius: '2px' }} />}
        </div>
      </div>
    );
  }

  // ── 4. MINIMAL ──────────────────────────────────────────────────────────────
  if (flyer.design === 'minimal') {
    const headline = flyer.headline || 'Welkom thuis.';
    return (
      <div style={{ ...base, background: '#faf9f7', display: 'flex', flexDirection: 'column' }}>
        {flyer.heroImageUrl ? (
          <div style={{ position: 'relative', height: `${heroH(78)}px`, overflow: 'hidden', flexShrink: 0 }}>
            <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle(`${heroH(78)}px`) }} onMouseDown={handleHeroDrag} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(250,249,247,0.95))' }} />
            {dragOverlay}
          </div>
        ) : (
          <div style={{ height: '4px', background: flyer.accent, flexShrink: 0 }} />
        )}
        <div style={{ padding: flyer.heroImageUrl ? '3px 20px 0' : '16px 20px 0', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '7px', marginBottom: '8px', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '11px', color: flyer.kleur, letterSpacing: '0.02em', ...ellipsisStyle }}>{naam}</div>
              {flyer.slogan && <div style={{ fontSize: '6.5px', color: '#999', marginTop: '2px', letterSpacing: '0.1em', textTransform: 'uppercase', ...ellipsisStyle }}>{flyer.slogan}</div>}
            </div>
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={24} />
              : <div style={{ width: '24px', height: '24px', border: `1px solid ${flyer.kleur}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8.5px', fontWeight: 700, color: flyer.kleur, flexShrink: 0 }}>{initials}</div>
            }
          </div>
          <div data-headline-clamp="true" style={{ fontFamily: 'var(--font-serif)', fontSize: flyer.heroImageUrl ? '20px' : '25px', fontWeight: 300, color: flyer.kleur, lineHeight: 1.05, marginBottom: '3px', letterSpacing: '-0.02em', flexShrink: 0, ...clampStyle(2) }}>
            {headline}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', color: flyer.accent, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '6px', flexShrink: 0 }}>
            Welkom in de buurt
          </div>
          <div style={{ width: '18px', height: '1px', background: flyer.kleur, marginBottom: '6px', flexShrink: 0 }} />
          <div style={{ fontSize: '7.5px', color: '#555', lineHeight: 1.5, marginBottom: '6px', ...clampStyle(bodyN(3)), flexShrink: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '6px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: flyer.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: '7.5px', color: '#666', ...ellipsisStyle }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', flexShrink: 0, paddingBottom: '8px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', borderBottom: `1.5px solid ${flyer.accent}`, paddingBottom: '2px' }}>
                <span style={{ fontSize: '8px', fontWeight: 700, color: flyer.kleur, letterSpacing: '0.04em' }}>{ctaText}</span>
                <span style={{ fontSize: '8px', color: flyer.accent, fontWeight: 700 }}>&#8594;</span>
              </div>
            </div>
            {showFrontQr && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <Qr size={42} fg={flyer.kleur} bg="#faf9f7" />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '5.5px', color: '#aaa', letterSpacing: '0.08em' }}>scan</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: '6px 20px 12px', borderTop: '1px solid #e8e6e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          {flyer.website && <span style={{ fontSize: '6.5px', color: '#999', fontFamily: 'var(--font-mono)' }}>{flyer.website}</span>}
          {flyer.telefoon && <span style={{ fontSize: '6.5px', color: '#999', fontFamily: 'var(--font-mono)' }}>{flyer.telefoon}</span>}
        </div>
      </div>
    );
  }

  // ── 5. PLAYFUL ──────────────────────────────────────────────────────────────
  if (flyer.design === 'playful') {
    const headline = flyer.headline || 'Hallo nieuwe buur!';
    const bg = '#FFFBF0';
    return (
      <div style={{ ...base, background: bg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: `linear-gradient(125deg, ${flyer.kleur} 0%, ${flyer.accent} 100%)`, padding: '12px 16px 14px', borderRadius: '0 0 26px 0', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
          <div style={{ position: 'absolute', bottom: '-16px', right: '22px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.8)', marginBottom: '4px', textTransform: 'uppercase' }}>Welkom in onze buurt</div>
          <div data-headline-clamp="true" style={{ fontFamily: 'var(--font-serif)', fontSize: '21px', color: '#fff', lineHeight: 1.0, fontWeight: 700, letterSpacing: '-0.02em', ...clampStyle(2) }}>{headline}</div>
        </div>
        <div style={{ padding: '10px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'inline-block', background: flyer.kleur, borderRadius: '16px', padding: '3px 10px', marginBottom: '7px', maxWidth: '100%', alignSelf: 'flex-start', flexShrink: 0 }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', ...ellipsisStyle, display: 'block' }}>{naam}</span>
          </div>
          {flyer.heroImageUrl && (
            <div style={{ position: 'relative', marginBottom: '6px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, height: `${heroH(44)}px` }}>
              <img src={flyer.heroImageUrl} alt="" role="presentation" style={{ ...heroImgStyle(`${heroH(44)}px`), borderRadius: '8px' }} onMouseDown={handleHeroDrag} />
              {dragOverlay}
            </div>
          )}
          <div style={{ fontSize: '7.5px', color: '#555', lineHeight: 1.5, marginBottom: '6px', ...clampStyle(bodyN(3)), flexShrink: 0 }}>{tekst}</div>
          {usps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '6px', flexShrink: 0 }}>
              {usps.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center', background: `${flyer.accent}22`, borderRadius: '7px', padding: '3px 8px' }}>
                  <span style={{ fontSize: '9px', color: flyer.accent, lineHeight: 1 }}>&#9733;</span>
                  <span style={{ fontSize: '7.5px', color: '#444', fontWeight: 500, ...ellipsisStyle }}>{u}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ background: `linear-gradient(90deg, ${flyer.kleur}, ${flyer.accent})`, borderRadius: '18px', padding: '5px 12px', display: 'inline-block' }}>
                <span style={{ fontSize: '8px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>{ctaText}</span>
              </div>
            </div>
            {showFrontQr && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <div style={{ padding: '2px', background: '#fff', borderRadius: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                  <Qr size={40} fg={flyer.kleur} bg="#fff" />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '5.5px', color: '#aaa', letterSpacing: '0.06em' }}>Scan & hallo</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: '5px 16px 12px', background: `${flyer.kleur}08`, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: '6px' }}>
          {flyer.website && <span style={{ fontSize: '6.5px', color: '#999', fontFamily: 'var(--font-mono)', flex: 1, minWidth: 0, ...ellipsisStyle }}>{flyer.website}</span>}
          {flyer.logoData
            ? <AdaptiveLogo src={flyer.logoData} baseSize={18} style={{ borderRadius: '50%' }} />
            : <div style={{ width: '18px', height: '18px', background: flyer.kleur, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6.5px', fontWeight: 900, color: '#fff', flexShrink: 0 }}>{initials}</div>
          }
        </div>
      </div>
    );
  }

  return null;
}
