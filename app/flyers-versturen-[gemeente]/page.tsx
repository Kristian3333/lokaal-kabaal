import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import PricingSection from '@/components/PricingSection';
import { GEMEENTEN, findGemeenteBySlug, estimateNewMoversPerMonth } from '@/lib/gemeenten';

/**
 * Programmatic city landing pages at /flyers-versturen-[gemeente].
 *
 * Next.js catches 40 static pages via generateStaticParams so Google crawls
 * fast + Vercel serves static HTML. Each page has unique copy slots
 * (gemeente name, province, new-movers estimate, PC4) so the pages are
 * differentiated enough to avoid near-duplicate-content penalties.
 */

const siteUrl = 'https://lokaalkabaal.agency';

// Prerender one static HTML per gemeente at build time and 404 anything else
// so Google only indexes canonical city pages. Adding new gemeenten requires
// a rebuild (acceptable -- the list lives in source).
export const dynamicParams = false;

export function generateStaticParams(): { gemeente: string }[] {
  return GEMEENTEN.map(g => ({ gemeente: g.slug }));
}

export function generateMetadata({ params }: { params: { gemeente: string } }): Metadata {
  const gemeente = findGemeenteBySlug(params.gemeente);
  if (!gemeente) return { title: 'Gemeente niet gevonden' };

  const est = estimateNewMoversPerMonth(gemeente.inwoners);
  const title = `Flyers versturen in ${gemeente.naam} | Nieuwe bewoners`;
  const description = `Elke maand bereiken we in ${gemeente.naam} ongeveer ${est.toLocaleString('nl-NL')} nieuwe bewoners automatisch. Flyers bezorgd tussen de 28e en 30e.`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/flyers-versturen-${gemeente.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/flyers-versturen-${gemeente.slug}`,
      images: [
        `${siteUrl}/api/og?title=${encodeURIComponent('Flyers in ' + gemeente.naam)}&subtitle=${encodeURIComponent(`~${est.toLocaleString('nl-NL')} nieuwe bewoners per maand bereiken`)}&badge=${encodeURIComponent(gemeente.provincie)}`,
      ],
    },
  };
}

export default function GemeentePage({ params }: { params: { gemeente: string } }): React.JSX.Element {
  const gemeente = findGemeenteBySlug(params.gemeente);
  if (!gemeente) notFound();

  const estMonth = estimateNewMoversPerMonth(gemeente.inwoners);
  const estYear = estMonth * 12;

  const faq = [
    {
      q: `Hoeveel nieuwe bewoners zijn er per maand in ${gemeente.naam}?`,
      a: `In ${gemeente.naam} verhuizen gemiddeld zo'n ${estMonth.toLocaleString('nl-NL')} huishoudens per maand -- samen ongeveer ${estYear.toLocaleString('nl-NL')} per jaar. LokaalKabaal vangt deze eigendomsoverdrachten op via Altum AI / Kadaster en bezorgt jouw flyer in de eerste maand na verhuizing.`,
    },
    {
      q: `Welke postcodes vallen binnen ${gemeente.naam}?`,
      a: `${gemeente.naam} valt in provincie ${gemeente.provincie}. Het PC4-gebied rond ${gemeente.pc4} is een goed startpunt; je kunt in de wizard elk relevant PC4 binnen de gemeente selecteren. Starter tot 40 PC4's, Pro tot 80, Agency onbeperkt.`,
    },
    {
      q: `Wanneer worden mijn flyers in ${gemeente.naam} bezorgd?`,
      a: `Elke maand tussen de 28e en 30e. Rond de 20e trekken we verse Kadaster-data, rond de 22e gaat de bulkorder naar de drukker, en PostNL bezorgt in de laatste week van de maand.`,
    },
    {
      q: `Wat kost een flyercampagne in ${gemeente.naam}?`,
      a: `Abonnement start bij €349/maand (Starter, 300 A6 dubbelzijdige flyers incl. print + bezorging, max. 100 km werkgebiedstraal). Jaarcontract: 15% korting. Extra flyers boven bundel: €0,70 per A6.`,
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
        <Nav />

        {/* Hero */}
        <section style={{ background: 'var(--ink)', padding: '80px 40px 100px', color: '#fff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.25)',
              borderRadius: '999px', padding: '4px 14px', marginBottom: '24px',
              fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#00E87A',
            }}>
              <span style={{ width: '6px', height: '6px', background: '#00E87A', borderRadius: '50%' }} />
              {gemeente.provincie} · ~{estMonth.toLocaleString('nl-NL')} nieuwe bewoners/mnd
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 400, lineHeight: 1.04, letterSpacing: '-0.02em', marginBottom: '24px' }}>
              Flyers versturen in {gemeente.naam}
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: '36px', maxWidth: '640px' }}>
              Elke maand verhuizen duizenden mensen naar {gemeente.naam}. LokaalKabaal vangt deze nieuwe bewoners automatisch op via Kadaster-data en bezorgt jouw flyer tussen de 28e en 30e -- in het gouden venster dat de nieuwe bewoner zijn vaste kapper, bakker en installateur kiest.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/login" style={{
                padding: '14px 28px', background: '#00E87A', color: '#0A0A0A',
                fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
              }}>
                Start jouw campagne in {gemeente.naam} →
              </Link>
              <Link href="/flyers-versturen-nieuwe-bewoners" style={{
                padding: '14px 20px', color: 'rgba(255,255,255,0.55)',
                fontSize: '13px', textDecoration: 'none',
              }}>
                Hoe het werkt
              </Link>
            </div>

            {/* Local stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginTop: '60px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {[
                { val: gemeente.inwoners.toLocaleString('nl-NL'), sub: `inwoners in ${gemeente.naam}` },
                { val: `~${estMonth.toLocaleString('nl-NL')}`,     sub: 'nieuwe bewoners per maand' },
                { val: `~${estYear.toLocaleString('nl-NL')}`,      sub: 'nieuwe bewoners per jaar' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: '#fff', marginBottom: '4px', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)', lineHeight: 1.4 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why this city */}
        <section style={{ padding: '80px 40px', maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Waarom {gemeente.naam}
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 400, marginBottom: '20px', lineHeight: 1.15 }}>
            Hyperlokale timing is in {gemeente.naam} <em style={{ color: 'var(--muted)' }}>goud waard</em>.
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '16px' }}>
            In de eerste 30 dagen na een verhuizing kiest 80% van de huishoudens hun vaste lokale leveranciers: kapper, bakker, installateur, fysio, tandarts. Wie in {gemeente.naam} als eerste op de mat ligt, wint die relatie -- en een gemiddelde vaste klant levert €360 tot €8.000 per jaar op.
          </p>
          <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8 }}>
            LokaalKabaal automatiseert dat venster. Geen handmatig uitzoeken wie verhuisd is, geen losse printorders, geen bezorgrondes -- één abonnement, elke maand nieuwe bewoners in {gemeente.naam} bereikt.
          </p>
        </section>

        {/* FAQ */}
        <section style={{ padding: '0 40px 80px', maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Veelgestelde vragen
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 400, marginBottom: '32px' }}>
            Flyers versturen in {gemeente.naam} -- alles over
          </h2>
          {faq.map((f, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--line)', padding: '22px 0' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>{f.q}</div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75 }}>{f.a}</p>
            </div>
          ))}
        </section>

        <PricingSection />

        {/* Final CTA */}
        <section style={{ padding: '80px 40px', textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 400, marginBottom: '16px', lineHeight: 1.1 }}>
            Start jouw campagne in {gemeente.naam}.
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '32px', lineHeight: 1.7 }}>
            Setup in 20 minuten. Elke maand automatisch bezorgd tussen de 28e en 30e.
          </p>
          <Link href="/login" style={{
            display: 'inline-block', padding: '16px 36px', background: 'var(--ink)', color: '#fff',
            fontSize: '15px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Start nu jouw campagne →
          </Link>
        </section>

        <footer style={{ borderTop: '1px solid var(--line)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '16px' }}>
          <span>© 2026 LokaalKabaal B.V.</span>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              ['/flyers-versturen-nieuwe-bewoners', 'Hoe het werkt'],
              ['/blog', 'Blog'],
              ['/privacy', 'Privacy'],
              ['/voorwaarden', 'Voorwaarden'],
              ['/contact', 'Contact'],
            ].map(([href, label]) => (
              <Link key={href} href={href} style={{ color: 'var(--muted)', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
