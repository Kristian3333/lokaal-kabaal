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
const ASCENDER_SLACK_EM = '0.06em';

const ZERO_VALUES = new Set(['0', '0em', '0px', '0%']);

/**
 * Master export-clone fixer. Call from the html2canvas `onclone` callback
 * with the cloned Document and (optionally) the live source Document so
 * CSS variable values can be read from the original cascade.
 *
 * Accepts any ParentNode (Document, DocumentFragment, or Element) so the
 * descender-slack fix can be unit-tested against detached subtrees. The
 * other three fixes (line-clamp conversion, font-variable resolution,
 * opacity normalisation) require a full Document context and are skipped
 * when the root is not a Document.
 */
export function applyExportSafeHeadlineStyles(
  root: ParentNode,
  sourceDoc?: Document,
): void {
  applyDescenderSlack(root);
  if (typeof Document !== 'undefined' && root instanceof Document) {
    convertLineClampToMaxHeight(root);
    resolveFontVariables(root, sourceDoc ?? document);
    forceFullOpacity(root);
  }
}

// ── 1. Descender slack ─────────────────────────────────────────────────────

function applyDescenderSlack(root: ParentNode): void {
  const nodes = root.querySelectorAll<HTMLElement>(`[${HEADLINE_CLAMP_ATTR}]`);
  nodes.forEach((el) => {
    ensureTextSlack(el);
  });

  // Not just headlines: export clipping also happens on single-line
  // ellipsis rows and other overflow-hidden text boxes lower in the flyer.
  const all = root.querySelectorAll<HTMLElement>('*');
  all.forEach((el) => {
    if (el.hasAttribute(HEADLINE_CLAMP_ATTR)) return;
    if (!looksLikeRiskyTextClipBox(el)) return;
    ensureTextSlack(el);
  });
}

function ensureTextSlack(el: HTMLElement): void {
  const existingBottom = el.style.paddingBottom.trim();
  if (existingBottom === '' || ZERO_VALUES.has(existingBottom)) {
    el.style.paddingBottom = DESCENDER_SLACK_EM;
  } else if (existingBottom.endsWith('em')) {
    const n = parseFloat(existingBottom);
    if (Number.isFinite(n) && n < 0.15) {
      el.style.paddingBottom = DESCENDER_SLACK_EM;
    }
  }

  const existingTop = el.style.paddingTop.trim();
  if (existingTop === '' || ZERO_VALUES.has(existingTop)) {
    el.style.paddingTop = ASCENDER_SLACK_EM;
  }

  el.style.boxSizing = 'content-box';
}

function looksLikeRiskyTextClipBox(el: HTMLElement): boolean {
  const text = (el.textContent || '').trim();
  if (text === '') return false;

  const style = el.style;
  const hasOverflowHidden = style.overflow === 'hidden';
  const hasEllipsis = style.textOverflow === 'ellipsis';
  const hasNoWrap = style.whiteSpace === 'nowrap';
  const hasClamp = style.getPropertyValue('-webkit-line-clamp') !== ''
    || (style.cssText ? style.cssText.includes('-webkit-line-clamp') : false);

  if (!hasOverflowHidden) return false;
  if (!(hasEllipsis || hasNoWrap || hasClamp)) return false;
  if (style.fontSize.trim() === '') return false;
  return true;
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
      const slackPx = Math.ceil(fontSize * 0.3);
      // max-height must equal exactly N line-heights so the box truncates
      // at a line boundary (like -webkit-line-clamp) rather than a pixel
      // boundary, which would show a partial Nth+1 line cut mid-character.
      const maxH = Math.ceil(lhPx * clampCount) + slackPx;

      style.display = 'block';
      style.overflow = 'hidden';
      // Force content-box so descender-slack padding-bottom sits OUTSIDE
      // the max-height limit. Under Tailwind's global border-box, padding
      // would eat into the content area and squeeze out part of the last
      // visible line, again producing a mid-character clip.
      style.boxSizing = 'content-box';
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

  // Build a plain object of CSS variable -> resolved value.
  const varNames = ['--font-serif', '--font-mono', '--font-sans'];
  const vars: { name: string; value: string }[] = [];
  for (let i = 0; i < varNames.length; i++) {
    const resolved = sourceComputed.getPropertyValue(varNames[i]).trim();
    if (resolved) vars.push({ name: varNames[i], value: resolved });
  }

  if (vars.length === 0) return;

  const allElements = clonedDoc.querySelectorAll<HTMLElement>('*');
  allElements.forEach((el) => {
    const ff = el.style.fontFamily;
    if (!ff || !ff.includes('var(')) return;

    let resolved = ff;
    for (let i = 0; i < vars.length; i++) {
      // Match var(--font-serif), var( --font-serif ), etc.
      const pattern = new RegExp(`var\\(\\s*${vars[i].name.replace(/-/g, '\\-')}\\s*\\)`, 'g');
      resolved = resolved.replace(pattern, vars[i].value);
    }
    el.style.fontFamily = resolved;
  });

  // Also set the variables on :root of the cloned doc so any computed
  // style lookups inside html2canvas can find them.
  const clonedRoot = clonedDoc.documentElement;
  for (let i = 0; i < vars.length; i++) {
    clonedRoot.style.setProperty(vars[i].name, vars[i].value);
  }
}

// ── 4. Force full opacity ──────────────────────────────────────────────────

/**
 * The offscreen print container uses `opacity: 0` to hide the clone
 * from the user. html2canvas captures what the browser paints, and a
 * zero-opacity subtree paints nothing, so text renders as blank in the
 * capture. Force opacity:0 to 1 so the capture actually sees the text.
 *
 * Intentional design opacities (e.g. 0.06 for decorative background
 * circles, 0.9 for dimmed labels) must be preserved -- forcing them to
 * 1 turns translucent decorations into solid colour shapes that paint
 * on top of content text in the stacking order, occluding it in the
 * exported PDF.
 */
function forceFullOpacity(clonedDoc: Document): void {
  const clonedBody = clonedDoc.body;
  if (!clonedBody) return;

  const allElements = clonedDoc.querySelectorAll<HTMLElement>('*');
  allElements.forEach((el) => {
    const op = el.style.opacity;
    if (op && parseFloat(op) === 0) {
      el.style.opacity = '1';
    }
  });
}
