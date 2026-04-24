import { describe, it, expect } from 'vitest';
import {
  WELKOMST_SERIE,
  hasWelkomstSerieEntitlement,
  nextStepDue,
  type WelkomstStap,
} from '@/lib/welkomst-serie';

describe('WELKOMST_SERIE', () => {
  it('test_welkomstSerie_hasThreeSteps_inOrder', () => {
    expect(WELKOMST_SERIE).toHaveLength(3);
    expect(WELKOMST_SERIE.map(t => t.stap)).toEqual([1, 2, 3]);
  });

  it('test_welkomstSerie_stepDelays_monotonicallyIncreasing', () => {
    const delays = WELKOMST_SERIE.map(t => t.delayDays);
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1]);
    }
  });

  it('test_welkomstSerie_step1Delay_isZero', () => {
    expect(WELKOMST_SERIE[0].delayDays).toBe(0);
  });
});

describe('hasWelkomstSerieEntitlement', () => {
  it('test_entitlement_starter_false', () => {
    expect(hasWelkomstSerieEntitlement('starter')).toBe(false);
  });
  it('test_entitlement_pro_true', () => {
    expect(hasWelkomstSerieEntitlement('pro')).toBe(true);
  });
  it('test_entitlement_agency_true', () => {
    expect(hasWelkomstSerieEntitlement('agency')).toBe(true);
  });
});

describe('nextStepDue', () => {
  const SEND = new Date('2026-04-01T00:00:00.000Z');

  it('test_nextStepDue_nothingSent_returnsStep1', () => {
    const result = nextStepDue(SEND, new Date('2026-04-01T00:00:00.000Z'), []);
    expect(result?.stap).toBe(1);
  });

  it('test_nextStepDue_step1Done_step2NotDueYet_returnsNull', () => {
    // Only 10 days after send -- step 2 needs 30
    const result = nextStepDue(SEND, new Date('2026-04-11T00:00:00.000Z'), [1]);
    expect(result).toBeNull();
  });

  it('test_nextStepDue_step1Done_step2Due_returnsStep2', () => {
    const result = nextStepDue(SEND, new Date('2026-05-02T00:00:00.000Z'), [1]);
    expect(result?.stap).toBe(2);
  });

  it('test_nextStepDue_step1and2Done_step3Due_returnsStep3', () => {
    const result = nextStepDue(SEND, new Date('2026-06-02T00:00:00.000Z'), [1, 2]);
    expect(result?.stap).toBe(3);
  });

  it('test_nextStepDue_allStepsDone_returnsNull', () => {
    const result = nextStepDue(SEND, new Date('2026-07-01T00:00:00.000Z'), [1, 2, 3]);
    expect(result).toBeNull();
  });

  it('test_nextStepDue_skippedStepsStillOffered_returnsNextAvailable', () => {
    // Retailer enabled arc late, step 1 never sent. After 60 days we still
    // offer step 1 (it's the first in order); the caller decides whether
    // to skip backfill.
    const result = nextStepDue(SEND, new Date('2026-06-01T00:00:00.000Z'), []);
    expect(result?.stap).toBe(1);
  });

  it('test_nextStepDue_stepsCanBeSent_outOfOrder', () => {
    // If a retailer skipped step 2 but sent step 3, next due falls back
    // to step 2 when its delay window still applies (it does, since 60
    // days is past step 2's 30-day threshold).
    const result = nextStepDue(SEND, new Date('2026-06-01T00:00:00.000Z'), [1, 3] as WelkomstStap[]);
    expect(result?.stap).toBe(2);
  });
});
