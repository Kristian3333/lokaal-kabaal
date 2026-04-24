import type { Metadata } from 'next';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'White-label: LokaalKabaal voor marketingbureaus',
  description: 'Beheer meerdere lokale klanten onder jouw eigen merk. Centrale billing, per-klant dashboards, eigen domein en logo.',
  alternates: { canonical: 'https://lokaalkabaal.agency/white-label' },
  openGraph: {
    title: 'White-label LokaalKabaal voor bureaus',
    description: 'Flyer-automation onder jouw merk, centrale billing, per-klant dashboards.',
    url: 'https://lokaalkabaal.agency/white-label',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('White-label flyer automation') +
        '&subtitle=' +
        encodeURIComponent('Powered by LokaalKabaal onder jouw merk') +
        '&badge=' +
        encodeURIComponent('Bureaus'),
    ],
  },
};

const FEATURES = [
  { titel: 'Jouw merk, jouw domein', tekst: 'app.jouwbureau.nl draait op onze infra maar laat jouw logo + kleuren zien. Retailers weten niet dat wij achter de schermen de distributie doen.' },
  { titel: 'Central workspace', tekst: 'Eén login voor het bureau, schakel tussen elke klantaccount zonder uit te loggen. Handig voor team-members met 10+ klanten.' },
  { titel: 'Gebundelde billing', tekst: 'Eén Stripe-factuur per maand voor alle klanten. Jij factureert je klanten zelf + houdt de marge op onze wholesale-tarieven.' },
  { titel: 'White-label e-mails', tekst: 'Welkomst-, dispatch- en rapport-emails komen van jouw-bureau@ met jouw styling en signature.' },
  { titel: 'Multi-brand flyer templates', tekst: 'Upload per klant de brand-kit (kleuren, fonts, logo) en de template-marketplace past zich automatisch aan.' },
  { titel: 'Bureau-dashboard', tekst: 'Verzamel-stats over al jouw klanten: wie converteert het best, welke campagnes lopen, waar zit retention-risico. Ideaal voor QBRs.' },
];

export default function WhiteLabelPage(): React.JSX.Element {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <section style={{ background: 'var(--ink)', color: '#fff', padding: '80px 40px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.25)',
            borderRadius: '999px', padding: '4px 14px', marginBottom: '20px',
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#00E87A',
          }}>
            Voor bureaus · white-label
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Bied flyer-automation aan onder <em style={{ color: 'rgba(255,255,255,0.55)' }}>jouw merk.</em>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '640px' }}>
            LokaalKabaal draait onder de motorkap, jouw bureau levert de relatie. Beheer 5 tot 500 klanten in één workspace, één factuur per maand, hoge marges op onze wholesale-tarieven.
          </p>
        </div>
      </section>

      <section style={{ padding: '56px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }} className="wl-grid">
          <style>{`
            @media (max-width: 700px) {
              .wl-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
          {FEATURES.map(f => (
            <div key={f.titel} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '22px 24px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginBottom: '6px' }}>{f.titel}</div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{f.tekst}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 48px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '24px 28px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Wholesale tarieven
          </div>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--ink)' }}>
            Per aangesloten klant: 30% korting op onze retail-tiers. Een Pro-abonnement dat €499/mnd kost voor een directe klant wordt €349/mnd wholesale voor jouw bureau. Jij verkoopt aan de retailer voor eigen rekening.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '8px', lineHeight: 1.6 }}>
            Minimum commitment: 5 actieve klanten. Geen setup-fee. Maandelijks opzegbaar.
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            Praat met ons team
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            Vertel over jouw klantenportfolio, dan configureren we een pilot-workspace voor een aantal kwalificerende klanten.
          </p>
          <a href="mailto:bureaus@lokaalkabaal.agency?subject=White-label%20pilot" style={{
            display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Plan kennismakingscall →
          </a>
        </div>
      </section>
    </div>
  );
}
