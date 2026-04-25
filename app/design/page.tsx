import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import { buildMailto } from '@/lib/contact-config';

export const metadata: Metadata = {
  title: 'Flyer design service: wij maken jouw flyer voor je',
  description: 'Geen tijd of geen ontwerper? Onze designers leveren binnen 2 werkdagen een druk-klare flyer. €49 per flyer, gratis voor Agency jaarcontract.',
  alternates: { canonical: 'https://lokaalkabaal.agency/design' },
  openGraph: {
    title: 'Flyer design op aanvraag · LokaalKabaal',
    description: 'Druk-klare flyer binnen 2 werkdagen. €49/flyer of gratis bij Agency jaarcontract.',
    url: 'https://lokaalkabaal.agency/design',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('Design on demand') +
        '&subtitle=' +
        encodeURIComponent('Druk-klare flyer binnen 2 werkdagen') +
        '&badge=' +
        encodeURIComponent('Add-on'),
    ],
  },
};

export default function DesignPage(): React.JSX.Element {
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
            Add-on · persoonlijke flyerhulp
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Wij ontwerpen de flyer, <em style={{ color: 'rgba(255,255,255,0.55)' }}>jij tekent af.</em>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '640px' }}>
            Geen tijd, geen ontwerper, geen AI-gedoe. Stuur je logo + welkomsaanbieding, onze in-house designers leveren binnen 2 werkdagen een druk-klare flyer voor jouw branche.
          </p>
        </div>
      </section>

      <section style={{ padding: '56px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '20px' }}>
          Zo werkt het
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }} className="design-steps">
          <style>{`
            @media (max-width: 760px) { .design-steps { grid-template-columns: 1fr 1fr !important; } }
            @media (max-width: 480px) { .design-steps { grid-template-columns: 1fr !important; } }
          `}</style>
          {[
            { n: '01', titel: 'Brief in 5 min',    tekst: 'Branche, logo, kleuren, welkomsaanbieding, 1-2 referentie-flyers.' },
            { n: '02', titel: '2 varianten binnen 2 dagen', tekst: 'Onze designer stuurt 2 richtingen, jij kiest er één.' },
            { n: '03', titel: 'Revisies + finetune',  tekst: 'Max 2 rondes feedback, meestal klaar binnen 24 uur.' },
            { n: '04', titel: 'Druk-klaar PDF', tekst: 'Print.one ready, inclusief 3mm afloop + CMYK. Direct inzetbaar.' },
          ].map(s => (
            <div key={s.n} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', marginBottom: '6px' }}>
                STAP {s.n}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px', lineHeight: 1.3 }}>
                {s.titel}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65 }}>
                {s.tekst}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="design-pricing">
          <style>{`
            @media (max-width: 700px) { .design-pricing { grid-template-columns: 1fr !important; } }
          `}</style>
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '24px 28px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>A-la-carte</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '6px' }}>€49<span style={{ fontSize: '14px', color: 'var(--muted)' }}>/flyer</span></div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
              Eenmalige aanvraag, geen abonnement. Handig als je er maar één per seizoen nodig hebt.
            </p>
          </div>
          <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '24px 28px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Gratis bij Agency jaar</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '6px' }}>€0<span style={{ fontSize: '14px', color: 'var(--muted)' }}>/flyer (max 4/jaar)</span></div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
              Agency jaarcontract bevat persoonlijke flyerhulp. Eén seizoenswissel per kwartaal voor je kosten.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            Klaar om een flyer te bestellen?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            Stuur ons een mail met je branding + welkomsaanbieding. Wij plannen de designer in en sturen binnen 2 werkdagen twee varianten.
          </p>
          <a href={buildMailto('design')} style={{
            display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Stuur designaanvraag →
          </a>
        </div>
      </section>
    </div>
  );
}
