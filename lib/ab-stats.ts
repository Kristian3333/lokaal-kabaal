/**
 * A/B-test significance helpers for the Agency tier A/B UI.
 *
 * The UI shows scan rate and conversion rate per variant plus a
 * confidence badge. We use a two-proportion z-test (approx. normal)
 * because the event counts are usually large enough (>100 per arm).
 * If a user has <30 events per arm we show "te weinig data" instead.
 */

export interface ArmStats {
  /** Flyers sent in this variant */
  aantal: number;
  /** Successful events (scans OR conversions, caller decides which) */
  successen: number;
}

export interface AbComparison {
  /** Rate (0..1) for variant A */
  rateA: number;
  /** Rate (0..1) for variant B */
  rateB: number;
  /** Absolute lift B - A (0..1, can be negative) */
  absoluutVerschil: number;
  /** Relative lift (B - A) / A (can be Infinity if A=0) */
  relatiefVerschil: number;
  /** Two-tailed p-value from a normal-approx two-proportion z-test */
  pValue: number;
  /** True when p < 0.05 AND both arms have >= minSample */
  significant: boolean;
  /** False when either arm is too small to conclude anything */
  genoegData: boolean;
}

/**
 * Standard normal CDF via erf approximation (Abramowitz & Stegun 7.1.26).
 * Accurate to ~1.5e-7 -- plenty for p-values displayed to 3 decimals.
 */
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

/**
 * Compare two variants via two-proportion z-test.
 *
 * @param a   Variant A arm
 * @param b   Variant B arm
 * @param minSample  Minimum events per arm before calling it significant (default 30)
 */
export function compareAb(a: ArmStats, b: ArmStats, minSample = 30): AbComparison {
  const rateA = a.aantal > 0 ? a.successen / a.aantal : 0;
  const rateB = b.aantal > 0 ? b.successen / b.aantal : 0;
  const absoluutVerschil = rateB - rateA;
  const relatiefVerschil = rateA > 0 ? (rateB - rateA) / rateA : Number.POSITIVE_INFINITY;

  const genoegData = a.aantal >= minSample && b.aantal >= minSample;
  if (!genoegData || a.aantal === 0 || b.aantal === 0) {
    return {
      rateA, rateB, absoluutVerschil, relatiefVerschil,
      pValue: 1, significant: false, genoegData,
    };
  }

  // Pooled proportion for the standard error
  const pooled = (a.successen + b.successen) / (a.aantal + b.aantal);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / a.aantal + 1 / b.aantal));
  if (se === 0) {
    return {
      rateA, rateB, absoluutVerschil, relatiefVerschil,
      pValue: 1, significant: false, genoegData,
    };
  }
  const z = (rateB - rateA) / se;
  // Two-tailed
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));
  return {
    rateA, rateB, absoluutVerschil, relatiefVerschil,
    pValue, significant: pValue < 0.05, genoegData,
  };
}
