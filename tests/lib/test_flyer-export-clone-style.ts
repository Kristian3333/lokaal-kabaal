// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  applyExportSafeHeadlineStyles,
  HEADLINE_CLAMP_ATTR,
  DESCENDER_SLACK_EM,
} from '@/lib/flyer-export-clone-style';

/**
 * Edge case coverage (per CLAUDE.md):
 *  - Input boundaries: empty root, single match, sibling matches, nested
 *    matches, root with no matches.
 *  - State / lifecycle: idempotent across repeat invocations.
 *  - Integration: ParentNode contract works for both Document body and
 *    detached subtree roots (mirrors html2canvas onclone, which may pass
 *    the cloned root rather than the cloned document).
 *  - Business logic: respect designer-set padding when it is already
 *    sufficient; treat any zero-equivalent value as "needs the bump".
 *  - Failure modes: empty root and unmarked siblings must not throw or
 *    mutate unrelated nodes.
 */

function makeHeadline(text = 'Goedkoop knippen voor jou'): HTMLDivElement {
  const el = document.createElement('div');
  el.setAttribute(HEADLINE_CLAMP_ATTR, 'true');
  el.style.fontFamily = 'var(--font-serif)';
  el.style.fontSize = '20px';
  el.style.lineHeight = '1.05';
  el.style.overflow = 'hidden';
  el.style.display = '-webkit-box';
  el.textContent = text;
  return el;
}

describe('HEADLINE_CLAMP_ATTR', () => {
  it('test_HEADLINE_CLAMP_ATTR_isStableConstant', () => {
    expect(HEADLINE_CLAMP_ATTR).toBe('data-headline-clamp');
  });
});

describe('DESCENDER_SLACK_EM', () => {
  it('test_DESCENDER_SLACK_EM_isAtLeastFifteenHundredthsEm', () => {
    expect(DESCENDER_SLACK_EM.endsWith('em')).toBe(true);
    const num = parseFloat(DESCENDER_SLACK_EM);
    expect(num).toBeGreaterThanOrEqual(0.15);
  });
});

