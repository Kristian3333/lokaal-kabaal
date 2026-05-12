import { describe, it, expect } from 'vitest';
import {
  SCREEN_SCALE,
  HTML2CANVAS_PRINT_SCALE,
  PRINT_TARGET_DPI,
  PRINT_DIMS,
  PREVIEW_PX,
  effectiveDpi,
  printDimsForFormaat,
  previewPxForFormaat,
  heroHeightForCanvas,
  bodyClampForCanvas,
  uspLimitForCanvas,
  backLineLimitForCanvas,
} from '@/lib/flyer-export-math';

/**
 * Edge case coverage (per CLAUDE.md):
 *  - Input boundaries: known formats (a5, a6, sq) + unknown fallback.
 *  - Business logic: SCREEN_SCALE * HTML2CANVAS_PRINT_SCALE * 25.4 must
 *    meet or exceed the print target DPI; otherwise PDFs are soft.
 *  - State / lifecycle: helpers are pure - no mutation across calls.
 *  - Failure modes: invalid formaat strings fall back to A5 defaults
 *    instead of throwing, matching upstream component behavior.
 */

describe('print render constants', () => {
  it('test_SCREEN_SCALE_isOneAndAHalfPxPerMm', () => {
    expect(SCREEN_SCALE).toBe(1.5);
  });

  it('test_PRINT_TARGET_DPI_isAtLeast300', () => {
    expect(PRINT_TARGET_DPI).toBeGreaterThanOrEqual(300);
  });

  it('test_HTML2CANVAS_PRINT_SCALE_meets300DpiFloor', () => {
    const dpi = SCREEN_SCALE * HTML2CANVAS_PRINT_SCALE * 25.4;
    expect(dpi).toBeGreaterThanOrEqual(PRINT_TARGET_DPI);
  });

  it('test_HTML2CANVAS_PRINT_SCALE_isIntegerForCanvasStability', () => {
    expect(Number.isInteger(HTML2CANVAS_PRINT_SCALE)).toBe(true);
  });
});

describe('PRINT_DIMS', () => {
  it('test_PRINT_DIMS_a5_includes3mmBleedEachEdge', () => {
    expect(PRINT_DIMS.a5.w).toBe(154);
    expect(PRINT_DIMS.a5.h).toBe(216);
    expect(PRINT_DIMS.a5.trimW).toBe(148);
    expect(PRINT_DIMS.a5.trimH).toBe(210);
  });

  it('test_PRINT_DIMS_a6_includes3mmBleedEachEdge', () => {
    expect(PRINT_DIMS.a6.w).toBe(111);
    expect(PRINT_DIMS.a6.h).toBe(154);
    expect(PRINT_DIMS.a6.trimW).toBe(105);
    expect(PRINT_DIMS.a6.trimH).toBe(148);
  });

  it('test_PRINT_DIMS_sq_includes3mmBleedEachEdge', () => {
    expect(PRINT_DIMS.sq.w).toBe(154);
    expect(PRINT_DIMS.sq.h).toBe(154);
    expect(PRINT_DIMS.sq.trimW).toBe(148);
    expect(PRINT_DIMS.sq.trimH).toBe(148);
  });

  it('test_PRINT_DIMS_a5_bleedIs3mmAllSides', () => {
    expect(PRINT_DIMS.a5.w - PRINT_DIMS.a5.trimW).toBe(6);
    expect(PRINT_DIMS.a5.h - PRINT_DIMS.a5.trimH).toBe(6);
  });
});

describe('PREVIEW_PX', () => {
  it('test_PREVIEW_PX_a5_matchesScreenScaleOfPrintDims', () => {
    expect(PREVIEW_PX.a5.w).toBe(Math.round(PRINT_DIMS.a5.w * SCREEN_SCALE));
    expect(PREVIEW_PX.a5.h).toBe(Math.round(PRINT_DIMS.a5.h * SCREEN_SCALE));
  });

  it('test_PREVIEW_PX_a6_matchesScreenScaleOfPrintDims', () => {
    expect(PREVIEW_PX.a6.w).toBe(Math.round(PRINT_DIMS.a6.w * SCREEN_SCALE));
    expect(PREVIEW_PX.a6.h).toBe(Math.round(PRINT_DIMS.a6.h * SCREEN_SCALE));
  });

  it('test_PREVIEW_PX_sq_isSquareInPx', () => {
    expect(PREVIEW_PX.sq.w).toBe(PREVIEW_PX.sq.h);
  });
});

