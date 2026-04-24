import { describe, it, expect } from 'vitest';
import {
  TIERS,
  TEST_ACCOUNTS,
  YEARLY_DISCOUNT,
  EXTRA_FLYER_PRICE_A6,
  isTestAccount,
  getTestAccount,
  canStartCampaign,
  calcOverage,
  buildOverageInvoiceItem,
  computeAbonnement,
} from '@/lib/tiers';
import type { Tier } from '@/lib/tiers';

// ── TIERS config ──

describe('TIERS', () => {
  it('test_TIERS_allTiersDefined_hasStarterProAgency', () => {
    expect(Object.keys(TIERS)).toEqual(['starter', 'pro', 'agency']);
  });

  it('test_TIERS_starterPricing_correctMonthlyAndYearly', () => {
    const s = TIERS.starter;
    expect(s.priceMonthly).toBe(349);
    expect(s.priceYearly).toBe(296.65);
    expect(s.priceYearlyTotal).toBe(3559.80);
  });

  it('test_TIERS_proPricing_correctMonthlyAndYearly', () => {
    const p = TIERS.pro;
    expect(p.priceMonthly).toBe(499);
    expect(p.priceYearly).toBe(424.15);
    expect(p.priceYearlyTotal).toBe(5089.80);
  });

  it('test_TIERS_agencyPricing_correctMonthlyAndYearly', () => {
    const a = TIERS.agency;
    expect(a.priceMonthly).toBe(649);
    expect(a.priceYearly).toBe(551.65);
    expect(a.priceYearlyTotal).toBe(6619.80);
  });

  it('test_TIERS_starterLimits_maxCampaigns1MaxPc4s40', () => {
    expect(TIERS.starter.maxCampaigns).toBe(1);
    expect(TIERS.starter.maxPc4s).toBe(40);
  });

  it('test_TIERS_proLimits_maxCampaigns3MaxPc4s80', () => {
    expect(TIERS.pro.maxCampaigns).toBe(3);
    expect(TIERS.pro.maxPc4s).toBe(80);
  });

  it('test_TIERS_agencyLimits_unlimitedCampaignsAndPc4s', () => {
    expect(TIERS.agency.maxCampaigns).toBeNull();
    expect(TIERS.agency.maxPc4s).toBeNull();
  });

  it('test_TIERS_agencyFeatures_allEnabled', () => {
    const a = TIERS.agency;
    expect(a.advancedFilters).toBe(true);
    expect(a.followUp).toBe(true);
    expect(a.abTesting).toBe(true);
    expect(a.personalizedQr).toBe(true);
    expect(a.flyerHelp).toBe(true);
    expect(a.unlimitedTemplates).toBe(true);
    expect(a.conversionDashboard).toBe(true);
  });

  // Stripe's checkout route recomputes the yearly cent amount from
  // priceMonthly * (1 - YEARLY_DISCOUNT) * 12 * 100. Lock the invariant so any
  // drift between lib/tiers and Stripe is caught at CI time.
  it('test_TIERS_yearlyTotalMatchesStripeFormula_forAllTiers', () => {
    (['starter', 'pro', 'agency'] as Tier[]).forEach(tier => {
      const cfg = TIERS[tier];
      const stripeCents = Math.round(cfg.priceMonthly * (1 - YEARLY_DISCOUNT) * 12 * 100);
      const configEuros = cfg.priceYearlyTotal;
      expect(Math.round(configEuros * 100)).toBe(stripeCents);
    });
  });

  it('test_TIERS_yearlyIsExactly15PctCheaper_perMonthEquivalent', () => {
    (['starter', 'pro', 'agency'] as Tier[]).forEach(tier => {
      const cfg = TIERS[tier];
      const expected = Math.round(cfg.priceMonthly * (1 - YEARLY_DISCOUNT) * 100);
      const actual = Math.round(cfg.priceYearly * 100);
      expect(actual).toBe(expected);
    });
  });

  it('test_TIERS_starterFeatures_limitedFeatureSet', () => {
    const s = TIERS.starter;
    expect(s.advancedFilters).toBe(false);
    expect(s.followUp).toBe(false);
    expect(s.abTesting).toBe(false);
    expect(s.personalizedQr).toBe(false);
    expect(s.flyerHelp).toBe(false);
    expect(s.unlimitedTemplates).toBe(true);
    expect(s.conversionDashboard).toBe(true);
  });
});

