import { describe, it, expect } from 'vitest';
import { findFollowUpEligible, type VerificationLike } from '@/lib/follow-up';

const NOW = new Date('2026-05-01T12:00:00.000Z');

function mkVerification(overrides: Partial<VerificationLike> = {}): VerificationLike {
  return {
    code: 'ABCD1234',
    retailerId: 'r_1',
    campagneId: 'c_1',
    verzondenOp: new Date('2026-03-15T00:00:00.000Z'),
    interesseOp: null,
    conversieOp: null,
    followUpVerzonden: false,
    ...overrides,
  };
}

describe('findFollowUpEligible', () => {
  it('test_findFollowUpEligible_starter_returnsEmpty', () => {
    // Starter tier does not have followUp entitlement
    const v = mkVerification();
    const result = findFollowUpEligible([v], 'starter', { delayDays: 30, now: NOW });
    expect(result).toEqual([]);
  });

  it('test_findFollowUpEligible_proAndOld_returnsEligible', () => {
    // Pro has followUp; verzondenOp is 47 days ago which is > delayDays=30
    const v = mkVerification();
    const result = findFollowUpEligible([v], 'pro', { delayDays: 30, now: NOW });
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('ABCD1234');
  });

  it('test_findFollowUpEligible_recentSend_skipped', () => {
    const tooRecent = mkVerification({
      verzondenOp: new Date('2026-04-25T00:00:00.000Z'), // 6 days ago
    });
    const result = findFollowUpEligible([tooRecent], 'pro', { delayDays: 30, now: NOW });
    expect(result).toEqual([]);
  });

  it('test_findFollowUpEligible_scannedAlready_skipped', () => {
    const scanned = mkVerification({ interesseOp: new Date('2026-03-20T00:00:00.000Z') });
    const result = findFollowUpEligible([scanned], 'agency', { delayDays: 30, now: NOW });
    expect(result).toEqual([]);
  });

  it('test_findFollowUpEligible_convertedAlready_skipped', () => {
    const converted = mkVerification({ conversieOp: new Date('2026-03-25T00:00:00.000Z') });
    const result = findFollowUpEligible([converted], 'agency', { delayDays: 30, now: NOW });
    expect(result).toEqual([]);
  });

  it('test_findFollowUpEligible_alreadyFollowedUp_skipped', () => {
    const done = mkVerification({ followUpVerzonden: true });
    const result = findFollowUpEligible([done], 'pro', { delayDays: 30, now: NOW });
    expect(result).toEqual([]);
  });

  it('test_findFollowUpEligible_mixedBatch_filtersCorrectly', () => {
    const eligible = mkVerification({ code: 'KEEP' });
    const skip1 = mkVerification({ code: 'SKIP1', interesseOp: new Date('2026-03-20T00:00:00.000Z') });
    const skip2 = mkVerification({ code: 'SKIP2', followUpVerzonden: true });
    const skip3 = mkVerification({ code: 'SKIP3', verzondenOp: new Date('2026-04-28T00:00:00.000Z') });
    const result = findFollowUpEligible([eligible, skip1, skip2, skip3], 'agency', { delayDays: 30, now: NOW });
    expect(result.map(v => v.code)).toEqual(['KEEP']);
  });

  it('test_findFollowUpEligible_customDelay_respected', () => {
    // 47 days since send, delayDays=60 -> not yet eligible
    const v = mkVerification();
    const result = findFollowUpEligible([v], 'pro', { delayDays: 60, now: NOW });
    expect(result).toEqual([]);
  });

  it('test_findFollowUpEligible_exactlyAtBoundary_eligible', () => {
    const v = mkVerification({
      verzondenOp: new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000),
    });
    const result = findFollowUpEligible([v], 'pro', { delayDays: 30, now: NOW });
    expect(result).toHaveLength(1);
  });
});
