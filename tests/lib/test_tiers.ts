import { describe, it, expect } from 'vitest';
import {
  TIERS,
  TEST_ACCOUNTS,
  isTestAccount,
  getTestAccount,
  canStartCampaign,
} from '@/lib/tiers';
import type { Tier } from '@/lib/tiers';

// ── TIERS config ──

describe('TIERS', () => {
  it('test_TIERS_allTiersDefined_hasStarterProAgency', () => {
    expect(Object.keys(TIERS)).toEqual(['starter', 'pro', 'agency']);
  });

  it('test_TIERS_starterPricing_correctMonthlyAndYearly', () => {
    const s = TIERS.starter;
    expect(s.priceMonthly).toBe(99);
    expect(s.priceYearly).toBe(74.25);
    expect(s.priceYearlyTotal).toBe(891);
  });

  it('test_TIERS_proPricing_correctMonthlyAndYearly', () => {
    const p = TIERS.pro;
    expect(p.priceMonthly).toBe(199);
    expect(p.priceYearly).toBe(149.25);
    expect(p.priceYearlyTotal).toBe(1791);
  });

  it('test_TIERS_agencyPricing_correctMonthlyAndYearly', () => {
    const a = TIERS.agency;
    expect(a.priceMonthly).toBe(499);
    expect(a.priceYearly).toBe(374.25);
    expect(a.priceYearlyTotal).toBe(4491);
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
