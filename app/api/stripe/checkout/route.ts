import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAuth } from '@/lib/auth';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });
}

// ─── Tier-prijzen ─────────────────────────────────────────────────────────────
//
// A6 dubbelzijdig is standaard in elk pakket. Jaarcontract: 15% korting.
//
// Starter: 1 campagne  · €349/m (300 flyers/mnd, max 100 km)
// Pro:     3 campagnes · €499/m (400 flyers/mnd, max 200 km)
// Agency:  Onbeperkt   · €649/m (500 flyers/mnd, onbeperkt werkgebied)

import { TIERS, YEARLY_DISCOUNT, type Tier as TierType } from '@/lib/tiers';

const TIER_PRICES: Record<TierType, { monthly: number; yearlyTotal: number; name: string; maxCampaigns: number | null }> = {
  starter: {
    monthly:     Math.round(TIERS.starter.priceMonthly * 100),
    yearlyTotal: Math.round(TIERS.starter.priceMonthly * (1 - YEARLY_DISCOUNT) * 12 * 100),
    name: 'LokaalKabaal Starter',
    maxCampaigns: TIERS.starter.maxCampaigns,
  },
  pro: {
    monthly:     Math.round(TIERS.pro.priceMonthly * 100),
    yearlyTotal: Math.round(TIERS.pro.priceMonthly * (1 - YEARLY_DISCOUNT) * 12 * 100),
    name: 'LokaalKabaal Pro',
    maxCampaigns: TIERS.pro.maxCampaigns,
  },
  agency: {
    monthly:     Math.round(TIERS.agency.priceMonthly * 100),
    yearlyTotal: Math.round(TIERS.agency.priceMonthly * (1 - YEARLY_DISCOUNT) * 12 * 100),
    name: 'LokaalKabaal Agency',
    maxCampaigns: TIERS.agency.maxCampaigns,
  },
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

    const tierConfig = TIER_PRICES[tier as TierType];
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
                `${TIERS[tier as TierType].includedFlyers} flyers per maand inbegrepen`,
                'A6 dubbelzijdig standaard · incl. print en PostNL-bezorging',
                isYearly ? 'Jaarcontract (-15%)' : 'Maandelijks opzegbaar',
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
            ? `Het volledige jaarbedrag (€${(tierConfig.yearlyTotal / 100).toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) wordt direct afgeschreven via incasso.`
            : 'De eerste maand wordt direct afgeschreven via automatische incasso op de 1e.',
        },
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Betaling starten mislukt' }, { status: 500 });
  }
}
