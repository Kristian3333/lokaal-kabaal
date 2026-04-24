/**
 * Monthly report data-shaping helpers.
 *
 * Input: raw verification rows for a single retailer + campaign + month.
 * Output: a well-typed `MonthlyReport` that both the email renderer and
 * the PDF renderer consume so the two surfaces never drift apart.
 *
 * Kept pure so the cron can run it offline + vitest can cover all the
 * edge cases (empty month, zero scans, perfect 100% conversion).
 */

import { calcOverage } from '@/lib/tiers';
import type { Tier } from '@/lib/tiers';

export interface VerificationRow {
  postcode: string;
  verzondenOp: Date;
  interesseOp: Date | null;
  conversieOp: Date | null;
}

export interface MonthlyReportInput {
  retailer: { bedrijfsnaam: string; tier: Tier };
  campagne: { naam: string };
  maandLabel: string;          // e.g. 'april 2026'
  flyersVerzonden: number;
  verifications: VerificationRow[];
}

export interface MonthlyReport {
  title: string;
  period: string;
  flyersSent: number;
  scans: number;
  conversions: number;
  conversionRate: number;        // percentage with 1 decimal
  scanRate: number;              // percentage with 1 decimal
  topPostcodes: string[];        // up to 5 best-performing PC4s by scan-rate
  overageCount: number;
  overageEuros: number;
  tierLabel: string;
}

export function buildMonthlyReport(input: MonthlyReportInput): MonthlyReport {
  const scans = input.verifications.filter(v => v.interesseOp !== null).length;
  const conversions = input.verifications.filter(v => v.conversieOp !== null).length;
  const scanRate = input.flyersVerzonden > 0
    ? Math.round((scans / input.flyersVerzonden) * 1000) / 10
    : 0;
  const conversionRate = input.flyersVerzonden > 0
    ? Math.round((conversions / input.flyersVerzonden) * 1000) / 10
    : 0;

  // Bucket by PC4 to compute per-postcode scan-rate, then sort desc.
  const byPc4 = new Map<string, { sent: number; scans: number }>();
  for (const v of input.verifications) {
    const pc4 = (v.postcode || '').slice(0, 4);
    if (!pc4) continue;
    let entry = byPc4.get(pc4);
    if (!entry) {
      entry = { sent: 0, scans: 0 };
      byPc4.set(pc4, entry);
    }
    entry.sent += 1;
    if (v.interesseOp) entry.scans += 1;
  }
  const topPostcodes = Array.from(byPc4.entries())
    .filter(([, e]) => e.sent >= 5) // require minimum volume for stability
    .map(([pc4, e]) => ({ pc4, rate: e.scans / e.sent }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5)
    .map(e => e.pc4);

  const overage = calcOverage(input.retailer.tier, input.flyersVerzonden);

  return {
    title: `Maandrapport ${input.retailer.bedrijfsnaam}`,
    period: input.maandLabel,
    flyersSent: input.flyersVerzonden,
    scans,
    conversions,
    conversionRate,
    scanRate,
    topPostcodes,
    overageCount: overage.overageCount,
    overageEuros: overage.overageEuros,
    tierLabel: input.retailer.tier.toUpperCase(),
  };
}
