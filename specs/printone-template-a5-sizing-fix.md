# PrintOne template route -- A5 sizing fix

**Status:** proposed
**Owner:** Kristian
**Date:** 2026-05-08

---

## 1. Objective

When a campaign is sent through the print.one **template** flow (`POST /api/printone/template`), the rendered postcard appears as a tiny element in the upper/right corner of the A5 paper instead of filling the full page. The simpler order flow (`POST /api/printone`) renders correctly. This spec fixes the sizing bug, unifies both code paths so they cannot diverge again, and adds tests that lock in the wrapper contract.

### Why this matters

- Live customers running merge-variable campaigns (QR per recipient, address per recipient) ship unusable flyers.
- The defect is a print quality regression. There is no client-side preview of the wrapped HTML, so it is invisible until paper arrives.
- Two routes today re-implement the same scaling concern with diverged logic. Without consolidation this will regress again.

---

## 2. Root cause analysis

### The two paths

Both routes wrap raw flyer HTML before sending it to print.one as a `template` payload. Both share the same `PRINT_CONFIG` mapping (formaat -> mm + preview px + scale). They diverge in the wrapper.

**`app/api/printone/route.ts` (works)** -- `wrapForPrint()` at lines 75-131:

- Receives flyer HTML produced by the dashboard preview, sized in **screen pixels** at 1.5 px/mm (e.g. A5 = 231 x 324 px).
- Sets `<meta name="viewport" content="width=${cfg.previewW}">` so headless Chromium adopts the preview pixel grid as the layout viewport.
- Sets `html, body { width: ${cfg.previewW}px; height: ${cfg.previewH}px }`.
- Applies `zoom: ${cfg.scale}` (~2.42 for A5) on a `.lk-wrap` div, which scales the rendered output up to the print canvas size in pixels at 96 dpi (559 x 784 px for A5 trim).
- print.one then maps that pixel canvas onto the physical A5 sheet at the correct size.

**`app/api/printone/template/route.ts` (broken)** -- `wrapForPrint()` at lines 191-226:

- Receives flyer HTML produced by `buildTemplateHTML()` in the same file, which **uses `mm` units** (`body { width: 154mm; height: 216mm }`, padding/font sizes in mm/pt).
- Sets `<meta name="viewport" content="width=device-width, initial-scale=1.0">` -- this is the wrong meta for print rendering.
- Sets `html, body { width: 154mm; height: 216mm }`.
- Does **not** apply zoom or any pixel-pinning.

### Why this fails on print.one's renderer

print.one renders the supplied HTML in headless Chromium and snapshots the page. With `meta viewport content="width=device-width"`, the browser picks an arbitrary device viewport (commonly 980 px or larger) as the CSS pixel viewport. The body at `154mm` is then resolved at 96 dpi to ~583 CSS px, which only fills part of that viewport. print.one's renderer captures the entire viewport, sees a small element at the body's rendered position, and prints that whole capture onto A5 -- the body content ends up small and offset.

The order route avoids this by pinning the layout viewport to a known pixel width and letting `zoom` do the scale-up.

### Why the inner HTML is mm-based

`buildTemplateHTML()` (template/route.ts:31-151) was authored using mm directly because the template includes merge-variable placeholders (`{{qr_url}}`, `{{adres}}`, etc.) that are server-rendered and not part of the dashboard preview component. Authoring in mm felt more natural, but it requires a wrapper that establishes a known pixel viewport for headless rendering.

---

## 3. Files to create / modify

### Create

| File | Purpose |
| --- | --- |
| `lib/printone-render.ts` | Shared print canvas constants + `wrapForPrint()` helpers. Single source of truth. |
| `tests/lib/test_printone_render.ts` | Unit tests for `wrapForPrint*` helpers. Edge case coverage per CLAUDE.md. |

### Modify

| File | Change |
| --- | --- |
| `app/api/printone/route.ts` | Drop local `PRINT_CONFIG` + `wrapForPrint` + `sanitizeContent`. Import from `lib/printone-render`. No behaviour change. |
| `app/api/printone/template/route.ts` | Drop local `wrapForPrint`. Use `wrapMmForPrint` from `lib/printone-render`. Keep `buildTemplateHTML` (mm-based) as is, but remove the duplicated `<style>` block from its `<head>` that sets body width/height in mm -- the wrapper now owns the canvas dimensions. |

