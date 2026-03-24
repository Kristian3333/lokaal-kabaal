import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAuth } from '@/lib/auth';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });
}

// ─── Tier-prijzen ─────────────────────────────────────────────────────────────
//
// Starter:  1 campagne  · €99/m  · €891/jaar  (= €74,25/m · −25%)
// Pro:      3 campagnes · €199/m · €1.791/jaar (= €149,25/m · −25%)
// Agency:   Onbeperkt   · €499/m · €4.491/jaar (= €374,25/m · −25%)

const TIER_PRICES: Record<string, { monthly: number; yearlyTotal: number; name: string; maxCampaigns: number | null }> = {
  starter: { monthly: 9900,  yearlyTotal:  89100, name: 'LokaalKabaal Starter', maxCampaigns: 1 },
  pro:     { monthly: 19900, yearlyTotal: 179100, name: 'LokaalKabaal Pro',     maxCampaigns: 3 },
  agency:  { monthly: 49900, yearlyTotal: 449100, name: 'LokaalKabaal Agency',  maxCampaigns: null },
};

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const {
      tier,           // 'starter' | 'pro' | 'agency'
      billing,        // 'monthly' | 'yearly'
      email,
      bedrijfsnaam,
      branche,
      // Campagne-context (optioneel, voor metadata)
      centrum,
      duurMaanden,
      verwachtAantalPerMaand,
      formaat,
      dubbelzijdig,
    } = await req.json();

    if (!tier || !email || !billing) {
      return NextResponse.json({ error: 'tier, email en billing zijn verplicht' }, { status: 400 });
    }

    const tierConfig = TIER_PRICES[tier as string];
    if (!tierConfig) {
      return NextResponse.json({ error: `Ongeldig pakket: ${tier}` }, { status: 400 });
    }

    const stripe = getStripe();

    // Hergebruik bestaande Stripe klant op basis van e-mail
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0]
      ?? await stripe.customers.create({
           email,
           name: bedrijfsnaam,
           metadata: { platform: 'lokaalkabaal' },
         });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const isYearly = billing === 'yearly';

    // Jaarlijks: één betaling van het totale jaarbedrag (incasso-vriendelijk)
    // Maandelijks: terugkerend maandbedrag
    const unitAmount = isYearly ? tierConfig.yearlyTotal : tierConfig.monthly;
    const interval: 'month' | 'year' = isYearly ? 'year' : 'month';

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card', 'ideal', 'sepa_debit'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${tierConfig.name} - ${branche ?? 'Lokale retailer'}`,
              description: [
                tierConfig.maxCampaigns !== null
                  ? `Max. ${tierConfig.maxCampaigns} gelijktijdige campagne${tierConfig.maxCampaigns !== 1 ? 's' : ''}`
                  : 'Onbeperkt campagnes',
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
          branche:              branche ?? '',
          bedrijfsnaam:         bedrijfsnaam ?? '',
          isJaarcontract:       isYearly ? 'true' : 'false',
          centrum:              centrum ?? '',
          duurMaanden:          String(duurMaanden ?? 1),
          verwachtAantalPerMaand: String(verwachtAantalPerMaand ?? 0),
          formaat:              formaat ?? 'a6',
          dubbelzijdig:         dubbelzijdig ? 'true' : 'false',
          platform:             'lokaalkabaal',
        },
      },
      success_url: `${baseUrl}/app?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/app?payment=cancelled`,
      locale: 'nl',
      custom_text: {
        submit: {
          message: isYearly
            ? `Het volledige jaarbedrag (€${(tierConfig.yearlyTotal / 100).toLocaleString('nl')}) wordt direct afgeschreven via incasso.`
            : 'De eerste maand wordt direct afgeschreven via automatische incasso op de 25e.',
        },
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Betaling starten mislukt' }, { status: 500 });
  }
}
