'use client';

/**
 * FlyerBackPreview -- renders the back face of a flyer (the address side
 * of the postcard) in one of the 5 welcome templates.
 *
 * Print.one prints the recipient address directly onto the right-hand
 * section of postcard products and reserves that zone in their design
 * guidelines (https://help.print.one/designs/design-guides). To stop
 * our contact text colliding with the overlay, every back layout is a
 * two-column composition: left 60% holds the design + contact block,
 * right 40% is the Address Zone -- visible in the editor as a dashed
 * placeholder, blank in the rasterised print output.
 *
 * The 40% reservation is conservative: a typical Dutch address block
 * (name + street + postcode + city) plus the stamp area needs
 * roughly 80-90 mm on an A5 postcard, and 40% of 154 mm = ~62 mm
 * leaves comfortable clearance without losing too much creative
 * surface on the left.
 */

import { PREVIEW_PX, previewPxForFormaat, backLineLimitForCanvas } from '@/lib/flyer-export-math';
import { AdaptiveLogo, type FlyerState } from '@/components/dashboard/FlyerPreview';
import { FlyerQrCode } from '@/components/dashboard/FlyerQrCode';

/** Fraction of canvas width reserved on the right for Print.one's address overlay. */
const ADDRESS_ZONE_PCT = 40;

/**
 * Right-hand zone reserved for Print.one's address overlay. Renders a
 * dashed placeholder in the editor so designers see exactly which area
 * is off-limits, and an invisible spacer at print time so the captured
 * PDF leaves the zone clean for the overlay.
 */
