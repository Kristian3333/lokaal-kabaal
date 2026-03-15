import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });

// POST /api/stripe/credit — verwerk credit of rollover na gedeeltelijke bezorging
// Dit endpoint wordt aangeroepen vanuit het dashboard als klant kiest voor credit of rollover.
export async function POST(req: NextRequest) {
  try {
    const {
      customerId,
      subscriptionId,
      actualFlyers,       // number — daadwerkelijk verstuurd op 25e
      maxFlyers,          // number — max waarvoor betaald
      pricePerFlyerCents, // number
      resolution,         // 'credit' | 'rollover'
    } = await req.json();

    if (!customerId || !subscriptionId || actualFlyers === undefined || !resolution) {
      return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 });
    }

    const notSentFlyers = Math.max(0, maxFlyers - actualFlyers);
    const surplusCents = notSentFlyers * pricePerFlyerCents;

    if (notSentFlyers === 0) {
      return NextResponse.json({ message: 'Geen surplus — alle flyers verstuurd', surplusCents: 0 });
    }

    if (resolution === 'credit') {
      // Voeg saldo toe aan Stripe klantbalans (negatief = credit voor klant)
      await stripe.customers.createBalanceTransaction(customerId, {
        amount: -surplusCents, // negatief = credit
        currency: 'eur',
        description: `Credit: ${notSentFlyers} niet-verstuurde flyers (automatisch verrekend op volgende factuur)`,
        metadata: { subscriptionId, notSentFlyers: String(notSentFlyers) },
      });

      return NextResponse.json({
        resolution: 'credit',
        creditCents: surplusCents,
        message: `€${(surplusCents / 100).toFixed(2)} gecrediteerd op jouw account. Dit wordt verrekend op de volgende factuur.`,
      });
    }

    if (resolution === 'rollover') {
      // Sla rollover op als metadata van de subscription
      // In productie: sla dit op in je eigen DB zodat de 25e-logica dit verwerkt
      await stripe.subscriptions.update(subscriptionId, {
        metadata: {
          rolloverFlyers: String(notSentFlyers),
          rolloverFromPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM
        },
      });

      return NextResponse.json({
        resolution: 'rollover',
        rolloverFlyers: notSentFlyers,
        message: `${notSentFlyers} flyers worden volgende maand als eerste verstuurd, bovenop de normale bezorging.`,
      });
    }

    return NextResponse.json({ error: 'Onbekende resolution' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Onbekende fout';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET /api/stripe/credit?customerId=xxx — haal klantbalans op
export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get('customerId');
  if (!customerId) return NextResponse.json({ error: 'customerId verplicht' }, { status: 400 });

  try {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    const balanceCents = customer.balance; // negatief = credit voor klant

    return NextResponse.json({
      customerId,
      creditCents: Math.abs(Math.min(0, balanceCents)), // alleen positief als er credit is
      debitCents: Math.max(0, balanceCents), // schuld
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Onbekende fout';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