---

## 4. Approach

### Option A (chosen): two wrappers, one shared module

Add two named exports to `lib/printone-render.ts`:

1. **`wrapPreviewHtmlForPrint(rawHtml, formaat)`** -- the existing route.ts strategy. Input: HTML sized in preview pixels (1.5 px/mm). Output: viewport pinned to `previewW`, body sized in preview px, content scaled up via `zoom: scale`.
2. **`wrapMmHtmlForPrint(rawHtml, formaat)`** -- new strategy for mm-based input. Input: HTML where the inner content uses `mm` units (e.g. `padding: 9mm`). Output:
   - `<meta name="viewport" content="width=${cfg.printPxW}, initial-scale=1.0">` where `printPxW = round(cfg.mmW * 96 / 25.4)` (A5 with 3 mm bleed = 583 px, A6 = 420 px).
   - `html, body { width: ${cfg.printPxW}px; height: ${cfg.printPxH}px; margin: 0; padding: 0; overflow: hidden }`.
   - Inner content placed in a wrapper div sized `width: 100%; height: 100%`. mm units inside resolve at 96 dpi as expected, so 154 mm fills the 583 px canvas exactly.
   - Original `<head>` style block (fonts, custom CSS) is preserved via the existing regex extraction so flyer typography survives the wrap.

Both helpers reuse a private `extractHeadAndBody(html)` function and a frozen `PRINT_CONFIG`.

**Why two wrappers, not one:** the two upstream HTML producers genuinely differ -- the dashboard preview is px-based, the template builder is mm-based. Forcing one to convert to the other is a high-risk visual refactor. Two named wrappers is more code but the contract is clear at the call site.

### Option B (rejected): convert `buildTemplateHTML` to preview pixels

Would unify on a single wrapper but requires translating every `mm`/`pt` rule in the template HTML to its preview-pixel equivalent. Many opportunities for subtle visual regression in production-bound print output. Rejected on risk.

### Option C (rejected): fix only template/route.ts in place

Fastest fix but leaves the duplicated `wrapForPrint` and `PRINT_CONFIG` in two files. Already burned us once.

---

## 5. TDD sequence

Follow strict TDD per `CLAUDE.md`. Write tests first against the helper signatures, freeze them, then implement.

### 5.1 Edge case analysis (mandatory before tests)

| Level | Cases |
| --- | --- |
| **Input boundaries** | empty string, full document with `<html>/<head>/<body>`, body-only fragment, document with no `<head>`, document with multiple `<style>` blocks in head, content with `<script>` tags, content with `<img src="">`, content with `<img src="data:,">`, content with `<img src="blob:...">`, mm/px/pt mixed inner units, very large content (10 MB string -- ensure no quadratic regex). |
| **State / lifecycle** | first call vs repeated calls (helpers must be pure -- no module-level mutable state). |
| **Integration / environment** | called from Next.js route handler (Node runtime), no DOM. |
| **Business logic / domain** | known formaats `a5`, `a6`, `sq`; unknown formaat falls back to `a6` (matches current behaviour); preview-px wrapper output dimensions; mm wrapper output dimensions; `cfg.scale` precision (4 decimals, no trailing junk); `printPxW`/`printPxH` rounded to integer pixels. |
| **Failure modes / recovery** | malformed HTML (unclosed tags) -- wrapper does not throw, returns valid wrapper around raw text fallback; `null`/`undefined` input -- TypeScript will reject at compile time, runtime guard via `?? ''`. |

### 5.2 Tests to write FIRST -- `tests/lib/test_printone_render.ts`

Naming follows `test_[function]_[scenario]_[expected_result]`.

#### `wrapPreviewHtmlForPrint`

