/**
 * Style mutations applied to the html2canvas-cloned DOM only.
 *
 * Tight serif headlines (lineHeight 1.0 / 1.05) sit inside
 * `-webkit-line-clamp` + `overflow: hidden` boxes. Descenders (g, j,
 * p, q, y) on the last clamped line fall below the line box and get
 * sliced by the overflow clip. html2canvas captures what the browser
 * paints, so the slice is baked into the PDF.
 *
 * The fix lives here, in the cloned DOM, so the on-screen editor
 * design stays pixel-identical while the rasterized output gets the
 * descender slack it needs.
 */

/** Attribute marker added to every headline node that needs descender slack. */
export const HEADLINE_CLAMP_ATTR = 'data-headline-clamp';

/** Bottom padding added to marked headlines during export. */
export const DESCENDER_SLACK_EM = '0.15em';

const ZERO_VALUES = new Set(['0', '0em', '0px', '0%']);

/**
 * Add descender slack to every marked headline in `root`.
 *
 * Treats empty / zero paddings as needing the bump. Treats any non-zero
 * existing value as intentional and leaves it alone, EXCEPT for em
 * values strictly less than the slack threshold, which are bumped up
 * to the threshold. Idempotent.
 */
export function applyExportSafeHeadlineStyles(root: ParentNode): void {
  const nodes = root.querySelectorAll<HTMLElement>(`[${HEADLINE_CLAMP_ATTR}]`);
  nodes.forEach((el) => {
    const existing = el.style.paddingBottom.trim();
    if (existing === '' || ZERO_VALUES.has(existing)) {
      el.style.paddingBottom = DESCENDER_SLACK_EM;
      return;
    }
    if (existing.endsWith('em')) {
      const n = parseFloat(existing);
      if (Number.isFinite(n) && n < 0.15) {
        el.style.paddingBottom = DESCENDER_SLACK_EM;
      }
    }
  });
}
