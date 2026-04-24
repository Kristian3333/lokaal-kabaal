import type { Metadata } from 'next';
import VerhuisdataTool from '@/components/tools/VerhuisdataTool';
import Nav from '@/components/Nav';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Verhuisdata checker: hoeveel nieuwe bewoners per postcode?',
  description: 'Gratis tool: zie hoeveel nieuwe huiseigenaren er maandelijks in jouw PC4-postcode bij komen. Gebaseerd op openbare Kadaster-data.',
  alternates: { canonical: 'https://lokaalkabaal.agency/tools/verhuisdata' },
  openGraph: {
    title: 'Verhuisdata checker -- nieuwe bewoners per postcode',
    description: 'Gratis: check hoeveel nieuwe bewoners jouw PC4-postcode krijgt per maand.',
    url: 'https://lokaalkabaal.agency/tools/verhuisdata',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('Hoeveel nieuwe bewoners in jouw postcode?') +
        '&subtitle=' +
        encodeURIComponent('Gratis verhuisdata checker, openbare Kadaster-cijfers') +
        '&badge=' +
        encodeURIComponent('Gratis tool'),
    ],
  },
};

export default function VerhuisdataPage(): React.JSX.Element {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <section style={{ background: 'var(--ink)', padding: '72px 40px 44px', color: '#fff' }}>
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
            Hoeveel nieuwe bewoners krijgt jouw postcode?
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: '640px' }}>
            Vul jouw 4-cijferige postcode in en zie direct een schatting van het aantal nieuwe huiseigenaren per maand op basis van openbare Kadaster-data.
          </p>
        </div>
      </section>

      <section style={{ padding: '40px 40px 80px', maxWidth: '820px', margin: '0 auto' }}>
        <VerhuisdataTool />
      </section>

      <section style={{ padding: '60px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 400, marginBottom: '12px' }}>
            Klaar om deze nieuwe bewoners te bereiken?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            LokaalKabaal bezorgt automatisch elke maand een flyer bij alle nieuwe huiseigenaren in jouw postcode -- tussen de 28e en 30e.
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
