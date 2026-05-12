# Decisions

Architectural decisions with date and reasoning. Older entries archive
to `decisions-archive.md` when this file passes 200 lines.

---

## 2026-05-12 - Headline descender fix via html2canvas onclone, not on-screen CSS

**Decision:** Fix the "PDF cuts the bottom half of title letters" bug by
mutating the cloned DOM inside html2canvas's `onclone` callback, not by
changing the on-screen CSS of `FlyerPreview.tsx`. Marked nodes get
`padding-bottom: 0.15em` added during export only.

**Reasoning:**
- The bug is descender clipping caused by `lineHeight: 1.0/1.05` + serif
  font + `-webkit-line-clamp` + `overflow: hidden`. Distinct from the
  five clip-class bugs fixed on 2026-05-12 (font race, line-clamp box
  clip, DPI, bleed safety, SQ reflow).
- Fixing on-screen would either change wrap math (`lineHeight` bump
  triggers the documented "text bumped to fewer lines" regression
  class) or change the visual identity of every design.
- The `onclone` layer surgically targets the rasterized output without
  affecting the live editor. html2canvas 1.4.1 reliably applies
  inline-style mutations from `onclone` to the captured canvas.
- Marker attribute (`data-headline-clamp`) is a manual contract;
  drift-detector test (`tests/components/test_FlyerPreview_clamp_invariants.tsx`)
  fails CI if a new design adds a clamped serif headline without the
  attribute.

**Rejected alternatives:**
- *Global on-screen `lineHeight: 1.15` floor.* Disturbs visual identity
  and re-triggers wrap-count regressions.
- *SVG `<text>` rendering for headlines.* Creates a third rendering
  surface alongside live preview and html2canvas; loses line-clamp.
- *Server-side PDF migration.* The broken pipeline is client-side; the
  server pipeline (`/api/printone/template`) is separate and recently
  stabilized.
- *Numeric `MIN_HEADLINE_LINE_HEIGHT` constant in `flyer-export-math.ts`.*
  Mixes page math with CSS concerns; templates can still hardcode
  problematic styles elsewhere.

---

## 2026-05-12 - Enable JSX in vitest via esbuild

**Decision:** Add `esbuild: { jsx: 'automatic' }` to `vitest.config.ts`
so component tests can use `.tsx` with `@testing-library/react`.

**Reasoning:** The dev dependencies (`@testing-library/react`,
`@testing-library/jest-dom`, `jsdom`) were already installed but no
test had exercised them; the existing per-file `@vitest-environment
jsdom` override pattern works once esbuild knows how to transform JSX.
No plugin needed; native esbuild handles it.

**Rejected alternatives:**
- *Add @vitejs/plugin-react.* Heavier than needed; we don't use Fast
  Refresh in tests.
- *Skip component tests.* Would leave the no-drift contract for
  `data-headline-clamp` unprotected.
