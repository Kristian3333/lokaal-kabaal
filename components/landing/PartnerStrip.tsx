'use client';

/**
 * PartnerStrip -- "Trusted by" strip on the landing page.
 *
 * We don't have image logos yet, so we render typographic lockups
 * that approximate the logo look. Once we have real SVGs we can swap
 * the NAMES array for <Image> components without changing callers.
 */

import FadeUp from '@/components/landing/FadeUp';

const PARTNERS: string[] = [
  'PostNL',
  'Altum AI',
  'Stripe',
  'Print.one',
  'Neon',
  'Vercel',
];

export default function PartnerStrip(): React.JSX.Element {
  return (
    <section style={{ padding: '40px 40px', background: 'var(--paper2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <FadeUp>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '18px' }}>
            Gebouwd met vertrouwde partners
          </div>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '32px 48px',
            justifyContent: 'center', alignItems: 'center',
          }}>
            {PARTNERS.map(p => (
              <span
                key={p}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '22px',
                  color: 'var(--muted)',
                  fontStyle: 'italic',
                  letterSpacing: '-0.01em',
                  lineHeight: 1,
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