- `test_wrapPreviewHtmlForPrint_a5_setsViewportToPreviewWidth` -- output contains `meta name="viewport" content="width=231`.
- `test_wrapPreviewHtmlForPrint_a5_setsBodyToPreviewPixels` -- output body has `width: 231px; height: 324px`.
- `test_wrapPreviewHtmlForPrint_a5_appliesZoomScale` -- output contains `zoom: 2.4199` (or 2.4200, allow 4 decimals).
- `test_wrapPreviewHtmlForPrint_a6_appliesA6Scale` -- output contains `zoom: 2.3772`.
- `test_wrapPreviewHtmlForPrint_unknownFormaat_fallsBackToA6` -- behaves as a6.
- `test_wrapPreviewHtmlForPrint_documentInput_extractsBodyOnly` -- given full `<html><head>...</head><body>X</body></html>`, only `X` appears inside `.lk-wrap`.
- `test_wrapPreviewHtmlForPrint_fragmentInput_treatsAsBody` -- raw fragment with no `<body>` is wrapped as-is.
- `test_wrapPreviewHtmlForPrint_emptyDataImg_isStripped` -- input containing `<img src="">` and `<img src="data:,">` produces output with those tags removed (existing `sanitizeContent` behaviour).

#### `wrapMmHtmlForPrint`

- `test_wrapMmHtmlForPrint_a5_setsViewportToPrintPixelWidth` -- output contains `meta name="viewport" content="width=583` (154 mm * 96 / 25.4 rounded).
- `test_wrapMmHtmlForPrint_a5_setsBodyToPrintPixels` -- body has `width: 583px; height: 817px`.
- `test_wrapMmHtmlForPrint_a6_setsCorrectPrintPixelDimensions` -- body has `width: 420px; height: 583px`.
- `test_wrapMmHtmlForPrint_preservesHeadStyles` -- when input has `<style>.foo{color:red}</style>` in `<head>`, output `<head>` still contains it.
- `test_wrapMmHtmlForPrint_preservesHeadScripts` -- `<script>` blocks in input head appear in output head.
- `test_wrapMmHtmlForPrint_documentInput_extractsBodyOnly` -- only body content appears between wrapper `<body>` tags.
- `test_wrapMmHtmlForPrint_unknownFormaat_fallsBackToA6` -- behaves as a6.
- `test_wrapMmHtmlForPrint_outputIsValidStandaloneDocument` -- starts with `<!DOCTYPE html>`, contains `<html>`, `<head>`, `<body>`.
- `test_wrapMmHtmlForPrint_mmContentRendersAtFullCanvas` -- given input `<body><div style="width:154mm;height:216mm;background:red"></div></body>` with formaat `a5`, the inner div ends up sized to fill the 583 x 817 px canvas (assert by snapshot of generated CSS, plus a JSDOM render check that `getComputedStyle(.canvas-wrap).width === '583px'`).

#### Shared invariants

- `test_PRINT_CONFIG_a5_matchesPhysicalA5WithBleed` -- `mmW: 154, mmH: 216` (148 mm trim + 3 mm bleed each side, 210 mm trim + 3 mm bleed each side).
- `test_PRINT_CONFIG_printPx_isRoundedToInteger` -- no fractional px values exposed.
- `test_PRINT_CONFIG_scale_equalsPrintPxOverPreviewPx` -- mathematical consistency.

### 5.3 Implementation order (after tests are frozen)

1. Create `lib/printone-render.ts` with `PRINT_CONFIG`, `extractHeadAndBody`, `sanitizeContent`, `wrapPreviewHtmlForPrint`, `wrapMmHtmlForPrint`. Run new tests until green.
2. Update `app/api/printone/route.ts` -- delete local copies, import from shared module. Run existing tests (`tests/api/test_printone_webhook.ts` is unrelated; verify build + lint + type-check still pass).
3. Update `app/api/printone/template/route.ts` -- delete local `wrapForPrint`, import `wrapMmHtmlForPrint`. Trim the duplicated body-width style from `buildTemplateHTML`'s `<head>` (the wrapper now owns canvas dimensions; keep the `:root`, font, and component class styles).
4. **Manual verification step** -- `npm run dev`, hit `/api/printone/template` with a real test payload and inspect the wrapped output (log it once locally, never to prod). Compare to the order route's output for the same `formaat` to confirm structural parity. Then run a real test order via `scripts/test-printone.ts` against a sandbox key and confirm the printed PDF preview from print.one fills the page.

### 5.4 Validation suite

Per `CLAUDE.md` post-implementation workflow:

```bash
npm test          # all tests including new ones
npm run lint
npx tsc --noEmit
npm run build
```

All four must pass before commit.

---

## 6. Security considerations

### Input handling

