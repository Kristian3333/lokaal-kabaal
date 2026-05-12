# Status

## Last update
2026-05-12

## Works
- Public site (40+ pages, programmatic SEO, blog, branche pages, gemeente
  pages, integrations stubs, BE/DE locale stubs).
- Stripe checkout + webhook + subscription lifecycle.
- PrintOne pipeline: monthly dispatch cron, A6/A5/SQ format support,
  3mm bleed, 304 DPI client export.
- Flyer editor: 9 designs, drag-to-position hero, AI text generation,
  light/dark theme.
- Tests: 683 across 48 files (vitest 2.x, JSDOM enabled for component
  tests as of this session).

## Recently shipped (this session)
- Flyer PDF descender clip fix. Headlines no longer get their bottom
  half sliced in the downloaded PDF. Implemented via html2canvas
  `onclone` style mutator (`lib/flyer-export-clone-style.ts`); on-screen
  editor design is byte-identical. 13 headline nodes across 9 designs
  marked with `data-headline-clamp`. Drift detector test covers all
  designs.

## In progress
- (none on this branch -- ready to commit)

## Blocked
- (none)

## Next likely
- Playwright PDF-flow regression matrix (bounding-box test across 9
  designs × 3 aspects × 3 headline lengths). Deferred from this PR
  because it requires a dev-only test route with auth bypass; structural
  invariant test in vitest covers the no-drift case.
- Broader "flyer editor improvements" triage (drag UX, color contrast,
  font fallback, mobile responsiveness, undo/redo, autosave). See
  backlog.md.
