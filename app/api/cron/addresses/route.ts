import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import {
  retailers, campaigns, flyerVerifications, creditLedger,
} from '../../../../lib/schema';
import { eq, and, lte, gte, sql } from 'drizzle-orm';
import { generateVerificationCode, buildQRUrl } from '../../../../lib/verification';

export const maxDuration = 300;

const ALTUM_BASE = 'https://api.altum.ai/v1';
const PRINTONE_BASE = 'https://api.print.one/v2';

// ─── Auth ─────────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

// ─── Altum: nieuwe woningoverdrachten per PC4 ─────────────────────────────────

interface AltumAddress {
  id: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  transactionDate: string;
}

async function fetchAltumAddresses(
  pc4Lijst: string[],
  maandStr: string, // YYYY-MM-DD (eerste dag van de maand)
): Promise<AltumAddress[]> {
  const key = process.env.ALTUM_API_KEY;
  if (!key) {
    // Geen sleutel — retourneer mock data voor dev/test
    return pc4Lijst.slice(0, 3).map((pc4, i) => ({
      id: `mock-${pc4}-${i}`,
      street: 'Teststraat',
      houseNumber: String(i + 1),
      postalCode: `${pc4} AB`,
      city: 'Teststad',
      transactionDate: maandStr,
    }));
  }

  // Bereken het einde van de maand
  const van = new Date(maandStr);
  const tot = new Date(van.getFullYear(), van.getMonth() + 1, 0); // laatste dag van de maand
  const totStr = tot.toISOString().slice(0, 10);

  const res = await fetch(`${ALTUM_BASE}/transactions/search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      postal_codes: pc4Lijst,
      filters: {
        transaction_date: { after: maandStr, before: totStr },
      },
      limit: 500,
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Altum ${res.status}: ${text}`);
  }

  const data = await res.json();
  const raw: Record<string, unknown>[] = data.transactions ?? data.addresses ?? [];

  return raw.map((t) => ({
    id: String(t.id ?? t.transaction_id ?? Math.random()),
    street: String(t.street ?? t.straat ?? ''),
    houseNumber: String(t.house_number ?? t.huisnummer ?? ''),
    postalCode: String(t.postal_code ?? t.postcode ?? ''),
    city: String(t.city ?? t.stad ?? ''),
    transactionDate: String(t.transaction_date ?? t.datum ?? maandStr),
  }));
}

// ─── Print.one: verifieer template + maak order aan ──────────────────────────

