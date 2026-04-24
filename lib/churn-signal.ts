/**
 * Churn-signal detector.
 *
 * Flags campaigns whose scan-rate has deteriorated over successive months
 * so we can reach out before the retailer cancels. Pure function; caller
 * (cron job or dashboard) supplies the per-month aggregate series.
 */

export interface MonthlyScanStats {
  /** YYYY-MM identifier for the batch month */
  maand: string;
  /** Flyers sent in this month */
  flyersVerzonden: number;
  /** Scans (interesseOp set) recorded for flyers from this month */
  scans: number;
}

export type ChurnSeverity = 'healthy' | 'watch' | 'risk' | 'critical';

export interface ChurnSignal {
  severity: ChurnSeverity;
  /** 0..1 scan-rate in the most recent month with data */
  latestScanRate: number;
  /** 0..1 scan-rate in the baseline (first window) */
  baselineScanRate: number;
  /** Relative change from baseline to latest (-1..+∞) */
  trendVsBaseline: number;
  /** Human-readable reason -- useful for the UI badge tooltip */
  reden: string;
}

/**
 * Assess churn risk from a monthly scan-rate series.
 *
 * Rules:
 *  - Need at least 3 months of data with non-zero flyersVerzonden.
 *  - Compare the most recent month's scan rate to the average of months
 *    1 - N-1 (everything except the tail).
 *  - Classify:
 *      healthy  : latest >= 0.95 * baseline
 *      watch    : 0.80 <= latest/baseline < 0.95
 *      risk     : 0.60 <= latest/baseline < 0.80
 *      critical : latest/baseline < 0.60
 */
export function assessChurn(series: MonthlyScanStats[]): ChurnSignal {
  const withVolume = series.filter(m => m.flyersVerzonden > 0);
  if (withVolume.length < 3) {
    return {
      severity: 'healthy',
      latestScanRate: 0,
      baselineScanRate: 0,
      trendVsBaseline: 0,
      reden: 'Niet genoeg historische data voor een churn-beoordeling (minstens 3 maanden nodig).',
    };
  }

  // Sort chronologically (defensive; caller may pass unsorted)
  const sorted = [...withVolume].sort((a, b) => a.maand.localeCompare(b.maand));
  const latest = sorted[sorted.length - 1];
  const baselineMonths = sorted.slice(0, -1);

  const latestScanRate = latest.scans / latest.flyersVerzonden;
  const baselineScanRate =
    baselineMonths.reduce((sum, m) => sum + m.scans, 0) /
    Math.max(1, baselineMonths.reduce((sum, m) => sum + m.flyersVerzonden, 0));

  if (baselineScanRate === 0) {
    return {
      severity: 'healthy',
      latestScanRate, baselineScanRate,
      trendVsBaseline: 0,
      reden: 'Geen baseline scans om mee te vergelijken.',
    };
  }

  // Add a tiny epsilon so exact-boundary ratios (e.g. 0.08/0.10 = 0.7999...
  // from float rounding) don't get pushed into the stricter bucket.
  const EPS = 1e-9;
  const ratio = latestScanRate / baselineScanRate + EPS;
  const trendVsBaseline = (latestScanRate - baselineScanRate) / baselineScanRate;

  let severity: ChurnSeverity;
  let reden: string;
  if (ratio >= 0.95) {
    severity = 'healthy';
    reden = 'Scan-rate stabiel ten opzichte van de afgelopen maanden.';
  } else if (ratio >= 0.80) {
    severity = 'watch';
    reden = `Scan-rate ${Math.round(Math.abs(trendVsBaseline) * 100)}% lager dan gemiddeld -- let op.`;
  } else if (ratio >= 0.60) {
    severity = 'risk';
    reden = `Scan-rate ${Math.round(Math.abs(trendVsBaseline) * 100)}% lager dan gemiddeld -- neem contact op met de retailer.`;
  } else {
    severity = 'critical';
    reden = `Scan-rate is gekelderd (${Math.round(Math.abs(trendVsBaseline) * 100)}% lager). Actieve retention-outreach aangeraden.`;
  }
  return { severity, latestScanRate, baselineScanRate, trendVsBaseline, reden };
}
