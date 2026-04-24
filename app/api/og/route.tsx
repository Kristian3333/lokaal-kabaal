import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/og?title=...&subtitle=...&badge=...
 *
 * Generates a 1200x630 OG image so every shared link on social / Slack /
 * iMessage gets a branded card with the requested title. Used by dynamic
 * pages (city programmatic pages, blog posts, retailer branding) that
 * can't ship a static OG image.
 *
 * Params are escaped into SVG automatically by next/og. Defaults chosen
 * so hitting the endpoint with no query still produces a valid LokaalKabaal
 * card.
 */
export function GET(req: NextRequest): ImageResponse {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get('title')?.slice(0, 120) ?? 'Flyers naar nieuwe bewoners';
  const subtitle = searchParams.get('subtitle')?.slice(0, 200) ?? 'Elke maand tussen de 28e en 30e op de mat';
  const badge = searchParams.get('badge')?.slice(0, 40) ?? 'Hyperlocal direct mail';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0A0A',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: '"Manrope", system-ui, sans-serif',
        }}
      >
        {/* Top row: logo + badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: '#00E87A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 22,
                color: '#0A0A0A',
              }}
            >
              L
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Lokaal<span style={{ color: '#00E87A' }}>Kabaal</span>
            </div>
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: 999,
              border: '1px solid rgba(0,232,122,0.4)',
              color: '#00E87A',
            }}
          >
            {badge}
          </div>
        </div>

        {/* Middle: title + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960 }}>
          <div
            style={{
              fontSize: title.length > 60 ? 64 : 80,
              fontWeight: 400,
              fontFamily: '"Instrument Serif", Georgia, serif',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
            {subtitle}
          </div>
        </div>

        {/* Footer: domain */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 18,
            color: 'rgba(255,255,255,0.45)',
            fontFamily: '"DM Mono", monospace',
          }}
        >
          <span>lokaalkabaal.agency</span>
          <span>Nieuwe bewoners · automatisch · maandelijks</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
