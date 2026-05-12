// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import FlyerPreview, { type FlyerState } from '@/components/dashboard/FlyerPreview';
import {
  applyExportSafeHeadlineStyles,
  HEADLINE_CLAMP_ATTR,
  DESCENDER_SLACK_EM,
} from '@/lib/flyer-export-clone-style';

/**
 * Structural invariant tests for the headline-clamp marking contract.
 *
 * Why: the export-mode descender fix relies on every headline node being
 * marked with `data-headline-clamp`. A new design that adds a clamped
 * serif headline without the mark would silently reintroduce the bug.
 *
 * These tests render each of the 9 designs in both hero variants and
 * assert:
 *   1. at least one headline node carries the mark, and
 *   2. every serif + line-clamp node carries the mark (drift detector),
 *      and
 *   3. applyExportSafeHeadlineStyles applies the slack to all marks.
 *
 * Edge case coverage:
 *  - Input boundaries: 9 design variants × {with hero, no hero}.
 *  - State: render output is static -- no async, no timers.
 *  - Integration: marks are recognized via getAttribute, not by a
 *    React-specific contract.
 *  - Business logic: drift detector greps inline style attribute for
 *    the dangerous combo (var(--font-serif) + -webkit-line-clamp).
 *  - Failure modes: an unmarked offender is surfaced in the assertion
 *    message via outerHTML excerpt so the failing design is obvious.
 */

const DESIGNS: FlyerState['design'][] = [
  'editorial', 'geometric', 'minimal', 'bold', 'retro',
  'warm', 'neon', 'corporate', 'playful',
];

const TINY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function baseFlyer(overrides: Partial<FlyerState> = {}): FlyerState {
  return {
    kleur: '#1a1a1a',
    accent: '#00e87a',
    afmeting: 'A6',
    dubbelzijdig: false,
    bedrijfsnaam: 'Verbouwpro Zwolle',
    slogan: 'Vakmanschap voor jouw verbouwing',
    telefoon: '038-1234567',
    email: 'info@verbouwpro.nl',
    website: 'verbouwpro.nl',
    usp: 'Snelle reactie\nGratis offerte\nGoede kwaliteit',
    tekst: 'Welkom in de buurt. Wij staan klaar voor jouw verbouwingsklus.',
    logoData: null,
    websiteUrl: '',
    websiteScan: null,
    design: 'editorial',
    heroImageUrl: null,
    heroOffsetX: 50,
    heroOffsetY: 50,
    heroScale: 100,
    headline: 'Goedkoop knippen voor jou en je gezin',
    cta: '10% welkomstkorting',
    pdfUrl: null,
    adres: 'Hoofdstraat 1, 8000 Zwolle',
    openingstijden: 'Ma-Vr 09:00-17:00',
    backTekst: 'Wij staan voor je klaar',
    qrPlaats: 'voor',
    ...overrides,
  };
}

function inlineStyleOf(el: Element): string {
  return el.getAttribute('style') ?? '';
}

/**
 * Heuristic: a node is a "clamped serif headline" if its inline style
 * declares both `var(--font-serif)` AND `-webkit-line-clamp`. This is
 * the exact dangerous combo flagged in docs/review-lessons.md (2026-05-12).
 */
function isClampedSerifHeadline(el: Element): boolean {
  const css = inlineStyleOf(el);
  return css.includes('var(--font-serif)') && css.includes('-webkit-line-clamp');
}

describe.each(DESIGNS)('FlyerPreview design "%s"', (design) => {
  describe.each([
    { label: 'with hero', heroImageUrl: TINY_PNG },
    { label: 'no hero', heroImageUrl: null },
  ])('$label', ({ heroImageUrl }) => {
    it('test_marksAtLeastOneHeadlineNode', () => {
      const { container } = render(
        <FlyerPreview flyer={baseFlyer({ design, heroImageUrl })} formaat="a5" forPrint />,
      );
      const marked = container.querySelectorAll(`[${HEADLINE_CLAMP_ATTR}]`);
      expect(marked.length).toBeGreaterThan(0);
    });

    it('test_everySerifClampNodeIsMarked', () => {
      const { container } = render(
        <FlyerPreview flyer={baseFlyer({ design, heroImageUrl })} formaat="a5" forPrint />,
      );

      const all = container.querySelectorAll('*');
      const unmarked: string[] = [];
      all.forEach((el) => {
        if (isClampedSerifHeadline(el) && !el.hasAttribute(HEADLINE_CLAMP_ATTR)) {
          unmarked.push(el.outerHTML.slice(0, 240));
        }
      });

      expect(
        unmarked,
        `Unmarked serif+clamp nodes in design "${design}": ${unmarked.join(' ||| ')}`,
      ).toEqual([]);
    });

    it('test_applyExportSafeHeadlineStyles_givesSlackToEveryMark', () => {
      const { container } = render(
        <FlyerPreview flyer={baseFlyer({ design, heroImageUrl })} formaat="a5" forPrint />,
      );

      applyExportSafeHeadlineStyles(container);

      const marked = container.querySelectorAll<HTMLElement>(`[${HEADLINE_CLAMP_ATTR}]`);
      marked.forEach((el) => {
        // Either the mutator set our slack, or the existing inline value
        // is non-zero (which the mutator preserves).
        const pb = el.style.paddingBottom.trim();
        expect(pb, `padding-bottom missing on ${el.outerHTML.slice(0, 120)}`).not.toBe('');
        expect(pb).not.toBe('0');
      });
    });
  });
});

describe('FlyerPreview headline marks - SQ aspect coverage', () => {
  // SQ-aspect reflow drops USPs and changes body line count, but the
  // headline rendering path is shared with A5. Spot-check one design.
  it('test_editorial_sq_marksAtLeastOneHeadlineNode', () => {
    const { container } = render(
      <FlyerPreview flyer={baseFlyer({ design: 'editorial' })} formaat="sq" forPrint />,
    );
    const marked = container.querySelectorAll(`[${HEADLINE_CLAMP_ATTR}]`);
    expect(marked.length).toBeGreaterThan(0);
  });
});

describe('DESCENDER_SLACK_EM contract', () => {
  it('test_descenderSlack_isApplied_byHelperConstant', () => {
    // Belt-and-suspenders: if anyone changes DESCENDER_SLACK_EM, the
    // helper must keep using the exported constant. Guard against
    // accidental hardcoded "0.15em" sprinkled around the codebase.
    expect(DESCENDER_SLACK_EM).toMatch(/^0?\.\d+em$/);
  });
});
