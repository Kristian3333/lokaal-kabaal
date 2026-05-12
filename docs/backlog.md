# Backlog

Ordered by priority. Items move to status.md when they start.

## Flyer editor follow-ups (deferred from 2026-05-12 PDF-clip fix)

- **Playwright PDF-flow regression matrix.** Bounding-box integrity test
  across 9 designs × 3 aspects (A6/A5/SQ) × 3 headline lengths × hero
  variant. PDF smoke test (Linux-only, merge queue) for one canonical
  case per design. Needs: dev-only test route with auth bypass; PDF
  rasterization via pdf-lib or pdf-img-extract.
- **Image drag UX.** Currently drag math uses screen px which jitters
  on small previews. Switch to percentage-based deltas at the source.
- **Color picker contrast hints.** Warn when `flyer.accent` on
  `flyer.kleur` fails WCAG AA at body text size.
- **Font fallback for non-Latin business names.** Currently the serif
  font falls back to system default for accented / non-Latin chars,
  visibly mismatching the rest of the design.
- **Mobile responsiveness of the editor.** `FlyerDesigner.tsx` (710
  lines) and `FlyerPreview.tsx` (696 lines) are desktop-first; preview
  zoom and panel collapse on mobile need work.
- **Undo / redo in the editor.** Currently destructive (color change
  is irreversible without manual re-entry).
- **Autosave during edit.** Currently must hit save explicitly;
  refreshes lose work.
- **`letterSpacing: -0.03em` rasterization fidelity.** html2canvas
  occasionally bunches the tightest tracking in editorial / bold
  designs. Verify with the Playwright matrix once that lands.

## Website conversion improvements (from /coplan spec
`specs/website-improvement-conversion-focused.md`)

- Phase A: Sentry + PostHog wiring, event taxonomy, `/admin/funnel`
  dashboard, perf baseline.
- Phase B: Homepage rewrite, TrustBlock, IcpExample, pricing coherence.
- Phase C: Checkout walkthrough, Dutch errors, demo fallback,
  first-payment smoke test.
- Phase D-F: SEO hygiene, tech debt parallel (LandingPage split, CI
  workflow), a11y/perf polish.

## Top-3 ICE bets (per memory `project_master_plan.md`)

- Dashboard onboarding checklist (ICE 32) - deferred until first paid
  customer signs (retention work).
- Sentry/Highlight error tracking (ICE 27) - covered in
  conversion-focused spec Phase A.
- Follow-up flyer UI (ICE 24) - deferred until first paid customer is
  paying for month 2.
