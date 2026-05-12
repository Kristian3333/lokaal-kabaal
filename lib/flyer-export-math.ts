/**
 * Constants and helpers backing the client-side PDF export pipeline.
 *
 * The preview DOM is laid out at SCREEN_SCALE px/mm; html2canvas
 * supersamples it by HTML2CANVAS_PRINT_SCALE to hit PRINT_TARGET_DPI.
 * effectiveDpi(scale) = SCREEN_SCALE * scale * 25.4.
 */

export type Formaat = 'a6' | 'a5' | 'sq';

/** CSS px per mm used by the on-screen preview. */
export const SCREEN_SCALE = 1.5;

/** Commercial print floor. Below this, text reads as soft. */
export const PRINT_TARGET_DPI = 300;

/**
 * html2canvas scale chosen so 1.5 * 8 * 25.4 = 304.8 DPI >= 300.
 * Integer keeps canvas dimensions predictable for JPEG encoding.
 */
export const HTML2CANVAS_PRINT_SCALE = 8;

/** Physical print dimensions in mm, including 3mm bleed on every edge. */
export const PRINT_DIMS = {
  a6: { w: 111, h: 154, trimW: 105, trimH: 148, label: 'A6 (105×148mm)' },
  a5: { w: 154, h: 216, trimW: 148, trimH: 210, label: 'A5 (148×210mm)' },
  sq: { w: 154, h: 154, trimW: 148, trimH: 148, label: 'Vierkant (148×148mm)' },
} as const;

/** CSS pixels used by the on-screen preview canvas (SCREEN_SCALE px/mm). */
export const PREVIEW_PX = {
  a6: { w: Math.round(PRINT_DIMS.a6.w * SCREEN_SCALE), h: Math.round(PRINT_DIMS.a6.h * SCREEN_SCALE) },
  a5: { w: Math.round(PRINT_DIMS.a5.w * SCREEN_SCALE), h: Math.round(PRINT_DIMS.a5.h * SCREEN_SCALE) },
  sq: { w: Math.round(PRINT_DIMS.sq.w * SCREEN_SCALE), h: Math.round(PRINT_DIMS.sq.h * SCREEN_SCALE) },
} as const;

/** Effective output DPI for a given html2canvas scale. */
export function effectiveDpi(html2canvasScale: number): number {
  return SCREEN_SCALE * html2canvasScale * 25.4;
}

/** PRINT_DIMS lookup with A5 fallback on unknown input. */
export function printDimsForFormaat(formaat: Formaat): typeof PRINT_DIMS[Formaat] {
  return PRINT_DIMS[formaat] ?? PRINT_DIMS.a5;
}

/** PREVIEW_PX lookup with A5 fallback on unknown input. */
export function previewPxForFormaat(formaat: Formaat): typeof PREVIEW_PX[Formaat] {
  return PREVIEW_PX[formaat] ?? PREVIEW_PX.a5;
}

/**
 * SQ canvas (154x154mm) is 71% the height of A5 (148x210mm). Designs
 * hand-tuned for A5 cannot fit hero + headline + body + USPs + CTA in
 * that smaller vertical. The helpers below reflow each section for SQ
 * and pass through unchanged for A5/A6 so existing layouts stay
 * pixel-identical there.
 *
 * Strategy: keep hero (visual), keep headline, keep body (shorter),
 * keep CTA. Drop USPs entirely on the front -- they are the
 * lowest-priority section and consume the most vertical per character.
 *
 * The 0.55 hero ratio (not 0.71) leaves enough vertical for the
 * headline + body + CTA stack underneath the shrunken hero.
 */
const SQ_HERO_RATIO = 0.55;

/** Hero image height adjusted for canvas aspect; pass-through for A5/A6. */
export function heroHeightForCanvas(a5Px: number, formaat: Formaat): number {
  if (formaat === 'sq') return Math.round(a5Px * SQ_HERO_RATIO);
  return a5Px;
}

/** Body text -webkit-line-clamp count; SQ drops one line with floor 2. */
export function bodyClampForCanvas(a5Lines: number, formaat: Formaat): number {
  if (formaat === 'sq') return Math.max(2, a5Lines - 1);
  return a5Lines;
}

/**
 * Front-of-flyer USP list cap. SQ drops the entire USP section -- the
 * square canvas does not have room for the bullet rows once hero,
 * headline, body and CTA have taken their share.
 */
export function uspLimitForCanvas(a5Limit: number, formaat: Formaat): number {
  if (formaat === 'sq') return 0;
  return a5Limit;
}

/**
 * Back-of-flyer line-list cap (opening hours, future similar lists).
 * SQ back has no hero/headline competing for vertical so the rule is
 * gentler than the front: drop two lines with a floor of two.
 */
export function backLineLimitForCanvas(a5Limit: number, formaat: Formaat): number {
  if (formaat === 'sq') return Math.max(2, a5Limit - 2);
  return a5Limit;
}
