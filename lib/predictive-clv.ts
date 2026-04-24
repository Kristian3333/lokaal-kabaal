/**
 * Predictive CLV model.
 *
 * Takes the retailer's branche + a PC4 socioeconomic signal (WOZ range,
 * bouwjaar range, energielabel preferences) and returns an expected
 * customer-lifetime-value band. Shown at campaign setup so retailers
 * understand the ROI they can expect before committing.
 *
 * Model is a hand-tuned rule-based estimator -- deliberately simple so
 * it can ship without training data and still give directional insight.
 * Upgrade path is a statistical model trained on our own dispatch data.
 */

import { BRANCHE_CLV } from '@/lib/clv';

export interface PredictiveClvInput {
  /** Branche key, must match BRANCHE_CLV keys */
  brancheKey: keyof typeof BRANCHE_CLV;
  /** Average WOZ-value in the working area (EUR) */
  wozAverage?: number;
  /** Share of owner-occupied homes in the area (0..1) */
  eigenwoningratio?: number;
  /** Median construction year of homes in the area */
  bouwjaarMediaan?: number;
}

export interface PredictiveClvOutput {
  /** Low estimate (EUR per year) */
  clvLow: number;
  /** Mid estimate (EUR per year) */
  clvMid: number;
  /** High estimate (EUR per year) */
  clvHigh: number;
  /** Which signals were applied as modifiers, for UI tooltip */
  toegepasteSignalen: string[];
}

/**
 * Produce a low/mid/high CLV band for a campaign setup. The mid is the
 * branche-default CLV, adjusted by socioeconomic signals (higher WOZ =
 * wealthier neighbourhood = higher CLV for discretionary branches like
 * restaurant / installateur; young-building neighbourhoods favour
 * installateur because newly-built homes trigger more renovation work).
 */
export function predictClv(input: PredictiveClvInput): PredictiveClvOutput {
  const cfg = BRANCHE_CLV[input.brancheKey];
  if (!cfg) {
    return { clvLow: 0, clvMid: 0, clvHigh: 0, toegepasteSignalen: [] };
  }

  let mod = 1.0;
  const signals: string[] = [];

  // WOZ modifier -- roughly: each 100k above 400k NL-average -> +5% CLV
  // for discretionary branches. Bakker + kapper are less elastic so skip.
  if (input.wozAverage && ['restaurant', 'installateur', 'makelaar', 'fysio'].includes(input.brancheKey)) {
    const aboveMedian = Math.max(0, input.wozAverage - 400_000);
    const wozBump = Math.min(0.35, (aboveMedian / 100_000) * 0.05);
    if (wozBump > 0) {
      mod += wozBump;
      signals.push(`+${Math.round(wozBump * 100)}% hogere koopkracht (gem. WOZ €${Math.round(input.wozAverage / 1000)}k)`);
    }
  }

  // Eigenwoningratio -- owner-occupants have higher LTV than renters
  if (input.eigenwoningratio !== undefined && input.eigenwoningratio > 0.7) {
    const rentierBump = 0.08;
    mod += rentierBump;
    signals.push(`+${Math.round(rentierBump * 100)}% hogere woningeigenaar-aandeel (${Math.round(input.eigenwoningratio * 100)}%)`);
  }

  // Bouwjaar -- installateur wins big in young-build areas (recent
  // construction -> more reno work). Elsewhere, neutral.
  if (input.bouwjaarMediaan && input.brancheKey === 'installateur' && input.bouwjaarMediaan >= 2005) {
    const newBuildBump = 0.15;
    mod += newBuildBump;
    signals.push(`+${Math.round(newBuildBump * 100)}% recentere bouwjaar (mediaan ${input.bouwjaarMediaan})`);
  }

  // Older building stock -- 1900-1940 -- triggers more installateur fixer-upper
  // and makelaar work (estate transitions, renovation sales).
  if (input.bouwjaarMediaan && input.bouwjaarMediaan < 1945 && ['installateur', 'makelaar'].includes(input.brancheKey)) {
    const oldStockBump = 0.10;
    mod += oldStockBump;
    signals.push(`+${Math.round(oldStockBump * 100)}% oude woningvoorraad (mediaan ${input.bouwjaarMediaan})`);
  }

  const clvMid = Math.round(cfg.defaultClv * mod);
  // Band is mid -/+ 30% so the retailer sees a range, not a false-precision point estimate
  return {
    clvLow: Math.round(clvMid * 0.7),
    clvMid,
    clvHigh: Math.round(clvMid * 1.3),
    toegepasteSignalen: signals,
  };
}