async function po<T>(path: string, method = 'GET', body?: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const key = process.env.PRINTONE_API_KEY ?? '';
  const res = await fetch(`${PRINTONE_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': key },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: data as T };
}

async function sendPrintoneOrder(params: {
  templateId: string;
  recipient: { name: string; address: string; city: string; postalCode: string };
  sender: { name: string; address: string; city: string; postalCode: string };
  finish?: string;
}): Promise<{ orderId: string } | null> {
  if (!process.env.PRINTONE_API_KEY) return null; // geen API key → skip verzending

  const result = await po<{ id?: string; message?: string[] }>('/orders', 'POST', {
    templateId: params.templateId,
    finish: params.finish ?? 'GLOSSY',
    sender: { ...params.sender, country: 'NL' },
    recipient: { ...params.recipient, country: 'NL' },
  });

  if (!result.ok) {
    console.warn('[cron] Print.one order mislukt:', result.data);
    return null;
  }
  return { orderId: (result.data as { id: string }).id };
}

// ─── Hulpfunctie: huidige batch maand als YYYY-MM-DD ─────────────────────────

function batchMaand(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

// ─── Beperk concurrency voor API-calls ───────────────────────────────────────

async function withConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let i = 0;
  async function next() {
    if (i >= items.length) return;
    const idx = i++;
    await fn(items[idx], idx);
    await next();
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
}

// ─── Standaard afzenderadres ──────────────────────────────────────────────────

const SENDER_DEFAULT = {
  name:       'LokaalKabaal',
  address:    'Postbus 1000',
  city:       'Amsterdam',
  postalCode: '1000 AA',
};

// ─── GET /api/cron/addresses ──────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ error: 'DATABASE_URL niet geconfigureerd' }, { status: 503 });
  }

  const maand = batchMaand(); // bijv. '2026-03-01'
  const now   = new Date();

  console.log(`[cron] batch gestart — maand: ${maand}`);

  // ── 1. Haal actieve campagnes op voor deze maand ─────────────────────────
  const activeCampaigns = await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.status, 'actief'),
        lte(campaigns.startMaand, maand),
        gte(campaigns.eindMaand, maand),
      ),
    );

  console.log(`[cron] ${activeCampaigns.length} actieve campagne(s) gevonden`);

  const resultaten: Array<{
    campagneId: string;
    naam: string;
    retailerEmail?: string;
    adressen: number;
    verzonden: number;
    credits: number;
    fout?: string;
  }> = [];

  // ── 2. Verwerk elke campagne ──────────────────────────────────────────────
  for (const campagne of activeCampaigns) {
    const result = {
      campagneId: campagne.id,
      naam: campagne.naam,
      retailerEmail: undefined as string | undefined,
      adressen: 0,
      verzonden: 0,
      credits: 0,
      fout: undefined as string | undefined,
    };

    try {
      // Haal retailer op voor afzendergegevens
      const retailerRows = await db
        .select()
        .from(retailers)
        .where(eq(retailers.id, campagne.retailerId))
        .limit(1);
      const retailer = retailerRows[0];
      if (!retailer) throw new Error('Retailer niet gevonden');
      result.retailerEmail = retailer.email;

      // PC4-lijst ophalen
      const pc4Lijst: string[] = campagne.pc4Lijst
        ? campagne.pc4Lijst.split(',').map((p) => p.trim()).filter(Boolean)
        : [];

      if (pc4Lijst.length === 0) {
        result.fout = 'Geen PC4-codes geconfigureerd';
        resultaten.push(result);
        continue;
      }

      // Adressen ophalen van Altum
      let adressen = await fetchAltumAddresses(pc4Lijst, maand);
      result.adressen = adressen.length;

      // Cap op verwacht aantal
      if (adressen.length > campagne.verwachtAantalPerMaand) {
        adressen = adressen.slice(0, campagne.verwachtAantalPerMaand);
      }

      const werkelijkeAantal = adressen.length;
      const surplusFlyers = campagne.verwachtAantalPerMaand - werkelijkeAantal;

      // ── 3. Verificatiecodes aanmaken + Print.one orders ──────────────────
      const verzendTaken: Array<() => Promise<void>> = [];

      for (const adres of adressen) {
        verzendTaken.push(async () => {
          const code = generateVerificationCode();
          const qrUrl = buildQRUrl(code);
          const geldigTot = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          const volledigAdres = `${adres.street} ${adres.houseNumber}`;

          // Sla verificatiecode op
          try {
            await db!.insert(flyerVerifications).values({
              code,
              adres: volledigAdres,
              postcode: adres.postalCode,
              stad: adres.city,
              retailerId: campagne.retailerId,
              campagneId: campagne.id,
              overdrachtDatum: adres.transactionDate,
              geldigTot,
            });
          } catch (dbErr) {
            console.warn(`[cron] DB insert verificatie mislukt (${code}):`, dbErr);
            return;
          }

          // Print.one order aanmaken (alleen als template geconfigureerd is)
          if (campagne.flyerTemplateId) {
            const ontvanger = {
              name:       `Bewoners ${volledigAdres}`,
              address:    volledigAdres,
              city:       adres.city,
              postalCode: adres.postalCode,
            };
            const afzender = {
              name:       retailer.bedrijfsnaam,
              address:    SENDER_DEFAULT.address,
              city:       SENDER_DEFAULT.city,
              postalCode: SENDER_DEFAULT.postalCode,
            };
            const order = await sendPrintoneOrder({
              templateId: campagne.flyerTemplateId,
              recipient:  ontvanger,
              sender:     afzender,
            });
            if (order) {
              result.verzonden++;
            }
          } else {
            // Geen template: tel als "klaar voor handmatige verzending"
            result.verzonden++;
          }
        });
      }

      // Verwerk met max 5 gelijktijdige requests
      await withConcurrency(verzendTaken, 5, (fn) => fn());

      // ── 4. Credit ledger bijwerken ────────────────────────────────────────
      if (surplusFlyers > 0) {
        // Er waren minder overdrachten dan verwacht → surplus bijschrijven
        await db!.insert(creditLedger).values({
          retailerId:   campagne.retailerId,
          campagneId:   campagne.id,
          reden:        'surplus',
          aantalFlyers: surplusFlyers,
          maand,
          toelichting:  `Batch ${maand}: ${werkelijkeAantal}/${campagne.verwachtAantalPerMaand} adressen gevonden`,
        });
        result.credits = surplusFlyers;
      }

      // ── 5. Laatste batch: campagne afronden + dashboard verlengen ─────────
      const isLaatsteBatch = campagne.eindMaand === maand;
      if (isLaatsteBatch) {
        const dashboardActiefTot = new Date(now.getFullYear(), now.getMonth() + 2, 0); // einde volgende maand
        await Promise.all([
          db!
            .update(campaigns)
            .set({ status: 'afgerond', updatedAt: new Date() })
            .where(eq(campaigns.id, campagne.id)),
          db!
            .update(retailers)
            .set({ dashboardActiefTot, updatedAt: new Date() })
            .where(eq(retailers.id, campagne.retailerId)),
        ]);
        console.log(`[cron] campagne ${campagne.naam} afgerond — dashboard actief tot ${dashboardActiefTot.toISOString()}`);
      }

    } catch (err) {
      result.fout = err instanceof Error ? err.message : String(err);
      console.error(`[cron] fout bij campagne ${campagne.id}:`, err);
    }

    resultaten.push(result);
  }

  const totaalVerzonden = resultaten.reduce((s, r) => s + r.verzonden, 0);
  const totaalCredits   = resultaten.reduce((s, r) => s + r.credits, 0);
  const fouten          = resultaten.filter((r) => r.fout);

  console.log(`[cron] batch klaar — ${totaalVerzonden} flyers, ${totaalCredits} credits, ${fouten.length} fouten`);

  return NextResponse.json({
    gestart:         now.toISOString(),
    maand,
    campagnes:       activeCampaigns.length,
    totaalVerzonden,
    totaalCredits,
    fouten:          fouten.length,
    resultaten,
  });
}