- Both wrappers take HTML strings produced **server-side** by trusted code paths (`buildTemplateHTML`, dashboard preview HTML serialised by the client). The dashboard preview path does flow through user-supplied `bedrijfsnaam`, `headline`, `bodytekst`, etc. None of this is currently HTML-escaped before being interpolated into template strings -- this is **a pre-existing XSS-into-print.one risk** (an attacker could inject CSS that defaces the printed flyer, or scripts that print.one's headless renderer might execute).
- This spec does **not** introduce that risk -- it already exists in `buildTemplateHTML` -- but it does **not fix it either**. Logged as a follow-up: open issue "Escape user-supplied strings in print.one template builder" after this fix lands. Out of scope here because it is a separate concern with its own test surface.

### Surface area

- No new endpoints, no new auth paths, no new env vars.
- `lib/printone-render.ts` is a pure HTML-string transformer with no I/O. Cannot leak secrets, cannot hit the database, cannot make network calls.

### Logging

- No changes to logging. `console.error('[printone/template] fout:', err)` (template/route.ts:334) remains the sole error log site for this route. Wrapper helpers do not log -- they are pure functions and their failure modes are caught by callers.

---

## 7. Scalability impact

Negligible.

- Wrappers are pure CPU work on small strings (typical flyer HTML ~5-50 KB). Cost is O(n) on input size.
- No new DB queries, no new external API calls, no shared state.
- Refactor reduces total bytes of code in the bundle (deduplicates ~60 lines).

---

## 8. Acceptance criteria

The fix is verified complete when **all** of the following hold:

1. `npm test` passes including the new test file. Coverage on `lib/printone-render.ts` is >= 95%.
2. `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass.
3. `app/api/printone/route.ts` and `app/api/printone/template/route.ts` no longer contain duplicated `PRINT_CONFIG` or `wrapForPrint` code -- both import from `lib/printone-render`.
4. **Visual proof from print.one:** a test order placed through `POST /api/printone/template` (with a real `PRINTONE_API_KEY` against the print.one staging or test mode) produces a PDF preview from print.one's API that fills the full A5 sheet with the flyer content edge-to-edge (allowing for the 3 mm bleed). Screenshot saved to the PR description.
5. Same visual proof for A6 and SQ formaats.
6. Existing order-route flow (`POST /api/printone`) is unchanged in behaviour -- a regression test order through that path still produces a correctly-sized print.

---

## 9. Risks and rollback strategy

### Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Refactor breaks the working order route | Low | Order route logic is preserved verbatim, only the file location changes. Existing webhook tests still run. |
| `wrapMmHtmlForPrint` works in tests but print.one renders differently than expected | Medium | The acceptance criterion requires a real test order against print.one before merge -- not just unit tests. |
| `buildTemplateHTML` head style stripping breaks logo adapt script | Low | The `<script>` tag for logo adaptation is preserved by the head extraction regex. Test `test_wrapMmHtmlForPrint_preservesHeadScripts` locks this in. |
| Visual regression on already-shipped templates | Low | Templates are recreated from scratch on every campaign send (no template caching across campaigns), so no historical templates need to keep rendering. |
| Browser default DPI differs from 96 dpi assumption on print.one's side | Low | If true, the symptom would already exist on the order route (which works). Document the 96 dpi assumption in a comment in `printone-render.ts` so a future maintainer can find it if print.one ever changes their renderer. |

### Rollback

The change is a single PR touching 4 files. Rollback is a `git revert` of that PR. No DB migrations, no env var changes, no config drift. Print.one templates are created per-campaign and not cached, so reverting takes effect on the next campaign send.

If a partial rollback is needed (e.g. the order route refactor turns out fine but the template wrapper change misbehaves), the helpers are independently importable -- the order route can keep using `wrapPreviewHtmlForPrint` while the template route reverts to the in-file mm wrapper.

---

## 10. Out of scope

- Escaping user-supplied strings in `buildTemplateHTML` (separate spec).
- Adding a server-side preview endpoint that renders the wrapped HTML for visual QA (nice to have, not required for this fix).
- Refactoring `buildTemplateHTML` to preview-pixel units (Option B, rejected).
- Changing print.one's `format` parameter mapping or pricing logic in `lib/printone-pricing.ts`.
