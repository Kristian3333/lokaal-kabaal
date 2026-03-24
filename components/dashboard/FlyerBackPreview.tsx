'use client';

/**
 * FlyerBackPreview -- renders the back face of a dubbelzijdig flyer.
 * Matches the design of FlyerPreview with contact info, opening hours, and QR code.
 */

import { PREVIEW_PX } from '@/components/FlyerExport';
import { AdaptiveLogo, QrCode, type FlyerState } from '@/components/dashboard/FlyerPreview';

/**
 * Renders the back side of a flyer in the matching design style.
 */
export default function FlyerBackPreview({ flyer, formaat = 'a5' }: {
  flyer: FlyerState;
  formaat?: 'a6' | 'a5' | 'sq';
}): React.JSX.Element {
  const naam = flyer.bedrijfsnaam || 'Jouw Bedrijfsnaam';
  const initials = naam.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  const adres = flyer.adres || '';
  const urenLines = flyer.openingstijden ? flyer.openingstijden.split('\n').filter(Boolean).slice(0, 4) : [];
  const backTekst = flyer.backTekst || 'Vragen? Wij helpen je graag verder.';

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

  const contactRows = [
    flyer.telefoon && { icon: '&#9742;', v: flyer.telefoon },
    flyer.email && { icon: '&#10003;', v: flyer.email },
    flyer.website && { icon: '&#8853;', v: flyer.website },
    adres && { icon: '&#8982;', v: adres },
  ].filter(Boolean) as { icon: string; v: string }[];

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
                <span style={{ color: flyer.accent, fontSize: '9px', flexShrink: 0, width: '12px', textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: c.icon }} />
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
                  <span style={{ color: flyer.kleur, fontSize: '7px' }} dangerouslySetInnerHTML={{ __html: c.icon }} />
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
            {(flyer.qrPlaats === 'achter' || flyer.qrPlaats === 'beide') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <QrCode size={40} fg={flyer.kleur} bg="#f5f4f0" />
                <div style={{ fontSize: '6px', color: '#aaa', fontFamily: 'var(--font-mono)' }}>Scan mij</div>
              </div>
            )}
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
                <span style={{ fontSize: '8px', color: '#bbb', fontFamily: 'var(--font-mono)', width: '12px', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: c.icon }} />
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
            {(flyer.qrPlaats === 'achter' || flyer.qrPlaats === 'beide') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <QrCode size={36} fg={flyer.kleur} bg="#faf9f7" />
                <div style={{ fontSize: '6px', color: '#bbb', fontFamily: 'var(--font-mono)' }}>website</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Generic fallback for remaining designs
  return (
    <div style={{ ...base, background: flyer.kleur, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: '#fff', opacity: 0.5 }}>Achterkant</div>
      {contactRows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '80%' }}>
          {contactRows.map((c, i) => (
            <div key={i} style={{ fontSize: '8px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>{c.v}</div>
          ))}
        </div>
      )}
    </div>
  );
}
