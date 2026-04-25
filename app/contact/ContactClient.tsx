'use client';

import Link from 'next/link';
import { useState } from 'react';
import Nav from '@/components/Nav';
import { CONTACT_SUPPORT_EMAIL } from '@/lib/contact-config';

const FAQS = [
  {
    v: 'Wat is het minimum aantal flyers?',
    a: '250 flyers per campagne. Toegankelijk voor de lokale snackbar, de buurtkappers en de stucadoor om de hoek.',
  },
  {
    v: 'Wanneer worden de flyers bezorgd?',
    a: 'Elke maand tussen de 28e en 30e. Rond de 20e trekken we verse Kadaster-data voor jouw werkgebied en daarna gaat de bulkorder naar de drukker, zodat de flyers eind van de maand bij alle nieuwe bewoners op de mat liggen.',
  },
  {
    v: 'Werken jullie alleen in grote steden?',
    a: 'Nee. We zijn actief in heel Nederland -- van Amsterdam tot Zeeland. Zolang er mensen verhuizen, kunnen wij flyers bezorgen.',
  },
  {
    v: 'Wat als er minder nieuwe bewoners zijn dan ik besteld heb?',
    a: 'Dan schrijven wij credits bij voor de niet-bezorgde exemplaren. Je betaalt nooit voor flyers die niet zijn bezorgd.',
  },
];

/** Contact page client component with form state and FAQ. */
export default function Contact() {
  const [form, setForm] = useState({ naam: '', email: '', bericht: '', website: '' });
  const [verzonden, setVerzonden] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setVerzonden(true);
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === 'string' ? data.error : 'Er ging iets mis. Probeer het opnieuw.');
    } catch {
      setError('Geen verbinding. Controleer je internet en probeer opnieuw.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 40px' }}>
        {/* Hero */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Contact</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '52px', fontWeight: 400, marginBottom: '12px', lineHeight: 1.1 }}>
            Zeg het maar.
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', maxWidth: '500px', lineHeight: 1.6 }}>
            Geen chatbot. Geen ticketsysteem. Gewoon een mens die antwoordt -- binnen één werkdag.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
          {/* Contactformulier */}
          <div>
            {verzonden ? (
              <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.3)', borderRadius: 'var(--radius)', padding: '32px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--green)', marginBottom: '12px' }}>✓</div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '8px' }}>Bericht ontvangen</h2>
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>We reageren binnen één werkdag. Check je spam als je niks hoort.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="contact-naam" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Naam</label>
                  <input
                    id="contact-naam"
                    type="text" required placeholder="Jouw naam"
                    autoComplete="name"
                    value={form.naam} onChange={e => setForm(f => ({ ...f, naam: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>E-mail</label>
                  <input
                    id="contact-email"
                    type="email" required placeholder="jij@bedrijf.nl"
                    autoComplete="email"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label htmlFor="contact-bericht" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Bericht</label>
                  <textarea
                    id="contact-bericht"
                    required rows={6} placeholder="Wat wil je weten of zeggen?"
                    value={form.bericht} onChange={e => setForm(f => ({ ...f, bericht: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: '#fff', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}
                  />
                </div>
                {/* Honeypot: invisible to humans, irresistible to dumb form-fillers. */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                  <label htmlFor="contact-website">Website (laat leeg)</label>
                  <input
                    id="contact-website"
                    type="text" tabIndex={-1} autoComplete="off"
                    value={form.website}
                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  />
                </div>
                {error && (
                  <div role="alert" style={{ background: 'var(--red-bg)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 'var(--radius)', padding: '10px 12px', fontSize: '13px', color: 'var(--red)' }}>
                    {error}
                  </div>
                )}
                <button type="submit" disabled={submitting} style={{ padding: '13px 24px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px', cursor: submitting ? 'progress' : 'pointer', alignSelf: 'flex-start', opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Versturen...' : 'Versturen →'}
                </button>
              </form>
            )}
          </div>

          {/* Contactinfo + FAQ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Kaartje */}
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px' }}>Direct contact</h3>
              {[
                { icon: '✉', label: 'E-mail', val: CONTACT_SUPPORT_EMAIL },
                { icon: '📍', label: 'Adres', val: 'Nederland' },
                { icon: '🕐', label: 'Bereikbaar', val: 'Ma–Vr · 09:00–17:00' },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{val}</div>
                  </div>
                </div>
              ))}
              <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5, marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                Voor directe vragen kun je ook mailen naar onze ondersteuningsinbox: {CONTACT_SUPPORT_EMAIL}
              </p>
            </div>

            {/* FAQ */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px' }}>Veel gestelde vragen</h3>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ marginBottom: '16px', padding: '16px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{faq.v}</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>{faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '12px' }}>
        <span>© 2026 LokaalKabaal B.V.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/voorwaarden" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Voorwaarden</Link>
          <Link href="/contact" style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}>Contact</Link>
          <Link href="/over-ons" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Over ons</Link>
        </div>
      </footer>
    </div>
  );
}
