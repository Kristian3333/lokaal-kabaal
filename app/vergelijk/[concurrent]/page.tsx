import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { CONCURRENTEN, findConcurrentBySlug } from '@/lib/concurrenten';

/**
 * Bottom-of-funnel comparison pages: /vergelijk/[concurrent].
 *
 * Each page takes a neutral tone, acknowledges the competitor's strengths,
 * and then explains the specific segment where LokaalKabaal is the better
 * fit. Pre-rendered per competitor at build time via generateStaticParams.
 */

const siteUrl = 'https://lokaalkabaal.agency';

export const dynamicParams = false;

export function generateStaticParams(): { concurrent: string }[] {
  return CONCURRENTEN.map(c => ({ concurrent: c.slug }));
}

export function generateMetadata({ params }: { params: { concurrent: string } }): Metadata {
  const c = findConcurrentBySlug(params.concurrent);
  if (!c) return { title: 'Vergelijking niet gevonden' };

  const title = `LokaalKabaal vs ${c.naam}: welke past bij jouw bedrijf?`;
  const description = `Eerlijke vergelijking tussen LokaalKabaal en ${c.naam}. Zie de verschillen in targeting, prijs, bezorging en conversietracking.`;
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/vergelijk/${c.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/vergelijk/${c.slug}`,
      images: [`${siteUrl}/api/og?title=${encodeURIComponent(`LokaalKabaal vs ${c.naam}`)}&subtitle=${encodeURIComponent('Eerlijke vergelijking')}&badge=${encodeURIComponent('Vergelijking')}`],
    },
  };
}

function Check({ v }: { v: boolean | 'partial' }): React.JSX.Element {
  if (v === true) {
    return <span aria-label="ja" style={{ color: 'var(--green-dim)', fontSize: '18px', fontWeight: 800 }}>✓</span>;
  }
  if (v === false) {
    return <span aria-label="nee" style={{ color: '#c0392b', fontSize: '18px', fontWeight: 800 }}>—</span>;
  }
  return <span aria-label="gedeeltelijk" style={{ color: '#b8860b', fontSize: '14px', fontWeight: 800 }}>◐</span>;
}

export default function ConcurrentPage({ params }: { params: { concurrent: string } }): React.JSX.Element {
  const c = findConcurrentBySlug(params.concurrent);
  if (!c) notFound();

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <section style={{ background: 'var(--ink)', color: '#fff', padding: '80px 40px 60px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.25)',
            borderRadius: '999px', padding: '4px 14px', marginBottom: '20px',
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#00E87A',
          }}>
            Eerlijke vergelijking
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            LokaalKabaal vs {c.naam}
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: '640px' }}>
            {c.tagline}. Hieronder lees je wanneer {c.naam} de betere keuze is, en wanneer LokaalKabaal beter bij jouw situatie past.
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 40px', maxWidth: '820px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 400, marginBottom: '16px' }}>Feature-voor-feature</h2>
        <div style={{ border: '1px solid var(--line)', borderRadius: '6px', overflow: 'hidden', background: 'var(--white)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--paper2)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feature</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>LokaalKabaal</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.naam}</th>
              </tr>
            </thead>
            <tbody>
              {c.features.map((row, i) => (
                <tr key={i} style={{ borderBottom: i === c.features.length - 1 ? 'none' : '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    {row.feature}
                    {row.note && <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{row.note}</div>}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}><Check v={row.us} /></td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}><Check v={row.them} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '10px' }}>
          ✓ = ondersteund · ◐ = gedeeltelijk · — = niet ondersteund. Laatst bijgewerkt bij release.
        </div>
      </section>

      <section style={{ padding: '0 40px 48px', maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: '6px', padding: '20px 22px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Kies {c.naam} als</div>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--ink)' }}>{c.wanneerZijKiezen}</p>
          </div>
          <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: '6px', padding: '20px 22px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Kies LokaalKabaal als</div>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--ink)' }}>{c.wanneerWijKiezen}</p>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 40px', textAlign: 'center', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 400, marginBottom: '12px' }}>
            Klaar om met LokaalKabaal te starten?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            Setup in 20 minuten. Elke maand automatisch bezorgd tussen de 28e en 30e.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{
              display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
              fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
            }}>
              Start jouw campagne →
            </Link>
            <a
              href={c.website}
              target="_blank"
              rel="nofollow noopener noreferrer"
              style={{
                display: 'inline-block', padding: '14px 20px', color: 'var(--muted)',
                fontSize: '13px', textDecoration: 'none',
              }}
            >
              Ga naar {c.naam} →
            </a>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '16px' }}>
        <span>© 2026 LokaalKabaal B.V.</span>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Link href="/flyers-versturen-nieuwe-bewoners" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Hoe het werkt</Link>
          <Link href="/blog" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Blog</Link>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