describe('effectiveDpi', () => {
  it('test_effectiveDpi_atPrintScale_meetsTargetDpi', () => {
    expect(effectiveDpi(HTML2CANVAS_PRINT_SCALE)).toBeGreaterThanOrEqual(PRINT_TARGET_DPI);
  });

  it('test_effectiveDpi_atScale3_isBelow300', () => {
    // The pre-fix scale of 3 produced ~114 DPI which is print-soft.
    // Lock this in so a regression to scale: 3 trips the test.
    expect(effectiveDpi(3)).toBeLessThan(PRINT_TARGET_DPI);
  });

  it('test_effectiveDpi_atScaleZero_isZero', () => {
    expect(effectiveDpi(0)).toBe(0);
  });
});

describe('printDimsForFormaat', () => {
  it('test_printDimsForFormaat_a5_returnsA5Dims', () => {
    expect(printDimsForFormaat('a5')).toEqual(PRINT_DIMS.a5);
  });

  it('test_printDimsForFormaat_a6_returnsA6Dims', () => {
    expect(printDimsForFormaat('a6')).toEqual(PRINT_DIMS.a6);
  });

  it('test_printDimsForFormaat_sq_returnsSqDims', () => {
    expect(printDimsForFormaat('sq')).toEqual(PRINT_DIMS.sq);
  });

  it('test_printDimsForFormaat_unknown_fallsBackToA5', () => {
    expect(printDimsForFormaat('unknown' as 'a5')).toEqual(PRINT_DIMS.a5);
  });
});

describe('previewPxForFormaat', () => {
  it('test_previewPxForFormaat_a5_returnsA5PreviewPx', () => {
    expect(previewPxForFormaat('a5')).toEqual(PREVIEW_PX.a5);
  });

  it('test_previewPxForFormaat_unknown_fallsBackToA5', () => {
    expect(previewPxForFormaat('unknown' as 'a5')).toEqual(PREVIEW_PX.a5);
  });
});

/**
 * SQ format (148x148mm = 231x231 preview px) has ~30% less vertical
 * space than A5 (148x210mm = 231x324 preview px). The canvas-aware
 * helpers below pull hero heights, body line clamps, and USP counts
 * down for SQ so the A5-tuned designs reflow without overflowing.
 *
 * Edge cases:
 *  - Input boundaries: zero / negative input, very small input.
 *  - Business logic: A5/A6 are pass-through (no reduction).
 *  - Floor invariants: body clamp >= 2, USP limit >= 1 even if the
 *    A5 input would reduce below those floors.
 *  - Failure modes: unknown formaat treated as non-SQ pass-through.
 */

describe('heroHeightForCanvas', () => {
  it('test_heroHeightForCanvas_a5_isPassThrough', () => {
    expect(heroHeightForCanvas(85, 'a5')).toBe(85);
  });

  it('test_heroHeightForCanvas_a6_isPassThrough', () => {
    // A6 scales via outer zoom; helper stays a no-op so designs remain identical.
    expect(heroHeightForCanvas(140, 'a6')).toBe(140);
  });

  it('test_heroHeightForCanvas_sq_shrinksBy45Percent', () => {
    // 85 * 0.55 = 46.75 -> 47
    expect(heroHeightForCanvas(85, 'sq')).toBe(47);
  });

  it('test_heroHeightForCanvas_sq_140_isApprox77', () => {
    // 140 * 0.55 = 77
    expect(heroHeightForCanvas(140, 'sq')).toBe(77);
  });

  it('test_heroHeightForCanvas_sq_alwaysReturnsInteger', () => {
    for (const px of [55, 58, 65, 72, 82, 85, 100, 110, 140]) {
      expect(Number.isInteger(heroHeightForCanvas(px, 'sq'))).toBe(true);
    }
  });

  it('test_heroHeightForCanvas_sq_zeroInput_returnsZero', () => {
    expect(heroHeightForCanvas(0, 'sq')).toBe(0);
  });

  it('test_heroHeightForCanvas_unknown_isPassThrough', () => {
    expect(heroHeightForCanvas(100, 'unknown' as 'a5')).toBe(100);
  });
});

