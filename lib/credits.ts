import { eq, sql } from 'drizzle-orm';
import { requireDb } from '@/lib/db';
import { creditLedger } from '@/lib/schema';

/**
 * Add surplus credits when fewer flyers were sent than expected in a month.
 * A positive aantalFlyers entry represents unspent flyers that can be used later.
 */
export async function addSurplusCredits(
  retailerId: string,
  campagneId: string,
  expectedCount: number,
  actualSent: number,
  maand: string,
): Promise<void> {
  const surplus = expectedCount - actualSent;
  if (surplus <= 0) return;

  const db = requireDb();
  await db.insert(creditLedger).values({
    retailerId,
    campagneId,
    reden: 'surplus',
    aantalFlyers: surplus,
    maand,
    toelichting: `${surplus} flyers niet verstuurd in ${maand} (verwacht: ${expectedCount}, verstuurd: ${actualSent})`,
  });
}

/**
 * Get the total available credit balance (in flyers) for a retailer.
 * Sums all ledger entries; positive entries are surplus, negative are consumed.
 */
export async function getAvailableCredits(retailerId: string): Promise<number> {
  const db = requireDb();
  const result = await db
    .select({ total: sql<number>`coalesce(sum(${creditLedger.aantalFlyers}), 0)` })
    .from(creditLedger)
    .where(eq(creditLedger.retailerId, retailerId));

  const total = Number(result[0]?.total ?? 0);
  return Math.max(0, total);
}

/**
 * Consume credits for a campaign dispatch.
 * Inserts a negative ledger entry for the amount actually consumed.
 * Returns the number of credits actually consumed (capped at available balance).
 */
export async function consumeCredits(
  retailerId: string,
  campagneId: string,
  count: number,
  maand: string,
): Promise<number> {
  if (count <= 0) return 0;

  const available = await getAvailableCredits(retailerId);
  const consumed = Math.min(count, available);
  if (consumed === 0) return 0;

  const db = requireDb();
  await db.insert(creditLedger).values({
    retailerId,
    campagneId,
    reden: 'uitbetaling',
    aantalFlyers: -consumed,
    maand,
    toelichting: `${consumed} credits verbruikt voor campagne in ${maand}`,
  });

  return consumed;
}
