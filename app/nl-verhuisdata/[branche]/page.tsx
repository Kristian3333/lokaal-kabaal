import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { BRANCHE_CLV } from '@/lib/clv';
import { buildProvincieStats } from '@/lib/provincie-data';

const siteUrl = 'https://lokaalkabaal.agency';

export const dynamicParams = false;
export const revalidate = 86400;

const BRANCHES = Object.keys(BRANCHE_CLV).filter(k => k !== 'overig') as Array<keyof typeof BRANCHE_CLV>;

export function generateStaticParams(): { branche: string }[] {
  return BRANCHES.map(branche => ({ branche }));
}

export function generateMetadata({ params }: { params: { branche: string } }): Metadata {
  const cfg = BRANCHE_CLV[params.branche as keyof typeof BRANCHE_CLV];
  if (!cfg) return { title: 'Benchmark niet gevonden' };
  const title = `Verhuisdata & benchmark voor ${cfg.label}`;
  const description = `Hoeveel nieuwe huiseigenaren verhuizen er per maand in Nederland, en wat is een gemiddelde ${cfg.label}-klant waard? Gratis benchmark op basis van CBS-data.`;
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/nl-verhuisdata/${params.branche}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/nl-verhuisdata/${params.branche}`,
      images: [`${siteUrl}/api/og?title=${encodeURIComponent('Benchmark ' + cfg.label)}&subtitle=${encodeURIComponent('Nieuwe bewoners + klantwaarde per provincie')}&badge=${encodeURIComponent('Open data')}`],
    },
  };
}

export default function BrancheBenchmarkPage({ params }: { params: { branche: string } }): React.JSX.Element {
  const cfg = BRANCHE_CLV[params.branche as keyof typeof BRANCHE_CLV];
  if (!cfg) notFound();

  const provincies = buildProvincieStats();
  const totaalNieuweBewoners = provincies.reduce((sum, p) => sum + p.geschatteNieuweBewonersPerMaand, 0);

  // Market size = national new-movers/maand * default CLV * 4% conversion
  const marktPotentieJaarlijks = Math.round(totaalNieuweBewoners * 12 * cfg.defaultClv * 0.04);

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <section style={{ background: 'var(--ink)', color: '#fff', padding: '72px 40px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.25)',
            borderRadius: '999px', padding: '4px 14px', marginBottom: '20px',
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#00E87A',
          }}>
            Open data · {cfg.label}
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            Verhuismarkt voor {cfg.label}
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '640px', marginBottom: '32px' }}>
            {cfg.bron}. Gemiddeld levert één vaste klant jaarlijks {cfg.label === 'Overig / eigen schatting' ? '€500' : `€${cfg.defaultClv.toLocaleString('nl-NL')}`} op. Combineer dat met ~{totaalNieuweBewoners.toLocaleString('nl-NL')} nieuwe bewoners per maand in Nederland en de marktkans per jaar wordt tastbaar.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', color: '#fff', lineHeight: 1, marginBottom: '4px' }}>
                €{cfg.defaultClv.toLocaleString('nl-NL')}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>gem. klantwaarde / jaar</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', color: '#fff', lineHeight: 1, marginBottom: '4px' }}>
                ~{totaalNieuweBewoners.toLocaleString('nl-NL')}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>verhuizingen / maand (NL)</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', color: '#fff', lineHeight: 1, marginBottom: '4px' }}>
                €{Math.round(marktPotentieJaarlijks / 1_000_000).toLocaleString('nl-NL')}M
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>potentiële marktomzet / jaar</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 400, marginBottom: '14px' }}>
          Per provincie: waar liggen de kansen?
        </h2>
        <div style={{ border: '1px solid var(--line)', borderRadius: '6px', overflow: 'hidden', background: 'var(--white)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--paper2)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Provincie</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Verhuizers/mnd</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pot. omzet / mnd</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Top gemeenten</th>
              </tr>
            </thead>
            <tbody>
              {provincies.map((p, i) => {
                const potMaand = Math.round(p.geschatteNieuweBewonersPerMaand * cfg.defaultClv * 0.04 / 12);
                return (
                  <tr key={p.provincie} style={{ borderBottom: i === provincies.length - 1 ? 'none' : '1px solid var(--line)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{p.provincie}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      ~{p.geschatteNieuweBewonersPerMaand.toLocaleString('nl-NL')}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', fontWeight: 700 }}>
                      €{potMaand.toLocaleString('nl-NL')}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px' }}>
                      {p.topGemeenten.map((g, gi) => (
                        <span key={g.slug}>
                          <Link href={`/flyers-versturen-${g.slug}`} style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
                            {g.naam}
                          </Link>
                          {gi < p.topGemeenten.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '12px', lineHeight: 1.6 }}>
          Marktomzet = nieuwe bewoners × klantwaarde × 4% conversieratio. Conservatief aangenomen; in hoge-intent branches (installateur, makelaar) ligt de praktijk vaak hoger.
        </p>
      </section>

      <section style={{ padding: '56px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            Hoeveel hiervan kan jij pakken?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            Gebruik de ROI calculator om voor jouw werkgebied een concreet rendement te zien.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/tools/roi-calculator" style={{
              display: 'inline-block', padding: '12px 24px', background: 'var(--ink)', color: '#fff',
              fontSize: '13px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
            }}>
              ROI calculator →
            </Link>
            <Link href="/login" style={{
              display: 'inline-block', padding: '12px 24px', background: 'var(--green)', color: 'var(--ink)',
              fontSize: '13px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
            }}>
              Start een campagne →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