function AddressZone({ forPrint, accent }: { forPrint: boolean; accent: string }): React.JSX.Element {
  if (forPrint) {
    return <div style={{ width: `${ADDRESS_ZONE_PCT}%`, flexShrink: 0 }} />;
  }
  return (
    <div
      data-html2canvas-ignore="true"
      style={{
        width: `${ADDRESS_ZONE_PCT}%`,
        flexShrink: 0,
        borderLeft: '1px dashed #d4d0c8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px 10px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '7px', color: '#b8b4ac', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.6 }}>
        <div style={{ marginBottom: '8px', color: accent, fontWeight: 700, fontSize: '8px' }}>● Adres-zone ●</div>
        <div style={{ fontSize: '6.5px', letterSpacing: '0.06em' }}>
          Print.one drukt<br />hier het adres<br />van de ontvanger
        </div>
      </div>
    </div>
  );
}

/** Renders the back side of a flyer in the matching design style. */
export default function FlyerBackPreview({ flyer, formaat = 'a5', forPrint = false }: {
  flyer: FlyerState;
  formaat?: 'a6' | 'a5' | 'sq';
  forPrint?: boolean;
}): React.JSX.Element {
  const naam = flyer.bedrijfsnaam || 'Jouw Bedrijfsnaam';
  const initials = naam.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  const adres = flyer.adres || '';
  const urenLines = flyer.openingstijden ? flyer.openingstijden.split('\n').filter(Boolean).slice(0, backLineLimitForCanvas(4, formaat)) : [];
  const backTekst = flyer.backTekst || 'Vragen? Wij helpen je graag verder.';
  const showBackQr = flyer.qrPlaats === 'achter' || flyer.qrPlaats === 'beide';

  const pxDims = previewPxForFormaat(formaat);
  const a5Dims = PREVIEW_PX.a5;
  const isSquare = formaat === 'sq';
  const zoomRatio = formaat === 'a6' ? pxDims.w / a5Dims.w : 1;
  const canvasW = isSquare ? pxDims.w : a5Dims.w;
  const canvasH = isSquare ? pxDims.h : a5Dims.h;
  const base: React.CSSProperties = {
    width: `${canvasW}px`, height: `${canvasH}px`, overflow: 'hidden',
    position: 'relative', flexShrink: 0, fontFamily: 'var(--font-sans)',
    display: 'flex',
    ...(forPrint
      ? {}
      : { borderRadius: '8px', boxShadow: '0 12px 40px rgba(0,0,0,0.35)', zoom: zoomRatio }),
  };

  // Note: contact rows EXCLUDES the postal address itself -- that goes in
  // the address zone (printed by Print.one). The recipient already has
  // their address; what they need on a flyer is OUR contact details.
  const contactRows = ([
    flyer.telefoon && { icon: '&#9742;', v: flyer.telefoon },
    flyer.email && { icon: '&#10003;', v: flyer.email },
    flyer.website && { icon: '&#8853;', v: flyer.website },
    adres && { icon: '&#8982;', v: adres },
  ].filter(Boolean) as { icon: string; v: string }[]).slice(0, backLineLimitForCanvas(4, formaat));

  const ellipsisStyle: React.CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

  const Qr = (opts: { size?: number; fg: string; bg: string }) =>
    <FlyerQrCode website={flyer.website} email={flyer.email} telefoon={flyer.telefoon} size={opts.size ?? 50} fg={opts.fg} bg={opts.bg} />;

  // Shared left-column wrapper. All five designs share the same shape:
  // a 60%-wide content column on the left with the design-specific
  // header strip + contact block, followed by the address zone.
  const Frame = ({ bg, children }: { bg: string; children: React.ReactNode }) => (
    <div style={{ ...base, background: bg }}>
      <div style={{ width: `${100 - ADDRESS_ZONE_PCT}%`, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>
      <AddressZone forPrint={forPrint} accent={flyer.accent} />
    </div>
  );

  // ── 1. EDITORIAL — dark elegant ─────────────────────────────────────────────
  if (flyer.design === 'editorial') {
    return (
      <Frame bg={flyer.kleur}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '8px', background: flyer.accent, zIndex: 1 }} />
        <div style={{ padding: '18px 14px 14px 22px', flex: 1, display: 'flex', flexDirection: 'column', color: '#fff', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '12px', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '4px' }}>Contact</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 400, ...ellipsisStyle }}>{naam}</div>
            {flyer.slogan && <div style={{ fontSize: '7.5px', color: flyer.accent, fontFamily: 'var(--font-mono)', marginTop: '2px', ...ellipsisStyle }}>{flyer.slogan}</div>}
          </div>
          <div style={{ width: '24px', height: '2px', background: flyer.accent, marginBottom: '10px', flexShrink: 0 }} />
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '10px', fontStyle: 'italic', color: 'rgba(255,255,255,0.72)', marginBottom: '12px', lineHeight: 1.5, flexShrink: 0 }}>{backTekst}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px', flexShrink: 0 }}>
            {contactRows.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
                <span style={{ color: flyer.accent, fontSize: '8px', flexShrink: 0, width: '10px', textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: c.icon }} />
                <span style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.82)', fontFamily: 'var(--font-mono)', lineHeight: 1.4, wordBreak: 'break-all' }}>{c.v}</span>
              </div>
            ))}
          </div>
          {urenLines.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '7px', marginBottom: '10px', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', color: flyer.accent, letterSpacing: '0.12em', marginBottom: '4px' }}>OPENINGSTIJDEN</div>
              {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', lineHeight: 1.55 }}>{u}</div>)}
            </div>
          )}
          {showBackQr && (
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', paddingTop: '8px' }}>
              <Qr size={54} fg="#fff" bg={flyer.kleur} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', color: flyer.accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Scan voor website</div>
            </div>
          )}
        </div>
      </Frame>
    );
  }

  // ── 2. WARM — cozy cream ────────────────────────────────────────────────────
  if (flyer.design === 'warm') {
    return (
      <Frame bg="#FFF8F0">
        <div style={{ background: flyer.kleur, borderRadius: '0 0 30px 0', padding: '14px 14px 16px 18px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: flyer.accent, opacity: 0.22 }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: flyer.accent, letterSpacing: '0.18em', marginBottom: '4px', textTransform: 'uppercase' }}>Contact</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', color: '#fff', fontWeight: 700, letterSpacing: '-0.01em', ...ellipsisStyle }}>{naam}</div>
        </div>
        <div style={{ padding: '12px 14px 14px 18px', flex: 1, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '10px', fontStyle: 'italic', color: '#9a8775', marginBottom: '12px', lineHeight: 1.5, flexShrink: 0 }}>{backTekst}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px', flexShrink: 0 }}>
            {contactRows.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: `${flyer.accent}1f`, borderRadius: '6px', padding: '4px 8px' }}>
                <span style={{ color: flyer.accent, fontSize: '8px', flexShrink: 0, width: '10px', textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: c.icon }} />
                <span style={{ fontSize: '7.5px', color: '#5a4a3a', fontWeight: 500, wordBreak: 'break-all', lineHeight: 1.3 }}>{c.v}</span>
              </div>
            ))}
          </div>
          {urenLines.length > 0 && (
            <div style={{ background: `${flyer.kleur}0d`, borderRadius: '6px', padding: '7px 9px', marginBottom: '10px', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', color: flyer.accent, letterSpacing: '0.12em', marginBottom: '4px' }}>OPENINGSTIJDEN</div>
              {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7px', color: '#5a4a3a', lineHeight: 1.5 }}>{u}</div>)}
            </div>
          )}
          {showBackQr && (
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <Qr size={54} fg={flyer.kleur} bg="#fff" />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', color: '#9a8775', letterSpacing: '0.06em' }}>Scan om kennis te maken</div>
            </div>
          )}
        </div>
      </Frame>
    );
  }

  // ── 3. BOLD — dark with accent strip ────────────────────────────────────────
  if (flyer.design === 'bold') {
    return (
      <Frame bg={flyer.kleur}>
        <div style={{ background: flyer.accent, padding: '12px 14px 12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', fontWeight: 800, color: flyer.kleur, letterSpacing: '0.16em' }}>CONTACT</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', color: flyer.kleur, fontWeight: 700, marginTop: '2px', ...ellipsisStyle }}>{naam}</div>
          </div>
          {flyer.logoData
            ? <AdaptiveLogo src={flyer.logoData} baseSize={22} style={{ borderRadius: '2px' }} />
            : <div style={{ width: '24px', height: '24px', background: flyer.kleur, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: flyer.accent, fontWeight: 900, fontSize: '9px', flexShrink: 0 }}>{initials}</div>
          }
        </div>
        <div style={{ padding: '12px 14px 14px 16px', flex: 1, display: 'flex', flexDirection: 'column', color: '#fff', boxSizing: 'border-box' }}>
          <div style={{ width: '32px', height: '3px', background: flyer.accent, marginBottom: '10px', borderRadius: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5, marginBottom: '10px', flexShrink: 0 }}>{backTekst}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px', flexShrink: 0 }}>
            {contactRows.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', borderLeft: `2px solid ${flyer.accent}`, paddingLeft: '7px' }}>
                <span style={{ color: flyer.accent, fontSize: '8px', flexShrink: 0, width: '10px' }} dangerouslySetInnerHTML={{ __html: c.icon }} />
                <span style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{c.v}</span>
              </div>
            ))}
          </div>
          {urenLines.length > 0 && (
            <div style={{ marginBottom: '10px', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', color: flyer.accent, letterSpacing: '0.12em', marginBottom: '4px' }}>OPENINGSTIJDEN</div>
              {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', lineHeight: 1.55 }}>{u}</div>)}
            </div>
          )}
          {showBackQr && (
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <Qr size={54} fg={flyer.kleur} bg={flyer.accent} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Scan voor info</div>
            </div>
          )}
        </div>
      </Frame>
    );
  }

  // ── 4. MINIMAL — clean & quiet ──────────────────────────────────────────────
  if (flyer.design === 'minimal') {
    return (
      <Frame bg="#faf9f7">
        <div style={{ height: '5px', background: flyer.accent, flexShrink: 0 }} />
        <div style={{ padding: '16px 14px 14px 22px', flex: 1, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '6px', flexShrink: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: flyer.kleur, ...ellipsisStyle }}>{naam}</div>
              {flyer.slogan && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px', ...ellipsisStyle }}>{flyer.slogan}</div>}
            </div>
            {flyer.logoData
              ? <AdaptiveLogo src={flyer.logoData} baseSize={24} />
              : <div style={{ width: '24px', height: '24px', border: `1px solid ${flyer.kleur}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: flyer.kleur, flexShrink: 0 }}>{initials}</div>
            }
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '11px', color: '#888', fontStyle: 'italic', marginBottom: '12px', lineHeight: 1.5, flexShrink: 0 }}>{backTekst}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
            {contactRows.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'baseline', borderBottom: '1px solid #ede9e3', paddingBottom: '5px' }}>
                <span style={{ fontSize: '7.5px', color: '#bbb', fontFamily: 'var(--font-mono)', width: '10px', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: c.icon }} />
                <span style={{ fontSize: '8px', color: '#555', fontFamily: 'var(--font-mono)', lineHeight: 1.4, wordBreak: 'break-all' }}>{c.v}</span>
              </div>
            ))}
          </div>
          {urenLines.length > 0 && (
            <div style={{ marginTop: '10px', flexShrink: 0 }}>
              <div style={{ fontSize: '6.5px', color: '#ccc', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: '4px' }}>OPENINGSTIJDEN</div>
              {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7px', color: '#777', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>{u}</div>)}
            </div>
          )}
          {showBackQr && (
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <Qr size={50} fg={flyer.kleur} bg="#faf9f7" />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', color: '#bbb', letterSpacing: '0.08em' }}>scan voor website</div>
            </div>
          )}
        </div>
      </Frame>
    );
  }

  // ── 5. PLAYFUL — gradient header ────────────────────────────────────────────
  if (flyer.design === 'playful') {
    return (
      <Frame bg="#FFFBF0">
        <div style={{ background: `linear-gradient(125deg, ${flyer.kleur} 0%, ${flyer.accent} 100%)`, padding: '14px 14px 14px 18px', borderRadius: '0 0 24px 0', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.16em', marginBottom: '4px', textTransform: 'uppercase' }}>Contact</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', color: '#fff', fontWeight: 700, ...ellipsisStyle }}>{naam}</div>
        </div>
        <div style={{ padding: '12px 14px 14px 18px', flex: 1, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '8.5px', color: '#555', fontStyle: 'italic', marginBottom: '12px', lineHeight: 1.5, flexShrink: 0 }}>{backTekst}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px', flexShrink: 0 }}>
            {contactRows.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: `${flyer.accent}22`, borderRadius: '8px', padding: '4px 9px' }}>
                <span style={{ color: flyer.accent, fontSize: '8px', flexShrink: 0, width: '10px', textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: c.icon }} />
                <span style={{ fontSize: '7.5px', color: '#444', fontWeight: 500, wordBreak: 'break-all', lineHeight: 1.3 }}>{c.v}</span>
              </div>
            ))}
          </div>
          {urenLines.length > 0 && (
            <div style={{ background: `${flyer.kleur}10`, borderRadius: '8px', padding: '7px 9px', marginBottom: '10px', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', color: flyer.accent, letterSpacing: '0.12em', marginBottom: '4px' }}>OPENINGSTIJDEN</div>
              {urenLines.map((u, i) => <div key={i} style={{ fontSize: '7px', color: '#555', lineHeight: 1.5 }}>{u}</div>)}
            </div>
          )}
          {showBackQr && (
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <div style={{ padding: '3px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Qr size={48} fg={flyer.kleur} bg="#fff" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6.5px', color: '#999', letterSpacing: '0.06em' }}>Scan & hallo</div>
            </div>
          )}
        </div>
      </Frame>
    );
  }

  return (
    <Frame bg={flyer.kleur}>
      <div style={{ flex: 1, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', opacity: 0.5 }}>Achterkant</div>
      </div>
    </Frame>
  );
}
