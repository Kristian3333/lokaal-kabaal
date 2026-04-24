import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { bucketByTime, sparklinePoints } from '@/lib/conversie-stats';

export const metadata: Metadata = {
  title: 'Voorbeeld maandrapport | LokaalKabaal',
  description: 'Zie hoe een maandrapport eruitziet dat retailers ontvangen. Flyers verstuurd, scans, conversies, per-postcode breakdown, ROI.',
  alternates: { canonical: 'https://lokaalkabaal.agency/voorbeelden/maandrapport' },
  openGraph: {
    title: 'Voorbeeld maandrapport -- LokaalKabaal',
    description: 'Volledig voorbeeld van het maandrapport dat retailers elke 5e van de maand ontvangen.',
    url: 'https://lokaalkabaal.agency/voorbeelden/maandrapport',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('Voorbeeld maandrapport') +
        '&subtitle=' +
        encodeURIComponent('Zo krijgen retailers hun scans + conversies elke maand op de 5e') +
        '&badge=' +
        encodeURIComponent('Voorbeeld'),
    ],
  },
};

// Synthetic sample data shaped like what buildMonthlyReport() would produce
const SAMPLE_VERIFICATIONS = Array.from({ length: 6 }, (_, i) => {
  const maand = `2026-${String(i + 1).padStart(2, '0')}`;
  return {
    maand,
    verzonden: 380 + i * 6,
    interesse: 22 + i * 4,
    conversies: 6 + i * 2,
  };
});

const SAMPLE_TOP_PC4 = [
  { pc4: '3512', scans: 34, verzonden: 220, conversieRate: 6.4 },
  { pc4: '3581', scans: 18, verzonden: 148, conversieRate: 5.1 },
  { pc4: '3551', scans: 12, verzonden: 95,  conversieRate: 4.2 },
  { pc4: '3584', scans: 11, verzonden: 108, conversieRate: 3.7 },
  { pc4: '3562', scans: 9,  verzonden: 84,  conversieRate: 3.5 },
];

export default function SampleMaandrapportPage(): React.JSX.Element {
  const verzondenSeries = SAMPLE_VERIFICATIONS.map(m => m.verzonden);
  const scansSeries = SAMPLE_VERIFICATIONS.map(m => m.interesse);
  const conversieSeries = SAMPLE_VERIFICATIONS.map(m => m.conversies);
  const W = 640, H = 120;
  const verzondenPts = sparklinePoints(verzondenSeries, W, H);
  const scansPts = sparklinePoints(scansSeries, W, H);
  const conversiePts = sparklinePoints(conversieSeries, W, H);

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <section style={{ background: 'var(--ink)', color: '#fff', padding: '60px 40px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: '999px', padding: '4px 14px', marginBottom: '16px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#00E87A' }}>
            Voorbeeld · geen account nodig
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '14px' }}>
            Voorbeeld maandrapport
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '620px' }}>
            Zo ziet het rapport eruit dat je elke 5e van de maand in je inbox krijgt zodra je campagnes lopen. De cijfers hieronder zijn illustratief; jouw eigen rapport toont je werkelijke scans en conversies per PC4.
          </p>
        </div>
      </section>

      <section style={{ padding: '40px 40px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
          {[
            { label: 'Verstuurd', value: '414', sub: 'april 2026' },
            { label: 'Scans (interesse)', value: '42', sub: '10.1% scan-rate' },
            { label: 'Conversies', value: '16', sub: '3.9% conversieratio' },
            { label: 'Verwachte omzet', value: '€5.760', sub: '16 × €360 CLV' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: 'var(--ink)', lineHeight: 1, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Sparkline */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Verloop over 6 maanden
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--ink)' }}>■ verstuurd</span>
              <span style={{ color: '#3b82f6' }}>■ scans</span>
              <span style={{ color: 'var(--green-dim)' }}>■ conversies</span>
            </div>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Trendlijn verzonden, scans en conversies per maand">
            <polyline fill="none" stroke="var(--ink)" strokeWidth="1.5" points={verzondenPts} />
            <polyline fill="none" stroke="#3b82f6" strokeWidth="1.5" points={scansPts} />
            <polyline fill="none" stroke="var(--green-dim)" strokeWidth="1.5" points={conversiePts} />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
            <span>{SAMPLE_VERIFICATIONS[0].maand}</span>
            <span>{SAMPLE_VERIFICATIONS[SAMPLE_VERIFICATIONS.length - 1].maand}</span>
          </div>
        </div>

        {/* Top PC4 table */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'var(--paper2)' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Beste postcodes deze maand
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '10px 18px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>PC4</th>
                <th style={{ padding: '10px 18px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Verstuurd</th>
                <th style={{ padding: '10px 18px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Scans</th>
                <th style={{ padding: '10px 18px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Conversie</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_TOP_PC4.map((row, i) => (
                <tr key={row.pc4} style={{ borderBottom: i === SAMPLE_TOP_PC4.length - 1 ? 'none' : '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{row.pc4}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{row.verzonden}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{row.scans}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', fontWeight: 700 }}>{row.conversieRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.7 }}>
          In het echte rapport zit ook een exporteerbare CSV met alle codes, een overzicht van eventuele overage-kosten, en een churn-signaal-badge als de scan-rate in een maand opvallend afwijkt van de baseline.
        </p>
      </section>

      <section style={{ padding: '48px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            Wil je je eigen maandrapport straks ontvangen?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            Start een campagne, en vanaf de eerste batch ontvang je automatisch dit rapport per email op de 5e van de maand.
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