describe('applyExportSafeHeadlineStyles', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('test_applyExportSafeHeadlineStyles_addsPaddingBottom_whenAbsent', () => {
    const h = makeHeadline();
    document.body.appendChild(h);
    expect(h.style.paddingBottom).toBe('');

    applyExportSafeHeadlineStyles(document.body);

    expect(h.style.paddingBottom).toBe(DESCENDER_SLACK_EM);
  });

  it('test_applyExportSafeHeadlineStyles_replacesPaddingBottom_whenSmallerEm', () => {
    const h = makeHeadline();
    h.style.paddingBottom = '0.05em';
    document.body.appendChild(h);

    applyExportSafeHeadlineStyles(document.body);

    expect(h.style.paddingBottom).toBe(DESCENDER_SLACK_EM);
  });

  it('test_applyExportSafeHeadlineStyles_preservesPaddingBottom_whenAtThresholdEm', () => {
    const h = makeHeadline();
    h.style.paddingBottom = '0.15em';
    document.body.appendChild(h);

    applyExportSafeHeadlineStyles(document.body);

    expect(h.style.paddingBottom).toBe('0.15em');
  });

  it('test_applyExportSafeHeadlineStyles_preservesPaddingBottom_whenLargerEm', () => {
    const h = makeHeadline();
    h.style.paddingBottom = '0.5em';
    document.body.appendChild(h);

    applyExportSafeHeadlineStyles(document.body);

    expect(h.style.paddingBottom).toBe('0.5em');
  });

  it('test_applyExportSafeHeadlineStyles_overridesZeroValueVariants', () => {
    const zeros = ['0', '0em', '0px', '0%'];
    for (const z of zeros) {
      document.body.innerHTML = '';
      const h = makeHeadline();
      h.style.paddingBottom = z;
      document.body.appendChild(h);

      applyExportSafeHeadlineStyles(document.body);

      expect(h.style.paddingBottom, `value "${z}" should be bumped`).toBe(DESCENDER_SLACK_EM);
    }
  });

  it('test_applyExportSafeHeadlineStyles_preservesNonZeroPxValue', () => {
    const h = makeHeadline();
    h.style.paddingBottom = '10px';
    document.body.appendChild(h);

    applyExportSafeHeadlineStyles(document.body);

    expect(h.style.paddingBottom).toBe('10px');
  });

  it('test_applyExportSafeHeadlineStyles_preservesNonZeroPercentValue', () => {
    const h = makeHeadline();
    h.style.paddingBottom = '5%';
    document.body.appendChild(h);

    applyExportSafeHeadlineStyles(document.body);

    expect(h.style.paddingBottom).toBe('5%');
  });

  it('test_applyExportSafeHeadlineStyles_appliesToAllMarkedSiblings', () => {
    const h1 = makeHeadline('Eerste titel');
    const h2 = makeHeadline('Tweede titel');
    const h3 = makeHeadline('Derde titel');
    document.body.append(h1, h2, h3);

    applyExportSafeHeadlineStyles(document.body);

    expect(h1.style.paddingBottom).toBe(DESCENDER_SLACK_EM);
    expect(h2.style.paddingBottom).toBe(DESCENDER_SLACK_EM);
    expect(h3.style.paddingBottom).toBe(DESCENDER_SLACK_EM);
  });

  it('test_applyExportSafeHeadlineStyles_ignoresUnmarkedNode', () => {
    const marked = makeHeadline();
    const unmarked = document.createElement('div');
    unmarked.style.fontFamily = 'var(--font-serif)';
    unmarked.style.lineHeight = '1.05';
    unmarked.style.overflow = 'hidden';
    unmarked.textContent = 'Should stay untouched';
    document.body.append(marked, unmarked);

    applyExportSafeHeadlineStyles(document.body);

    expect(marked.style.paddingBottom).toBe(DESCENDER_SLACK_EM);
    expect(unmarked.style.paddingBottom).toBe('');
  });

  it('test_applyExportSafeHeadlineStyles_appliesToNestedMatch', () => {
    const wrapper = document.createElement('div');
    const inner = document.createElement('section');
    const h = makeHeadline();
    inner.appendChild(h);
    wrapper.appendChild(inner);
    document.body.appendChild(wrapper);

    applyExportSafeHeadlineStyles(document.body);

    expect(h.style.paddingBottom).toBe(DESCENDER_SLACK_EM);
  });

  it('test_applyExportSafeHeadlineStyles_idempotent_acrossRepeatCalls', () => {
    const h = makeHeadline();
    document.body.appendChild(h);

    applyExportSafeHeadlineStyles(document.body);
    const after1 = h.style.paddingBottom;
    applyExportSafeHeadlineStyles(document.body);
    const after2 = h.style.paddingBottom;
    applyExportSafeHeadlineStyles(document.body);
    const after3 = h.style.paddingBottom;

    expect(after1).toBe(DESCENDER_SLACK_EM);
    expect(after2).toBe(after1);
    expect(after3).toBe(after1);
  });

  it('test_applyExportSafeHeadlineStyles_emptyRoot_doesNotThrow', () => {
    expect(() => applyExportSafeHeadlineStyles(document.body)).not.toThrow();
  });

  it('test_applyExportSafeHeadlineStyles_rootWithNoMatches_leavesEverythingUntouched', () => {
    const a = document.createElement('p');
    a.style.paddingBottom = '4px';
    const b = document.createElement('span');
    document.body.append(a, b);

    applyExportSafeHeadlineStyles(document.body);

    expect(a.style.paddingBottom).toBe('4px');
    expect(b.style.paddingBottom).toBe('');
  });

  it('test_applyExportSafeHeadlineStyles_acceptsDetachedSubtreeAsRoot', () => {
    // html2canvas may invoke onclone with the cloned root element (a
    // detached subtree), not the document body.
    const detachedRoot = document.createElement('div');
    const h = makeHeadline();
    detachedRoot.appendChild(h);
    // Not appended to document.body.

    applyExportSafeHeadlineStyles(detachedRoot);

    expect(h.style.paddingBottom).toBe(DESCENDER_SLACK_EM);
  });

  it('test_applyExportSafeHeadlineStyles_acceptsDocumentFragmentAsRoot', () => {
    const frag = document.createDocumentFragment();
    const h = makeHeadline();
    frag.appendChild(h);

    applyExportSafeHeadlineStyles(frag);

    expect(h.style.paddingBottom).toBe(DESCENDER_SLACK_EM);
  });

  it('test_applyExportSafeHeadlineStyles_markedAttributeWithEmptyValue_stillApplies', () => {
    // CSS attribute selector [data-headline-clamp] matches regardless of
    // value. Designers might omit "true"; the fix must still kick in.
    const h = document.createElement('div');
    h.setAttribute(HEADLINE_CLAMP_ATTR, '');
    document.body.appendChild(h);

    applyExportSafeHeadlineStyles(document.body);

    expect(h.style.paddingBottom).toBe(DESCENDER_SLACK_EM);
  });

  it('test_applyExportSafeHeadlineStyles_addsSlackToEllipsisTextRows', () => {
    const row = document.createElement('div');
    row.textContent = 'verbouwpro.nl';
    row.style.overflow = 'hidden';
    row.style.textOverflow = 'ellipsis';
    row.style.whiteSpace = 'nowrap';
    row.style.fontSize = '7px';
    row.style.lineHeight = '1.4';
    document.body.appendChild(row);

    applyExportSafeHeadlineStyles(document.body);

    expect(row.style.paddingBottom).toBe(DESCENDER_SLACK_EM);
    expect(row.style.boxSizing).toBe('content-box');
  });
});
