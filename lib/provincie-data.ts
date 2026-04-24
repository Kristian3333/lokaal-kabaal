/**
 * Aggregated per-province new-mover estimates, derived from the GEMEENTEN
 * dataset plus the national CBS baseline of ~5.5% ownership turnover per
 * year divided by 2.1 persons per household / 12 months.
 *
 * Used by the public NL verhuisdata dashboard so journalists,
 * municipalities, and retailers can link-bait landing pages without
 * creating an account.
 */

import { GEMEENTEN, estimateNewMoversPerMonth } from '@/lib/gemeenten';

export interface ProvincieStats {
  provincie: string;
  aantalGemeenten: number;
  totaleInwoners: number;
  geschatteNieuweBewonersPerMaand: number;
  topGemeenten: { slug: string; naam: string; inwoners: number }[];
}

export function buildProvincieStats(): ProvincieStats[] {
  const byProv = new Map<string, ProvincieStats>();
  for (const g of GEMEENTEN) {
    let entry = byProv.get(g.provincie);
    if (!entry) {
      entry = {
        provincie: g.provincie,
        aantalGemeenten: 0,
        totaleInwoners: 0,
        geschatteNieuweBewonersPerMaand: 0,
        topGemeenten: [],
      };
      byProv.set(g.provincie, entry);
    }
    entry.aantalGemeenten += 1;
    entry.totaleInwoners += g.inwoners;
    entry.geschatteNieuweBewonersPerMaand += estimateNewMoversPerMonth(g.inwoners);
    entry.topGemeenten.push({ slug: g.slug, naam: g.naam, inwoners: g.inwoners });
  }
  // Sort top gemeenten per province by population, keep top 3
  const result = Array.from(byProv.values()).map(p => ({
    ...p,
    topGemeenten: p.topGemeenten.sort((a, b) => b.inwoners - a.inwoners).slice(0, 3),
  }));
  // Sort provincies by new-movers count desc
  return result.sort((a, b) => b.geschatteNieuweBewonersPerMaand - a.geschatteNieuweBewonersPerMaand);
}
