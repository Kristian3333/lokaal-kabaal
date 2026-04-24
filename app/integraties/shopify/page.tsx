import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Shopify & WooCommerce koppeling voor flyer-codes | LokaalKabaal',
  description: 'Koppel je webshop aan LokaalKabaal: flyer-codes worden automatisch verzilverd bij check-out, conversies lopen direct door naar je dashboard. Integratie via app + REST webhook.',
  alternates: { canonical: 'https://lokaalkabaal.agency/integraties/shopify' },
  openGraph: {
    title: 'Shopify + WooCommerce koppeling · LokaalKabaal',
    description: 'Automatische code-redemption bij check-out. Private app of webhook, jij kiest.',
    url: 'https://lokaalkabaal.agency/integraties/shopify',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('Shopify + WooCommerce') +
        '&subtitle=' +
        encodeURIComponent('Flyer-codes automatisch verzilverd bij check-out') +
        '&badge=' +
        encodeURIComponent('Integratie'),
    ],
  },
};

const VOORDELEN = [
  { titel: 'Automatische redemption', tekst: 'Klant vult de flyer-code in op de checkout. De webshop verifieert de code via onze API + trekt de korting automatisch af.' },
  { titel: 'Conversie direct zichtbaar', tekst: 'Elke succesvolle redemption loopt binnen 5 seconden door naar je LokaalKabaal dashboard. Je ziet PC4, order-waarde (optioneel) en de originele scan-date.' },
  { titel: 'Fraude-proof', tekst: 'Codes zijn single-use en scoped aan de originele retailer. Webshop krijgt een 400 als de code al verzilverd is of van een andere retailer komt.' },
  { titel: 'Geen PII naar ons', tekst: 'We vragen nooit de klant-gegevens op. Alleen de code, jouw retailer-ID en optioneel de order-waarde voor CLV-rapportage.' },
];

export default function ShopifyIntegratiePage(): React.JSX.Element {
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
            Integratie · Shopify · WooCommerce
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Flyer-codes automatisch <em style={{ color: 'rgba(255,255,255,0.55)' }}>verzilverd</em> bij check-out.
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '640px' }}>
            Wil je de korting-code niet handmatig controleren aan de kassa of webshop? Onze Shopify-app en WooCommerce-plugin doen dat voor je, plus de conversie verschijnt direct op je dashboard.
          </p>
        </div>
      </section>

      <section style={{ padding: '56px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '20px' }}>
          Waarom dit de moeite is
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }} className="int-grid">
          <style>{`
            @media (max-width: 700px) { .int-grid { grid-template-columns: 1fr !important; } }
          `}</style>
          {VOORDELEN.map(v => (
            <div key={v.titel} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '22px 24px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '6px' }}>{v.titel}</div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{v.tekst}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '10px' }}>
          Shopify (private app)
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
          Voor Shopify-winkels gebruik je onze private app. Deze installeert een discount-code validator script op de check-out en schrijft een scriptTag dat bij elke checkout de flyer-code checkt via <code>POST /api/codes/redeem</code>.
        </p>
        <pre style={{
          background: 'var(--ink)', color: '#e0e0e0',
          padding: '18px 20px', borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-mono)', fontSize: '12px', overflow: 'auto',
          marginBottom: '28px', lineHeight: 1.65,
        }}>
{`// Shopify script tag (installeert zichzelf in checkout.liquid)
fetch('https://lokaalkabaal.agency/api/codes/redeem', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': '\${process.env.LOKAAL_KABAAL_REDEEM_KEY}',
  },
  body: JSON.stringify({
    code: discountCode,
    retailerId: '\${window.LOKAAL_KABAAL_RETAILER_ID}',
    orderValue: orderTotal,  // optioneel, voor CLV
  }),
})
  .then(r => r.ok
    ? applyDiscount()
    : showInvalidCodeMessage()
  );`}
        </pre>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '10px' }}>
          WooCommerce (PHP plugin)
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
          De WooCommerce plugin hooks <code>woocommerce_coupon_is_valid</code> en doet dezelfde validatie. Installeer via WordPress admin, vul de retailer-ID en de redeem-key in, klaar.
        </p>
        <pre style={{
          background: 'var(--ink)', color: '#e0e0e0',
          padding: '18px 20px', borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-mono)', fontSize: '12px', overflow: 'auto',
          marginBottom: '28px', lineHeight: 1.65,
        }}>
{`<?php
add_filter('woocommerce_coupon_is_valid', function($valid, $coupon) {
  if (substr($coupon->get_code(), 0, 2) !== 'LK') return $valid;

  $resp = wp_remote_post('https://lokaalkabaal.agency/api/codes/redeem', [
    'headers' => [
      'X-API-Key' => get_option('lokaalkabaal_redeem_key'),
      'Content-Type' => 'application/json',
    ],
    'body' => wp_json_encode([
      'code' => $coupon->get_code(),
      'retailerId' => get_option('lokaalkabaal_retailer_id'),
    ]),
  ]);
  return wp_remote_retrieve_response_code($resp) === 200;
}, 10, 2);`}
        </pre>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '10px' }}>
          Webhook-alternatief (any platform)
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
          Werk je op Magento, Lightspeed of een custom stack? Gebruik onze webhook die bij elke <code>conversion.registered</code> event een payload naar jouw eigen endpoint pusht. Zie <Link href="/docs/webhooks" style={{ color: 'var(--green-dim)' }}>docs/webhooks</Link> voor payload-formaten en HMAC-verificatie.
        </p>
      </section>

      <section style={{ padding: '48px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            Plugin krijgen
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            De Shopify-app en WooCommerce-plugin zijn nu in private beta. Stuur ons je winkel-URL en retailer-ID via de mail, dan leveren we de installer + een ingestelde redeem-key.
          </p>
          <a href="mailto:integraties@lokaalkabaal.agency?subject=Shopify%20plugin%20aanvraag" style={{
            display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Vraag de plugin aan →
          </a>
        </div>
      </section>
    </div>
  );
}
