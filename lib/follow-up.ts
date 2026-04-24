/**
 * Follow-up flyer eligibility logic.
 *
 * Pro/Agency retailers can enable a second physical flyer mailed to
 * recipients who did NOT scan the first QR within N days of delivery.
 *
 * This module only computes eligibility; the actual PrintOne dispatch
 * lives in a separate cron (not yet wired) that will call
 * `findFollowUpEligible(...)` and enqueue print orders for the result.
 */

import { TIERS, type Tier } from '@/lib/tiers';

/** A subset of flyer_verifications.row fields the rule depends on. */
export interface VerificationLike {
  code: string;
  retailerId: string;
  campagneId: string;
  verzondenOp: Date;
  interesseOp: Date | null;
  conversieOp: Date | null;
  followUpVerzonden: boolean;
}

export interface FollowUpConfig {
  /** Days after verzondenOp before the follow-up becomes eligible (default 30). */
  delayDays: number;
  /** Evaluation timestamp -- injectable for deterministic tests. */
  now: Date;
}

/**
 * Return the subset of verifications that should receive a follow-up flyer.
 *
 * Eligibility rules (all must hold):
 *  - The retailer's tier has `followUp: true` (Pro + Agency).
 *  - The initial flyer was sent at least `delayDays` ago.
 *  - The recipient never scanned the QR (`interesseOp IS NULL`) and never
 *    converted via pincode (`conversieOp IS NULL`). A scan means the flyer
 *    did its job; no reason to pay for a reminder.
 *  - We have not already sent the follow-up (`followUpVerzonden = false`).
 */
export function findFollowUpEligible(
  verifications: VerificationLike[],
  retailerTier: Tier,
  config: FollowUpConfig,
): VerificationLike[] {
  if (!TIERS[retailerTier].followUp) return [];
  const cutoff = new Date(config.now.getTime() - config.delayDays * 24 * 60 * 60 * 1000);
  return verifications.filter((v) =>
    v.verzondenOp <= cutoff &&
    v.interesseOp === null &&
    v.conversieOp === null &&
    !v.followUpVerzonden,
  );
}