// ── isTestAccount ──

describe('isTestAccount', () => {
  it('test_isTestAccount_knownTestEmail_returnsTrue', () => {
    expect(isTestAccount('test-starter@lokaalkabaal.nl')).toBe(true);
    expect(isTestAccount('test-pro@lokaalkabaal.nl')).toBe(true);
    expect(isTestAccount('test-agency@lokaalkabaal.nl')).toBe(true);
  });

  it('test_isTestAccount_unknownEmail_returnsFalse', () => {
    expect(isTestAccount('user@example.com')).toBe(false);
  });

  it('test_isTestAccount_emptyString_returnsFalse', () => {
    expect(isTestAccount('')).toBe(false);
  });

  it('test_isTestAccount_caseSensitive_returnsFalse', () => {
    expect(isTestAccount('Test-Starter@lokaalkabaal.nl')).toBe(false);
  });
});

// ── getTestAccount ──

describe('getTestAccount', () => {
  it('test_getTestAccount_knownEmail_returnsAccountObject', () => {
    const account = getTestAccount('test-pro@lokaalkabaal.nl');
    expect(account).not.toBeNull();
    expect(account!.tier).toBe('pro');
    expect(account!.naam).toBe('Test Pro');
  });

  it('test_getTestAccount_unknownEmail_returnsNull', () => {
    expect(getTestAccount('nobody@example.com')).toBeNull();
  });
});

// ── canStartCampaign ──

describe('canStartCampaign', () => {
  it('test_canStartCampaign_starterZeroActive_returnsTrue', () => {
    expect(canStartCampaign('starter', 0)).toBe(true);
  });

  it('test_canStartCampaign_starterAtLimit_returnsFalse', () => {
    expect(canStartCampaign('starter', 1)).toBe(false);
  });

  it('test_canStartCampaign_starterOverLimit_returnsFalse', () => {
    expect(canStartCampaign('starter', 5)).toBe(false);
  });

  it('test_canStartCampaign_proUnderLimit_returnsTrue', () => {
    expect(canStartCampaign('pro', 2)).toBe(true);
  });

  it('test_canStartCampaign_proAtLimit_returnsFalse', () => {
    expect(canStartCampaign('pro', 3)).toBe(false);
  });

  it('test_canStartCampaign_agencyAnyNumber_returnsTrue', () => {
    expect(canStartCampaign('agency', 0)).toBe(true);
    expect(canStartCampaign('agency', 100)).toBe(true);
    expect(canStartCampaign('agency', 999999)).toBe(true);
  });
});

// ── calcOverage ──

describe('calcOverage', () => {
  it('test_calcOverage_withinBundle_zeroOverage', () => {
    const r = calcOverage('starter', 250);
    expect(r.overageCount).toBe(0);
    expect(r.overageEuros).toBe(0);
  });

  it('test_calcOverage_exactlyAtBundle_zeroOverage', () => {
    const r = calcOverage('pro', TIERS.pro.includedFlyers);
    expect(r.overageCount).toBe(0);
    expect(r.overageEuros).toBe(0);
  });

  it('test_calcOverage_aboveBundle_chargesExtraFlyerRate', () => {
    // Pro includes 400; sending 500 = 100 overage * €0.70 = €70.00
    const r = calcOverage('pro', 500);
    expect(r.overageCount).toBe(100);
    expect(r.overageEuros).toBe(100 * EXTRA_FLYER_PRICE_A6);
  });

  it('test_calcOverage_agencyAboveBundle_usesAgencyQuota', () => {
    // Agency includes 500; sending 700 = 200 overage * €0.70 = €140.00
    const r = calcOverage('agency', 700);
    expect(r.overageCount).toBe(200);
    expect(r.overageEuros).toBe(140);
  });

  it('test_calcOverage_negativeInput_clampsToZero', () => {
    const r = calcOverage('starter', -5);
    expect(r.overageCount).toBe(0);
    expect(r.overageEuros).toBe(0);
  });

  it('test_calcOverage_fractionalFlyers_floored', () => {
    // Starter includes 300; 350.7 -> 350 -> 50 overage
    const r = calcOverage('starter', 350.7);
    expect(r.overageCount).toBe(50);
    expect(r.overageEuros).toBeCloseTo(50 * EXTRA_FLYER_PRICE_A6, 2);
  });
});

