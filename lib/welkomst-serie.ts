/**
 * Welkomst-serie: a 3-flyer nurturing arc for the same new-bewoner.
 *
 * Month 1 = warm introduction + welcome offer
 * Month 2 = reminder + social-proof
 * Month 3 = loyalty signup / retention offer
 *
 * Sold as an add-on to Pro/Agency tiers. This module only produces the
 * template definitions; the dispatch cron picks the right template based
 * on the recipient's verzondenOp history.
 */

import { TIERS, type Tier } from '@/lib/tiers';

export type WelkomstStap = 1 | 2 | 3;

export interface WelkomstTemplate {
  stap: WelkomstStap;
  /** Short label used in the wizard UI */
  label: string;
  /** Default headline suggestion the retailer can override */
  defaultHeadline: string;
  /** Copy suggestion (the retailer's own AI-generated or edited text) */
  defaultBody: string;
  /** CTA phrasing tailored to the step */
  defaultCta: string;
  /** Days after the initial flyer that this variant is sent */
  delayDays: number;
}

export const WELKOMST_SERIE: WelkomstTemplate[] = [
  {
    stap: 1,
    label: 'Welkomstaanbieding',
    defaultHeadline: 'Welkom in de buurt!',
    defaultBody: 'Je bent net verhuisd -- kom eens langs en ontdek waar wij goed in zijn.',
    defaultCta: '15% welkomstkorting op je eerste bezoek',
    delayDays: 0,
  },
  {
    stap: 2,
    label: 'Reminder + review',
    defaultHeadline: 'Nog even en je voelt je helemaal thuis',
    defaultBody: 'Een maand geleden heetten we je welkom. Was je al langs? Zo niet: dit is je laatste kans om de welkomstkorting te gebruiken.',
    defaultCta: 'Scan de QR en boek je bezoek',
    delayDays: 30,
  },
  {
    stap: 3,
    label: 'Loyalty',
    defaultHeadline: 'Vanaf nu vaste klant?',
    defaultBody: 'We zien je graag terug. Meld je aan voor onze buurtclub en krijg het hele jaar voordeel.',
    defaultCta: 'Word lid -- scan hier',
    delayDays: 60,
  },
];

/**
 * Check whether a retailer's tier includes the welkomst-serie add-on.
 * Currently gated behind `followUp` (Pro+), but could be flipped to an
 * explicit `welkomstSerie` boolean later without changing callers.
 */
export function hasWelkomstSerieEntitlement(tier: Tier): boolean {
  return TIERS[tier].followUp;
}

/**
 * Given a recipient's initial flyer send date and the current date, return
 * the welkomst-serie step that should go out next, or `null` if the arc
 * is complete (or the next step isn't due yet).
 */
export function nextStepDue(
  verzondenOp: Date,
  now: Date,
  alreadySent: WelkomstStap[],
): WelkomstTemplate | null {
  const daysSinceSend = (now.getTime() - verzondenOp.getTime()) / (1000 * 60 * 60 * 24);
  for (const tpl of WELKOMST_SERIE) {
    if (alreadySent.includes(tpl.stap)) continue;
    // Stap 1 is the initial flyer which is always sent at verzondenOp;
    // subsequent steps become due once delayDays has passed.
    if (daysSinceSend >= tpl.delayDays) return tpl;
  }
  return null;
}
