/**
 * Style mutations applied to the html2canvas-cloned DOM only.
 *
 * Three categories of fix:
 *
 * 1. Descender clipping -- tight serif headlines (lineHeight 1.0/1.05)
 *    inside `-webkit-line-clamp` + `overflow: hidden` boxes clip
 *    descenders (g, j, p, q, y) on the last clamped line. Fixed by
 *    adding bottom padding in the clone.
 *
 * 2. `-webkit-line-clamp` -- html2canvas cannot rasterise the
 *    proprietary WebKit line-clamp layout. Clamped boxes collapse to
 *    zero height or render with wrong overflow. Fixed by converting
 *    clamped elements to a `max-height` + `overflow: hidden` fallback
 *    that html2canvas handles correctly.
 *
 * 3. CSS custom-property fonts -- inline `fontFamily: var(--font-serif)`
 *    values sometimes fail to resolve in the cloned document, causing
 *    fallback to the generic serif/sans-serif. Fixed by resolving
 *    variables to their computed values in the clone.
 *
 * All mutations live here so the on-screen editor design stays
 * pixel-identical while the rasterised output gets the fixes it needs.
 */

/** Attribute marker added to every headline node that needs descender slack. */
export const HEADLINE_CLAMP_ATTR = 'data-headline-clamp';

/** Bottom padding added to marked headlines during export. */
export const DESCENDER_SLACK_EM = '0.15em';

const ZERO_VALUES = new Set(['0', '0em', '0px', '0%']);

/**
 * Master export-clone fixer. Call from the html2canvas `onclone` callback
 * with the cloned Document and (optionally) the live source Document so
 * CSS variable values can be read from the original cascade.
 */
export function applyExportSafeHeadlineStyles(
  clonedDoc: Document,
  sourceDoc?: Document,
): void {
  applyDescenderSlack(clonedDoc);
  convertLineClampToMaxHeight(clonedDoc);
  resolveFontVariables(clonedDoc, sourceDoc ?? document);
  forceFullOpacity(clonedDoc);
}

// ── 1. Descender slack ─────────────────────────────────────────────────────

function applyDescenderSlack(root: ParentNode): void {
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

// ── 2. -webkit-line-clamp -> max-height ────────────────────────────────────

/**
 * html2canvas does not understand `-webkit-box` + `-webkit-line-clamp`.
 * Clamped elements either collapse or render unbounded text. This
 * function computes a safe max-height from the clamp count and
 * line-height, then replaces the clamp properties with
 * `display: block; overflow: hidden; max-height: Npx` that
 * html2canvas handles correctly.
 */
function convertLineClampToMaxHeight(clonedDoc: Document): void {
  const clonedBody = clonedDoc.body;
  if (!clonedBody) return;

  const walker = clonedDoc.createTreeWalker(clonedBody, NodeFilter.SHOW_ELEMENT);
  let node: Element | null = walker.nextNode() as Element | null;

  while (node) {
    const el = node as HTMLElement;
    const style = el.style;
    // Check for inline -webkit-line-clamp (set via React's WebkitLineClamp).
    const clampViaProperty = style.getPropertyValue('-webkit-line-clamp');
    const clampViaCssText = style.cssText ? style.cssText.includes('-webkit-line-clamp') : false;
    const hasClamp = clampViaProperty || clampViaCssText;

    if (hasClamp) {
      // Extract clamp count from the property value or fall back to 3.
      const rawClamp = clampViaProperty || '3';
      const clampCount = parseInt(rawClamp, 10) || 3;

      const computed = clonedDoc.defaultView?.getComputedStyle(el);
      const fontSize = parseFloat(computed?.fontSize || '8');
      const lineHeight = parseFloat(computed?.lineHeight || '1.5');
      const lhPx = lineHeight > 4 ? lineHeight : fontSize * lineHeight;
      // Allow a little extra for descenders and padding.
      const maxH = Math.ceil(lhPx * clampCount + fontSize * 0.25);

      style.display = 'block';
      style.overflow = 'hidden';
      style.maxHeight = `${maxH}px`;
      // Remove clamp properties via kebab-case (covers both camelCase
      // and property-name access paths that React may have used).
      style.removeProperty('-webkit-line-clamp');
      style.removeProperty('-webkit-box-orient');
    }

    node = walker.nextNode() as Element | null;
  }
}

// ── 3. CSS custom-property font resolution ─────────────────────────────────

/**
 * Inline styles like `font-family: var(--font-serif)` may not resolve
 * in the cloned document if the custom property definition lives in a
 * stylesheet that html2canvas did not deep-clone, or if the cascade
 * order differs. We resolve them from the live `sourceDoc`'s computed
 * `:root` values and write the result directly into each element's
 * inline style so the canvas text renderer picks up the correct face.
 */
function resolveFontVariables(clonedDoc: Document, sourceDoc: Document): void {
  const sourceRoot = sourceDoc.documentElement;
  const sourceComputed = sourceDoc.defaultView?.getComputedStyle(sourceRoot);
  if (!sourceComputed) return;

  // Map of CSS variable names to resolved values.
  const varMap = new Map<string, string>();
  const varNames = ['--font-serif', '--font-mono', '--font-sans'];
  for (const v of varNames) {
    const resolved = sourceComputed.getPropertyValue(v).trim();
    if (resolved) varMap.set(v, resolved);
  }

  if (varMap.size === 0) return;

  const allElements = clonedDoc.querySelectorAll<HTMLElement>('*');
  allElements.forEach((el) => {
    const ff = el.style.fontFamily;
    if (!ff || !ff.includes('var(')) return;

    let resolved = ff;
    for (const [varName, varValue] of varMap) {
      // Match var(--font-serif), var( --font-serif ), etc.
      const pattern = new RegExp(`var\\(\\s*${varName.replace(/-/g, '\\-')}\\s*\\)`, 'g');
      resolved = resolved.replace(pattern, varValue);
    }
    el.style.fontFamily = resolved;
  });

  // Also set the variables on :root of the cloned doc so any computed
  // style lookups inside html2canvas can find them.
  const clonedRoot = clonedDoc.documentElement;
  for (const [varName, varValue] of varMap) {
    clonedRoot.style.setProperty(varName, varValue);
  }
}

// ── 4. Force full opacity ──────────────────────────────────────────────────

/**
 * The offscreen print container uses `opacity: 0` to hide the clone
 * from the user. html2canvas captures what the browser paints, and
 * some browsers skip subpixel text rasterisation for zero-opacity
 * subtrees. Force full opacity on every element in the cloned tree
 * so the capture gets full-fidelity text rendering.
 */
function forceFullOpacity(clonedDoc: Document): void {
  const clonedBody = clonedDoc.body;
  if (!clonedBody) return;

  const allElements = clonedDoc.querySelectorAll<HTMLElement>('*');
  allElements.forEach((el) => {
    const op = el.style.opacity;
    if (op && parseFloat(op) < 1) {
      el.style.opacity = '1';
    }
  });
}
