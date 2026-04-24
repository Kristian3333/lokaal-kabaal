import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Link from 'next/link';
import RoiCalculator from '@/components/tools/RoiCalculator';

export const metadata: Metadata = {
  title: 'Flyer ROI calculator: rendement berekenen direct mail',
  description: 'Gratis tool: bereken direct het rendement van een flyercampagne naar nieuwe bewoners. Kies branche, CLV en volume, zie ROI en terugverdientijd.',
  alternates: { canonical: 'https://lokaalkabaal.agency/tools/roi-calculator' },
  openGraph: {
    title: 'Flyer ROI calculator · gratis',
    description: 'Bereken in 30 seconden het rendement van jouw flyercampagne.',
    url: 'https://lokaalkabaal.agency/tools/roi-calculator',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('Flyer ROI calculator') +
        '&subtitle=' +
        encodeURIComponent('Bereken rendement van direct mail in 30 seconden') +
        '&badge=' +
        encodeURIComponent('Gratis tool'),
    ],
  },
};

export default function RoiCalculatorPage(): React.JSX.Element {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <section style={{ background: 'var(--ink)', color: '#fff', padding: '72px 40px 44px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.25)',
            borderRadius: '999px', padding: '4px 14px', marginBottom: '20px',
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#00E87A',
          }}>
            Gratis tool · geen account
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Flyer ROI calculator
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: '640px' }}>
            Kies je branche, stel CLV en volume in, en zie direct hoeveel nieuwe klanten, omzet en ROI een maand van LokaalKabaal oplevert. Conservatief rekenen -- we gebruiken CBS-baselines en industriegemiddelden.
          </p>
        </div>
      </section>

      <section style={{ padding: '40px 40px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <RoiCalculator />
      </section>

      <section style={{ padding: '60px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 400, marginBottom: '12px' }}>
            Rendement ziet er goed uit? Start een campagne.
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            Setup in 20 minuten. Elke maand automatisch bezorgd tussen de 28e en 30e.
          </p>
          <Link href="/login" style={{
            display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Start jouw campagne →
          </Link>
        </div>
      </section>
    </div>
  );
}