// ── buildOverageInvoiceItem ──

describe('buildOverageInvoiceItem', () => {
  it('test_buildOverageInvoiceItem_withinBundle_returnsNull', () => {
    expect(buildOverageInvoiceItem('cus_1', 'pro', 300, 'april 2026')).toBeNull();
  });

  it('test_buildOverageInvoiceItem_aboveBundle_returnsStripeParams', () => {
    // Pro bundle = 400. 450 flyers => 50 overage × €0.70 = €35.00 = 3500 cents
    const params = buildOverageInvoiceItem('cus_xyz', 'pro', 450, 'april 2026');
    expect(params).not.toBeNull();
    expect(params!.customer).toBe('cus_xyz');
    expect(params!.amount).toBe(3500);
    expect(params!.currency).toBe('eur');
    expect(params!.description).toContain('april 2026');
    expect(params!.description).toContain('50');
    expect(params!.metadata.tier).toBe('pro');
    expect(params!.metadata.overageCount).toBe('50');
    expect(params!.metadata.maand).toBe('april 2026');
    expect(params!.metadata.platform).toBe('lokaalkabaal');
  });

  it('test_buildOverageInvoiceItem_agencyExactlyAtLimit_returnsNull', () => {
    expect(buildOverageInvoiceItem('cus_a', 'agency', TIERS.agency.includedFlyers, 'mei 2026')).toBeNull();
  });
});

// ── computeAbonnement (wizard step 8 pakketkeuze source of truth) ──

describe('computeAbonnement', () => {
  it('test_computeAbonnement_starterMonthly_matchesPriceMonthly', () => {
    const r = computeAbonnement('starter', false);
    expect(r.tier).toBe('Starter');
    expect(r.base).toBe(TIERS.starter.priceMonthly);
    expect(r.total).toBe(TIERS.starter.priceMonthly);
  });

  it('test_computeAbonnement_starterYearly_matchesPriceYearlyPerMonth', () => {
    const r = computeAbonnement('starter', true);
    expect(r.tier).toBe('Starter');
    expect(r.base).toBe(TIERS.starter.priceYearly);
    expect(r.total).toBe(TIERS.starter.priceYearly);
  });

  it('test_computeAbonnement_proMonthlyAndYearly_matchTiersConfig', () => {
    expect(computeAbonnement('pro', false).total).toBe(TIERS.pro.priceMonthly);
    expect(computeAbonnement('pro', true).total).toBe(TIERS.pro.priceYearly);
  });

  it('test_computeAbonnement_agencyYearly_cheaperThanMonthly', () => {
    const monthly = computeAbonnement('agency', false).total;
    const yearly = computeAbonnement('agency', true).total;
    expect(yearly).toBeLessThan(monthly);
    // Exactly YEARLY_DISCOUNT cheaper
    expect(Math.round(yearly * 100)).toBe(Math.round(monthly * (1 - YEARLY_DISCOUNT) * 100));
  });

  it('test_computeAbonnement_labelMatchesTierConfig_forAllTiers', () => {
    (['starter', 'pro', 'agency'] as Tier[]).forEach(t => {
      expect(computeAbonnement(t, false).tier).toBe(TIERS[t].label);
    });
  });
});
