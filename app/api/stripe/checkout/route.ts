import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });
}

// ─── Tier-prijzen (maandelijks, in cents) ─────────────────────────────────────
//
// Print.one A6 bulktarief (300+ stuks): €0,69/stuk incl. bezorging
// Ons tarief: +30% premium. Prijzen dekken platform + print + bezorging.
//
// Buurt:  10 pc4  · €249/m  · €187/m (jaarlijks)
// Wijk:   50 pc4  · €499/m  · €374/m (jaarlijks)
// Stad:   onbep.  · €999/m  · €749/m (jaarlijks)

const TIER_PRICES: Record<string, { monthly: number; yearly: number; name: string; maxPc4s: number | null }> = {
  buurt: { monthly: 24900, yearly: 18700, name: 'LokaalKabaal Buurt',  maxPc4s: 10 },
  wijk:  { monthly: 49900, yearly: 37400, name: 'LokaalKabaal Wijk',   maxPc4s: 50 },
  stad:  { monthly: 99900, yearly: 74900, name: 'LokaalKabaal Stad',   maxPc4s: null },
};

export async function POST(req: NextRequest) {
  try {
    const {
      tier,           // 'buurt' | 'wijk' | 'stad'
      billing,        // 'monthly' | 'yearly'
      email,          // klant e-mail
      bedrijfsnaam,   // bedrijfsnaam
      branche,        // branche/categorie
      postcodes,      // string[] — geselecteerde pc4's
    } = await req.json();

    if (!tier || !billing || !email) {
      return NextResponse.json({ error: 'tier, billing en email zijn verplicht' }, { status: 400 });
    }

    const tierConfig = TIER_PRICES[tier as string];
    if (!tierConfig) {
      return NextResponse.json({ error: `Ongeldig pakket: ${tier}` }, { status: 400 });
    }

    const isYearly = billing === 'yearly';
    const unitAmount = isYearly ? tierConfig.yearly * 12 : tierConfig.monthly;
    const interval = isYearly ? 'year' : 'month';

    const stripe = getStripe();

    // Hergebruik bestaande Stripe klant op basis van e-mail
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0]
      ?? await stripe.customers.create({
           email,
           name: bedrijfsnaam,
           metadata: { platform: 'lokaalkabaal' },
         });

    const pc4String = Array.isArray(postcodes) ? postcodes.join(',') : (postcodes ?? '');

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card', 'ideal'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${tierConfig.name} — ${branche ?? 'Branche'}`,
              description: [
                tierConfig.maxPc4s ? `${tierConfig.maxPc4s} postcodegebieden` : 'Onbeperkt postcodegebieden',
                'Min. 300 flyers per batch',
                'A6 standaard incl. bezorging',
                isYearly ? 'Jaarcontract (−25%)' : 'Maandelijks opzegbaar',
              ].join(' · '),
              metadata: { tier, branche: branche ?? '' },
            },
            unit_amount: unitAmount,
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          tier,
          billing,
          branche: branche ?? '',
          bedrijfsnaam: bedrijfsnaam ?? '',
          postcodes: pc4String,
          isJaarcontract: isYearly ? 'true' : 'false',
          platform: 'lokaalkabaal',
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'}/app?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'}/app?payment=cancelled`,
      locale: 'nl',
      custom_text: {
        submit: {
          message: isYearly
            ? 'Het volledige jaarbedrag wordt direct afgeschreven. Bij jaarcontract Stad is persoonlijke flyerhulp inbegrepen.'
            : 'De eerste maand wordt direct afgeschreven. Maandelijks opzegbaar.',
        },
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    console.error('[stripe/checkout]', err);
    const msg = err instanceof Error ? err.message : 'Onbekende fout';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