describe('bodyClampForCanvas', () => {
  it('test_bodyClampForCanvas_a5_isPassThrough', () => {
    expect(bodyClampForCanvas(4, 'a5')).toBe(4);
    expect(bodyClampForCanvas(3, 'a5')).toBe(3);
  });

  it('test_bodyClampForCanvas_a6_isPassThrough', () => {
    expect(bodyClampForCanvas(4, 'a6')).toBe(4);
  });

  it('test_bodyClampForCanvas_sq_dropsByOneLine', () => {
    expect(bodyClampForCanvas(4, 'sq')).toBe(3);
    expect(bodyClampForCanvas(3, 'sq')).toBe(2);
  });

  it('test_bodyClampForCanvas_sq_floorIsTwoLines', () => {
    // Even if A5 designs were already at 2 lines, SQ must not collapse
    // body text to a single ellipsis -- two lines is the readability floor.
    expect(bodyClampForCanvas(2, 'sq')).toBe(2);
    expect(bodyClampForCanvas(1, 'sq')).toBe(2);
    expect(bodyClampForCanvas(0, 'sq')).toBe(2);
  });

  it('test_bodyClampForCanvas_unknown_isPassThrough', () => {
    expect(bodyClampForCanvas(4, 'unknown' as 'a5')).toBe(4);
  });
});

describe('uspLimitForCanvas', () => {
  // SQ canvas (154x154mm) cannot fit hero + headline + body + USPs + CTA
  // in the A5-tuned layout. USPs are the lowest-priority section, so the
  // SQ rule drops them entirely. Front-of-flyer only -- back uses its own
  // helper for opening-hours lists.
  it('test_uspLimitForCanvas_a5_isPassThrough', () => {
    expect(uspLimitForCanvas(3, 'a5')).toBe(3);
  });

  it('test_uspLimitForCanvas_a6_isPassThrough', () => {
    expect(uspLimitForCanvas(3, 'a6')).toBe(3);
  });

  it('test_uspLimitForCanvas_sq_dropsToZero', () => {
    expect(uspLimitForCanvas(3, 'sq')).toBe(0);
    expect(uspLimitForCanvas(1, 'sq')).toBe(0);
  });

  it('test_uspLimitForCanvas_unknown_isPassThrough', () => {
    expect(uspLimitForCanvas(3, 'unknown' as 'a5')).toBe(3);
  });
});

describe('backLineLimitForCanvas', () => {
  // Back-of-flyer line lists (opening hours, contact rows). SQ has more
  // headroom on the back than the front because the back has no hero or
  // headline competing for vertical, so the rule is a gentler -2 with a
  // floor of 2 so something always shows.
  it('test_backLineLimitForCanvas_a5_isPassThrough', () => {
    expect(backLineLimitForCanvas(4, 'a5')).toBe(4);
  });

  it('test_backLineLimitForCanvas_a6_isPassThrough', () => {
    expect(backLineLimitForCanvas(4, 'a6')).toBe(4);
  });

  it('test_backLineLimitForCanvas_sq_dropsByTwo', () => {
    expect(backLineLimitForCanvas(4, 'sq')).toBe(2);
  });

  it('test_backLineLimitForCanvas_sq_floorIsTwo', () => {
    expect(backLineLimitForCanvas(2, 'sq')).toBe(2);
    expect(backLineLimitForCanvas(1, 'sq')).toBe(2);
    expect(backLineLimitForCanvas(0, 'sq')).toBe(2);
  });

  it('test_backLineLimitForCanvas_unknown_isPassThrough', () => {
    expect(backLineLimitForCanvas(4, 'unknown' as 'a5')).toBe(4);
  });
});
