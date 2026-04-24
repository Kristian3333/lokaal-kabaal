import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { findGemeenteBySlug, estimateNewMoversPerMonth } from '@/lib/gemeenten';
import { findBrancheBySlug, allBrancheCityCombos } from '@/lib/industry-city';

const siteUrl = 'https://lokaalkabaal.agency';

/**
 * Programmatic [branche]-in-[gemeente] pages at
 * /flyers-versturen-[branche]-in-[gemeente].
 *
 * Each page canonicalises back to the main branche landing page so we
 * don't double-rank, but the slug + copy are unique enough to pick up
 * long-tail "kapper in Utrecht flyers" queries. 240 combos total.
 */

export const dynamicParams = false;

export function generateStaticParams(): { branche: string; gemeente: string }[] {
  return allBrancheCityCombos().map(({ branche, gemeente }) => ({
    branche: branche.slug,
    gemeente: gemeente.slug,
  }));
}

export function generateMetadata({ params }: { params: { branche: string; gemeente: string } }): Metadata {
  const branche = findBrancheBySlug(params.branche);
  const gemeente = findGemeenteBySlug(params.gemeente);
  if (!branche || !gemeente) return { title: 'Pagina niet gevonden' };

  const title = `Flyers versturen als ${branche.label} in ${gemeente.naam}`;
  const description = `Als ${branche.label} in ${gemeente.naam} bereik je via LokaalKabaal maandelijks ~${estimateNewMoversPerMonth(gemeente.inwoners).toLocaleString('nl-NL')} nieuwe bewoners automatisch.`;

  return {
    title,
    description,
    // Canonicalise to the main branche page to avoid duplicate content
    alternates: { canonical: `${siteUrl}${branche.canonicalPath}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/flyers-versturen-${branche.slug}-in-${gemeente.slug}`,
      images: [`${siteUrl}/api/og?title=${encodeURIComponent(branche.label + ' in ' + gemeente.naam)}&subtitle=${encodeURIComponent(branche.pitch)}&badge=${encodeURIComponent(gemeente.provincie)}`],
    },
    // Keep noindex off so Google picks up the long-tail query, but the
    // canonical means the branche page is the authoritative one.
  };
}

export default function IndustryCityPage({ params }: { params: { branche: string; gemeente: string } }): React.JSX.Element {
  const branche = findBrancheBySlug(params.branche);
  const gemeente = findGemeenteBySlug(params.gemeente);
  if (!branche || !gemeente) notFound();

  const est = estimateNewMoversPerMonth(gemeente.inwoners);

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <section style={{ background: 'var(--ink)', color: '#fff', padding: '72px 40px 40px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.25)',
            borderRadius: '999px', padding: '4px 14px', marginBottom: '20px',
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#00E87A',
          }}>
            {gemeente.naam} · {gemeente.provincie}
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Flyers versturen als {branche.label} in {gemeente.naam}
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '640px' }}>
            {branche.pitch} LokaalKabaal bezorgt in {gemeente.naam} maandelijks flyers bij alle ~{est.toLocaleString('nl-NL')} nieuwe bewoners automatisch -- tussen de 28e en 30e.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap' }}>
            <Link href="/login" style={{
              padding: '14px 28px', background: '#00E87A', color: '#0A0A0A',
              fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
            }}>
              Start campagne in {gemeente.naam} →
            </Link>
            <Link href={branche.canonicalPath} style={{
              padding: '14px 20px', color: 'rgba(255,255,255,0.55)',
              fontSize: '13px', textDecoration: 'none',
            }}>
              Meer over {branche.meervoud} →
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 40px 40px', maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Link href={`/flyers-versturen-${gemeente.slug}`} style={{
            background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '6px',
            padding: '20px 22px', textDecoration: 'none', color: 'var(--ink)',
          }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '6px' }}>ALLE BRANCHES IN</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginBottom: '4px' }}>{gemeente.naam}</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Cijfers + FAQ per stad →</div>
          </Link>
          <Link href={branche.canonicalPath} style={{
            background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '6px',
            padding: '20px 22px', textDecoration: 'none', color: 'var(--ink)',
          }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '6px' }}>ALLE STEDEN VOOR</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginBottom: '4px' }}>{branche.meervoud}</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Cases, pricing, ROI →</div>
          </Link>
        </div>
      </section>

      <section style={{ padding: '40px 40px 80px', maxWidth: '820px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '16px' }}>
          Waarom {branche.meervoud} in {gemeente.naam} LokaalKabaal kiezen
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <li style={{ padding: '14px 18px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '14px', lineHeight: 1.7 }}>
            <strong>Hyperlokale timing:</strong> de flyer valt op de mat in de eerste 30 dagen na een verhuizing -- precies wanneer nieuwe bewoners hun vaste {branche.label} kiezen.
          </li>
          <li style={{ padding: '14px 18px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '14px', lineHeight: 1.7 }}>
            <strong>Geen handwerk:</strong> wij trekken elke maand verse Kadaster-data voor {gemeente.naam}, drukken en bezorgen. Jij hoeft alleen de flyer te leveren (of laat hem door ons maken).
          </li>
          <li style={{ padding: '14px 18px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '14px', lineHeight: 1.7 }}>
            <strong>Meetbare ROI:</strong> elke flyer heeft een unieke QR-code. In je dashboard zie je per postcode hoeveel nieuwe bewoners scannen en verzilveren.
          </li>
          <li style={{ padding: '14px 18px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '14px', lineHeight: 1.7 }}>
            <strong>Voorspelbare kosten:</strong> abonnement vanaf €349/mnd (inclusief 300 A6 dubbelzijdige flyers + bezorging). Extra flyers bijboeken kan, maar zonder verrassingen.
          </li>
        </ul>
      </section>

      <section style={{ padding: '60px 40px', textAlign: 'center', background: 'var(--paper2)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 400, marginBottom: '12px' }}>
          Start jouw campagne in {gemeente.naam}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
          Setup in 20 minuten. Elke maand automatisch bezorgd tussen de 28e en 30e.
        </p>
        <Link href="/login" style={{
          display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
          fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
        }}>
          Start nu jouw campagne →
        </Link>
      </section>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '16px' }}>
        <span>© 2026 LokaalKabaal B.V.</span>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Link href={branche.canonicalPath} style={{ color: 'var(--muted)', textDecoration: 'none' }}>{branche.meervoud}</Link>
          <Link href={`/flyers-versturen-${gemeente.slug}`} style={{ color: 'var(--muted)', textDecoration: 'none' }}>{gemeente.naam}</Link>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
