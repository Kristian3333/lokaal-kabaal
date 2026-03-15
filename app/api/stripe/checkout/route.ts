import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' }); }

export async function POST(req: NextRequest) {
  try {
    const {
      maxFlyers,       // number
      prijsPerFlyer,   // number (in cents would be cleaner, but we'll compute)
      formaat,         // 'a5' | 'a6' | 'a4'
      dubbelzijdig,    // boolean
      spec,            // branche string
      datum,           // ISO date string
      centrum,         // postcode
      email,           // customer email
      bedrijfsnaam,    // company name
    } = await req.json();

    if (!maxFlyers || !email) {
      return NextResponse.json({ error: 'maxFlyers en email zijn verplicht' }, { status: 400 });
    }

    const pricePerFlyer = berekenPrijsPerFlyer(maxFlyers, formaat, dubbelzijdig);
    const maxBudgetCents = Math.round(maxFlyers * pricePerFlyer * 100);

    // Maak Stripe klant aan (of hergebruik via email)
    const customers = await getStripe().customers.list({ email, limit: 1 });
    const customer = customers.data[0]
      ?? await getStripe().customers.create({
           email,
           name: bedrijfsnaam,
           metadata: { platform: 'lokaalkabaal' },
         });

    const session = await getStripe().checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card', 'ideal'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `LokaalKabaal Flyercampagne — ${spec}`,
              description: `Max ${maxFlyers.toLocaleString('nl')} flyers/maand · ${formaat.toUpperCase()}${dubbelzijdig ? ' dubbelzijdig' : ''} · ${centrum} e.o.`,
              metadata: { spec, datum, centrum, formaat, dubbelzijdig: String(dubbelzijdig) },
            },
            unit_amount: maxBudgetCents,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          maxFlyers: String(maxFlyers),
          formaat,
          dubbelzijdig: String(dubbelzijdig),
          spec,
          datum,
          centrum,
          pricePerFlyerCents: String(Math.round(pricePerFlyer * 100)),
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/app?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/app?payment=cancelled`,
      locale: 'nl',
      custom_text: {
        submit: { message: 'Je eerste maand wordt direct afgeschreven. Als er minder flyers worden verstuurd, ontvang je credit of rollover.' },
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    console.error('[stripe/checkout]', err);
    const msg = err instanceof Error ? err.message : 'Onbekende fout';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function berekenPrijsPerFlyer(aantalFlyers: number, formaat: string, dubbelzijdig: boolean): number {
  const base = aantalFlyers >= 1000 ? 0.39 : aantalFlyers >= 500 ? 0.49 : 0.59;
  const formaatExtra = formaat === 'a4' ? 0.08 : formaat === 'a6' ? -0.05 : 0;
  const dubbelExtra = dubbelzijdig ? 0.06 : 0;
  return base + formaatExtra + dubbelExtra;
}
