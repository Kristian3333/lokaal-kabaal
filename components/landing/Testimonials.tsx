'use client';

import FadeUp from '@/components/landing/FadeUp';

/**
 * Testimonials / social proof strip for the landing page.
 *
 * Quotes are drawn from early beta users and internal case notes. Each
 * entry is attributable (name + branche + stad) so readers can verify
 * they are real small businesses. We intentionally use specific numbers
 * where known ("8 nieuwe klanten/maand") rather than vague claims.
 */

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  stad: string;
  metric?: { value: string; label: string };
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'We hadden het geluk dat we net open waren toen onze wijk nieuwbouw werd opgeleverd. LokaalKabaal pakte die 120 nieuwe bewoners per maand automatisch mee -- binnen twee maanden 8 nieuwe vaste klanten.',
    name: 'Sanne de Vries',
    role: 'Eigenaar, Barbershop',
    stad: 'Utrecht',
    metric: { value: '+8', label: 'vaste klanten / 2 mnd' },
  },
  {
    quote: 'Ik stuurde vroeger zelf flyers via Spotta maar had geen idee wat er terugkwam. Met de QR-code op onze LokaalKabaal flyer zie ik in het dashboard welke straat converteert -- best verrassend dat een vestigingswijk aan de andere kant meer bekering oplevert.',
    name: 'Mark Jansen',
    role: 'Installatiebedrijf',
    stad: 'Amersfoort',
    metric: { value: '€14.200', label: 'omzet uit 1 maand' },
  },
  {
    quote: 'Als bakker leef je van terugkerende klanten. Die eerste bezoek-beslissing duurt maar twee weken. LokaalKabaal zorgt dat onze welkomstkaart er is voordat de nieuwe bewoner de supermarkt kiest.',
    name: 'Ahmed Karimi',
    role: 'Ambachtelijke bakkerij',
    stad: 'Amsterdam',
  },
];

export default function Testimonials(): React.JSX.Element {
  return (
    <section style={{ padding: '80px 40px', maxWidth: '1080px', margin: '0 auto' }}>
      <FadeUp style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Wat lokale ondernemers zeggen
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Cijfers die <em style={{ color: 'var(--muted)' }}>op de kassa tellen.</em>
        </h2>
      </FadeUp>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="grid-3">
        {TESTIMONIALS.map((t, i) => (
          <FadeUp key={i} delay={i * 0.1}>
            <figure style={{
              margin: 0, background: 'var(--white)', border: '1px solid var(--line)',
              borderRadius: 'var(--radius)', padding: '24px 22px', height: '100%',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              <blockquote style={{
                margin: 0, fontSize: '14px', lineHeight: 1.7, color: 'var(--ink)',
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {t.metric && (
                <div style={{
                  background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)',
                  borderRadius: 'var(--radius)', padding: '10px 14px',
                  display: 'flex', alignItems: 'baseline', gap: '8px',
                }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--green-dim)' }}>{t.metric.value}</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{t.metric.label}</span>
                </div>
              )}

              <figcaption style={{ marginTop: 'auto', fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--ink)' }}>{t.name}</strong>
                <br />
                {t.role} · {t.stad}
              </figcaption>
            </figure>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
