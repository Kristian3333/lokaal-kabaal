'use client';

import { QRCodeSVG } from 'qrcode.react';

/**
 * Real, scannable QR code rendered as inline SVG so it captures sharp in
 * the html2canvas -> jsPDF -> print pipeline.
 *
 * Encodes the business website if set, otherwise the business email as
 * a mailto: link, otherwise a tel: link. If none of those are set, the
 * QR encodes the LokaalKabaal homepage so the print never ships an
 * unscannable square -- the recipient still lands somewhere sensible.
 *
 * At print time the QR ends up at `size / SCREEN_SCALE` mm (1.5 px/mm).
 * Reliable scanning needs >= 20 mm, so anything under 30 px CSS is
 * undersized for postal flyers; default 48 px = 32 mm = comfortable.
 */
export interface FlyerQrCodeProps {
  /** Business website (preferred QR target). */
  website?: string | null;
  /** Business email (fallback QR target). */
  email?: string | null;
  /** Business phone (last-resort QR target). */
  telefoon?: string | null;
  /** QR side length in CSS pixels (square). */
  size?: number;
  /** Foreground (modules) colour. */
  fg?: string;
  /** Background colour. */
  bg?: string;
}

/** Best-effort url normaliser -- accepts "foo.nl", "www.foo.nl", "https://foo.nl". */
function normaliseWebsite(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === '') return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

/** Resolve the URL the QR should encode, preferring website -> email -> tel. */
export function resolveQrTarget(
  website?: string | null,
  email?: string | null,
  telefoon?: string | null,
): string {
  const w = website?.trim();
  if (w) return normaliseWebsite(w);
  const e = email?.trim();
  if (e) return `mailto:${e}`;
  const t = telefoon?.trim();
  if (t) return `tel:${t.replace(/[^+0-9]/g, '')}`;
  return 'https://lokaalkabaal.agency';
}

export function FlyerQrCode({
  website,
  email,
  telefoon,
  size = 48,
  fg = '#000',
  bg = '#fff',
}: FlyerQrCodeProps): React.JSX.Element {
  const value = resolveQrTarget(website, email, telefoon);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: bg,
        padding: '2px',
        boxSizing: 'border-box',
        flexShrink: 0,
        lineHeight: 0,
      }}
    >
      <QRCodeSVG
        value={value}
        size={size - 4}
        bgColor={bg}
        fgColor={fg}
        level="M"
        marginSize={0}
      />
    </div>
  );
}
