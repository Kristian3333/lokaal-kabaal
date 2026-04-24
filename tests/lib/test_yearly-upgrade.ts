import { describe, it, expect } from 'vitest';
import { assignIncentive, incentiveCopy } from '@/lib/yearly-upgrade';

describe('assignIncentive', () => {
  it('test_assign_sameIdSameVariant_deterministic', () => {
    const a = assignIncentive('retailer-123');
    const b = assignIncentive('retailer-123');
    expect(a).toBe(b);
  });

  it('test_assign_differentIds_canReturnDifferentVariants', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      seen.add(assignIncentive(`retailer-${i}`));
    }
    // With 3 variants and 50 ids we almost certainly see all 3
    expect(seen.size).toBeGreaterThan(1);
  });

  it('test_assign_allReturnsAreKnownVariant', () => {
    const valid = ['discount-15', 'first-month-free', 'bonus-flyers'];
    for (let i = 0; i < 20; i++) {
      expect(valid).toContain(assignIncentive(`r-${i}`));
    }
  });
});

describe('incentiveCopy', () => {
  it('test_copy_discount15_hasCorrectPill', () => {
    const c = incentiveCopy('discount-15');
    expect(c.variant).toBe('discount-15');
    expect(c.pill).toBe('−15%');
    expect(c.subtitle).toContain('niet tussentijds');
  });

  it('test_copy_firstMonthFree_hasDifferentPillAndTitle', () => {
    const c = incentiveCopy('first-month-free');
    expect(c.pill).toContain('gratis');
    expect(c.longTitle).toContain('eerste maand');
  });

  it('test_copy_bonusFlyers_hasBonusPill', () => {
    const c = incentiveCopy('bonus-flyers');
    expect(c.pill).toContain('200');
    expect(c.longTitle).toContain('bonus');
  });

  it('test_copy_subtitlePerTier_mentionsTierPrice', () => {
    const c = incentiveCopy('discount-15');
    const starter = c.subtitlePerTier('starter');
    const pro = c.subtitlePerTier('pro');
    expect(starter).not.toBe(pro);
    expect(starter).toMatch(/€[0-9]/);
  });

  it('test_copy_bonusFlyersPerTier_mentionsFlyerBundle', () => {
    const c = incentiveCopy('bonus-flyers');
    const starter = c.subtitlePerTier('starter'); // starter bundle 300
    expect(starter).toContain('300');
    expect(starter).toContain('200');
  });
});
