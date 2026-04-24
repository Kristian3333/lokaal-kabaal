/**
 * Yearly-contract upgrade experiment.
 *
 * Today jaarcontract shows a flat -15%. We want to A/B test against two
 * alternative incentives:
 *   - "15% korting" (control)
 *   - "Eerste maand gratis + 10% korting"
 *   - "Bonus 200 flyers deze maand"
 *
 * Bucket the retailer deterministically from their id so the same
 * retailer always sees the same variant across sessions (stable test).
 * The copy helper returns the pill + long-form text so a single source
 * of truth renders in PricingSection, the wizard step 8 pakketkeuze,
 * and the monthly upgrade-nudge email.
 */

import { TIERS, YEARLY_DISCOUNT, type Tier } from '@/lib/tiers';

export type YearlyIncentive = 'discount-15' | 'first-month-free' | 'bonus-flyers';

export interface YearlyIncentiveCopy {
  variant: YearlyIncentive;
  pill: string;           // short label e.g. "−15%"
  longTitle: string;      // "Jaarcontract: 15% korting"
  subtitle: string;       // "€296,65/mnd, 1 x per jaar gefactureerd"
  subtitlePerTier: (tier: Tier) => string;
}

/** Deterministic bucket assignment from a stable id. FNV-1a 32-bit hash. */
function bucket(id: string, n: number): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % n;
}

export function assignIncentive(retailerId: string): YearlyIncentive {
  const variants: YearlyIncentive[] = ['discount-15', 'first-month-free', 'bonus-flyers'];
  return variants[bucket(retailerId, variants.length)];
}

export function incentiveCopy(variant: YearlyIncentive): YearlyIncentiveCopy {
  if (variant === 'first-month-free') {
    return {
      variant,
      pill: '1e mnd gratis',
      longTitle: 'Jaarcontract: eerste maand gratis + 10% korting',
      subtitle: 'Jaar vooruit gefactureerd, maar betaal 11 maanden voor 12. Niet tussentijds opzegbaar.',
      subtitlePerTier: (tier: Tier) => {
        const monthly = TIERS[tier].priceMonthly;
        const discounted = Math.round(monthly * 0.9);
        return `€${discounted}/mnd effectief (1e maand gratis) -- bespaar €${monthly + (monthly - discounted) * 11} per jaar`;
      },
    };
  }
  if (variant === 'bonus-flyers') {
    return {
      variant,
      pill: '+200 flyers',
      longTitle: 'Jaarcontract: 200 bonus-flyers elke maand',
      subtitle: 'Elke maand 200 extra A6 dubbelzijdig bovenop je bundel. 12% effectieve korting op het jaartotaal.',
      subtitlePerTier: (tier: Tier) => {
        const base = TIERS[tier].includedFlyers;
        return `${base} + 200 bonus = ${base + 200} flyers / mnd in plaats van ${base}`;
      },
    };
  }
  // Default / control
  return {
    variant: 'discount-15',
    pill: `−${Math.round(YEARLY_DISCOUNT * 100)}%`,
    longTitle: `Jaarcontract: ${Math.round(YEARLY_DISCOUNT * 100)}% korting`,
    subtitle: 'Per jaar vooruit gefactureerd, niet tussentijds opzegbaar.',
    subtitlePerTier: (tier: Tier) => {
      const cfg = TIERS[tier];
      return `€${cfg.priceYearly.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mnd -- bespaar €${Math.round(cfg.priceMonthly * YEARLY_DISCOUNT * 12)} per jaar`;
    },
  };
}
