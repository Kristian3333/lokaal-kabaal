import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { buildProvincieStats } from '@/lib/provincie-data';

// Public data dashboard -- safe to cache aggressively; numbers only change
// when we update GEMEENTEN.
export const revalidate = 86400; // 24h

export const metadata: Metadata = {
  title: 'Verhuisdata Nederland: nieuwe bewoners per provincie',
  description: 'Publieke dashboard: hoeveel nieuwe huiseigenaren per maand in elke Nederlandse provincie. Op basis van CBS-verhuisgraad en gemeentelijke populatiecijfers.',
  alternates: { canonical: 'https://lokaalkabaal.agency/nl-verhuisdata' },
  openGraph: {
    title: 'Verhuisdata NL · nieuwe bewoners per provincie',
    description: 'Hoeveel huishoudens verhuizen er maandelijks in Nederland? Zie per provincie.',
    url: 'https://lokaalkabaal.agency/nl-verhuisdata',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('Verhuisdata Nederland') +
        '&subtitle=' +
        encodeURIComponent('Nieuwe bewoners per provincie, per maand') +
        '&badge=' +
        encodeURIComponent('Open data'),
    ],
  },
};

export default function NlVerhuisdataPage(): React.JSX.Element {
  const provincies = buildProvincieStats();
  const totaalNieuweBewoners = provincies.reduce((sum, p) => sum + p.geschatteNieuweBewonersPerMaand, 0);
  const totaalInwoners = provincies.reduce((sum, p) => sum + p.totaleInwoners, 0);

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <section style={{ background: 'var(--ink)', color: '#fff', padding: '72px 40px 40px' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.25)',
            borderRadius: '999px', padding: '4px 14px', marginBottom: '20px',
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#00E87A',
          }}>
            Open data · 40 gemeenten
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Verhuisdata Nederland
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '720px' }}>
            Hoeveel nieuwe huiseigenaren verhuizen er per maand in Nederland? Gebaseerd op CBS-verhuisgraad en populatiecijfers per gemeente. Deze dashboard dekt de 40 grootste Dutch gemeenten.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '44px', color: '#fff', lineHeight: 1, marginBottom: '4px' }}>
                ~{totaalNieuweBewoners.toLocaleString('nl-NL')}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>nieuwe bewoners / maand</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '44px', color: '#fff', lineHeight: 1, marginBottom: '4px' }}>
                {totaalInwoners.toLocaleString('nl-NL')}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>inwoners in sample</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '44px', color: '#fff', lineHeight: 1, marginBottom: '4px' }}>
                {provincies.length}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>provincies vertegenwoordigd</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 40px', maxWidth: '980px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 400, marginBottom: '16px' }}>
          Per provincie
        </h2>
        <div style={{ border: '1px solid var(--line)', borderRadius: '6px', overflow: 'hidden', background: 'var(--white)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--paper2)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Provincie</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nieuwe bewoners/mnd</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Inwoners</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Top gemeenten</th>
              </tr>
            </thead>
            <tbody>
              {provincies.map((p, i) => (
                <tr key={p.provincie} style={{ borderBottom: i === provincies.length - 1 ? 'none' : '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>{p.provincie}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', fontWeight: 700 }}>
                    ~{p.geschatteNieuweBewonersPerMaand.toLocaleString('nl-NL')}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                    {p.totaleInwoners.toLocaleString('nl-NL')}
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
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '14px', lineHeight: 1.6 }}>
          Methode: CBS-baseline 5,5% eigendomsoverdrachten per jaar ÷ 2,1 personen per huishouden ÷ 12 maanden, afgerond op nette getallen. Werkelijke cijfers per PC4 verschillen en worden real-time via Altum AI / Kadaster opgehaald bij campagne-activatie.
        </p>
      </section>

      <section style={{ padding: '48px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            Wil je deze bewoners daadwerkelijk bereiken?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            LokaalKabaal bezorgt automatisch jouw flyer bij nieuwe bewoners in jouw postcodes -- elke maand tussen de 28e en 30e.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/tools/verhuisdata" style={{
              display: 'inline-block', padding: '12px 24px', background: 'var(--ink)', color: '#fff',
              fontSize: '13px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
            }}>
              Check jouw PC4 →
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
