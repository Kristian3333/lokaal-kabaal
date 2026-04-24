'use client';

import Link from 'next/link';
import Nav from '@/components/Nav';

const ARTIKELEN = [
  {
    slug: 'neurowetenschap-nieuwe-bewoner',
    categorie: 'Neuromarketing',
    titel: 'De neurowetenschap van de nieuwe bewoner',
    samenvatting: 'Waarom 43% van ons dagelijks gedrag automatisch is, hoe een verhuizing die automaten tijdelijk reset, en wat dat betekent voor jouw eerste flyer.',
    leestijd: '6 min',
    datum: '24 april 2026',
  },
  {
    slug: 'hyperlokaal',
    categorie: 'Strategie',
    titel: 'Hyperlokaal: Vertrouwen via Fysieke Aanwezigheid',
    samenvatting: 'Waarom een flyer in de brievenbus meer vertrouwen wekt dan honderd gesponsorde posts. En hoe de lokale ondernemer daarmee wint van het grote geld.',
    leestijd: '5 min',
    datum: '10 maart 2026',
  },
  {
    slug: 'digital-first',
    categorie: 'Technologie',
    titel: 'Digital-First: Moderne Technologie voor een Fysiek Product',
    samenvatting: 'Kadaster-data, automatisering en een strakke interface -- allemaal in dienst van een stuk papier. De paradox van de meest analoge marketingvorm in 2026.',
    leestijd: '6 min',
    datum: '24 februari 2026',
  },
  {
    slug: 'digitale-moeheid',
    categorie: 'Gedrag',
    titel: 'Digitale Moeheid: Fysiek heeft een Langere Houdbaarheid',
    samenvatting: 'De gemiddelde Nederlander ziet 4.000 advertenties per dag. Ze swipen ze weg zonder te knipperen. Maar een flyer op de mat? Die pakt iemand op.',
    leestijd: '4 min',
    datum: '8 februari 2026',
  },
  {
    slug: 'eerste-kennismaking',
    categorie: 'Marketing',
    titel: 'De Eerste Kennismaking: Jouw Flyer als Start van de Klantreis',
    samenvatting: 'Nieuwe bewoners kiezen hun vaste kapper, bakker en stamkroeg in de eerste 30 dagen. Dat venster is goud. Hoe gebruik je het goed?',
    leestijd: '5 min',
    datum: '1 februari 2026',
  },
];

/** Blog overview client component with hover interactions. */
export default function Blog() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Kennis & Kabaal</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', fontWeight: 400, marginBottom: '12px' }}>Onze kijk op<br /><em style={{ color: 'var(--muted)' }}>lokale marketing</em></h1>
        <p style={{ fontSize: '15px', color: 'var(--muted)', maxWidth: '540px', lineHeight: 1.65, marginBottom: '56px' }}>
          Artikelen over hyper-lokale marketing, de kracht van fysieke media en hoe je als lokale ondernemer wint van de grote jongens.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {ARTIKELEN.map(a => (
            <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px', height: '100%', transition: 'border-color 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', background: 'var(--green-bg)', padding: '3px 8px', borderRadius: '2px', letterSpacing: '.06em' }}>{a.categorie.toUpperCase()}</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{a.leestijd}</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '10px', lineHeight: 1.2 }}>{a.titel}</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '20px' }}>{a.samenvatting}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{a.datum}</span>
                  <span style={{ fontSize: '12px', color: 'var(--green-dim)', fontWeight: 600 }}>Lees verder →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '12px' }}>
        <span>© 2026 LokaalKabaal B.V.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/voorwaarden" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Voorwaarden</Link>
          <Link href="/contact" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contact</Link>
          <Link href="/over-ons" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Over ons</Link>
        </div>
      </footer>
    </div>
  );
}
