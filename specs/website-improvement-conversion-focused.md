# Website Improvement -- Conversion-Focused Plan

Source: /coplan output from 2026-05-12, refined by Codex critique and Claude
synthesis. This spec is the implementation playbook.

> **Scope discipline.** This spec covers six phases (A through F). Each phase
> is intended as its own PR (or a small batch of PRs). The Post-Implementation
> Workflow in `CLAUDE.md` runs at the **end of each phase**, not once at the
> end of the whole spec. Do not stack phases into a single review pass.

---

## Objective

**What:** Improve the public LokaalKabaal website (marketing surface +
signup/checkout funnel) so the first paid subscription (the verbouwpro.nl
€300/mo target) closes, and so future conversion improvements can be measured
rather than guessed at.

**Why:** Codebase has breadth (40+ pages, programmatic SEO, working checkout)
but no measurement, no operational error tracking beyond console, no real
trust proof above the fold, and a 669-line inline-styled monolithic
`LandingPage.tsx` that slows every future iteration. The bottleneck is
*learning speed and trust at point of first purchase*, not feature surface.

**Success metric (primary):** first paid subscription closes by end of
Phase C (~3 weeks from start).

**Success metric (secondary):** every funnel step from `landing_view` ->
`payment_succeeded` has an event count visible on the dev-only
`/admin/funnel` dashboard by end of Phase A.

**Explicit non-goals:**
- No designer-led visual rebrand.
- No new programmatic SEO pages (gemeente expansion, new blog).
- No stack migration. Next.js 14 stays.
- No follow-up-flyer UI or dashboard onboarding redesign (retention work;
  acquisition is the current bottleneck). Only the minimum post-payment
  smoke-test fix lives in scope (Phase C3).
- No BE / DE locale work.

---

## Phase map and ordering

| Phase | Theme | Blocks on | Approx PRs |
|------|------|-----------|-----------|
| A | Observability + analytics | -- | 4 |
| B | Trust, clarity, pricing coherence | A3 (event taxonomy) | 5 |
| C | Checkout friction + first-payment smoke test | A (events live) | 3 |
| D | SEO hygiene + copy/ops alignment | C (funnel measurable) | 3 |
| E | Tech debt that compounds (parallel) | -- | 3-5 |
| F | A11y / perf polish | A5 baseline | 3 |

E may run in parallel with any other phase since it is non-blocking.
F should run last (Lighthouse delta is meaningful only after B/C ship).

---

## Phase A -- Measurement and observability

### A1. Wire Sentry into `lib/telemetry.ts`

**Goal:** every existing `captureError` / `captureWarning` / `captureEvent`
call site (already used throughout the codebase) starts flowing to Sentry
without changing call sites or test contracts.

**Constraint:** `tests/lib/test_telemetry.ts` exists and pins the current
console-based behavior (e.g. `expect(errSpy).toHaveBeenCalledTimes(1)`,
prefix `[telemetry:error]`, JSON-string second argument). Per TDD rule
these tests are frozen. **The new Sentry transport must be additive**:
console output stays exactly as today, Sentry is a sidecar.

**Files to modify:**
- `lib/telemetry.ts` -- add optional `Sentry.captureException` /
  `Sentry.captureMessage` calls *after* the existing `console.*` calls.
  Guard on `process.env.SENTRY_DSN` so unit tests (which don't set DSN)
  see zero Sentry interaction.
- `next.config.mjs` -- wrap with `withSentryConfig` from
  `@sentry/nextjs`. Set `silent: true`, `widenClientFileUpload: true`.
- `sentry.server.config.ts` (new) -- server SDK init, sampling 100%
  errors + 10% traces.
- `sentry.client.config.ts` (new) -- client SDK init, 0% replays by
  default (privacy posture; can be enabled later for paying users only).
- `sentry.edge.config.ts` (new) -- edge SDK init for the middleware.
- `.env.example` -- add `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`,
  `SENTRY_ORG`, `SENTRY_PROJECT`.

**Files to create new:**
- `lib/__tests__/telemetry-sentry.test.ts` -- NEW tests (additive, do
  not touch existing `test_telemetry.ts`).

**Coverage required:** every `try/catch` in `app/api/**/route.ts` that
talks to Stripe, Resend, PrintOne, Anthropic, the Neon DB driver, or the
cron handler -- audit list:
  - `app/api/stripe/checkout/route.ts`
  - `app/api/stripe/webhook/route.ts`
  - `app/api/stripe/portal/route.ts`
  - `app/api/stripe/credit/route.ts`
  - `app/api/stripe/invoices/route.ts`
  - `app/api/contact/route.ts` (Resend)
  - `app/api/printone/**` (all routes)
  - `app/api/cron/**` (monthly dispatch)
  - `app/api/ai/**` (Anthropic)
  - `app/api/scan/**` (QR scan ingestion, conversion-relevant)
Each catch MUST call `captureError(err, { route: '...' })` if not already.

**Security:**
- Never include request body, cookies, or `Authorization` header in
  Sentry breadcrumbs. Set `beforeSend` to scrub.
- Scrub PII: email addresses, Dutch postcodes (PII under AVG when
  combined with address), credit-card fragments.
- Source maps upload requires `SENTRY_AUTH_TOKEN` in CI only, never
  committed.

### A2. Choose and wire product analytics

**Decision required at start of A2:** PostHog EU (preferred) vs Plausible.
Default to **PostHog EU** because we need funnel + cohort, and a single
upcoming verbouwpro.nl visitor is too valuable to lose to "we couldn't
tell why they bounced."

**If PostHog EU is chosen:**
- Host: EU region (`https://eu.i.posthog.com`).
- Session replay: **off** by default. Enable only after `/avg-dpia`
  page is updated and Kristian explicitly opts in.
- Autocapture: off. We send explicit events only (cleaner taxonomy,
  smaller bundle).

**Files to create:**
- `lib/analytics.ts` -- thin client wrapper:
  - `track(eventName: AnalyticsEventName, props?: AnalyticsProps): void`
  - `identify(userId: string, traits?: Record<string,unknown>): void`
  - `pageView(path: string): void`
  - Reads `NEXT_PUBLIC_POSTHOG_KEY`; no-op if absent (so dev/test runs
    clean).
- `components/Analytics.tsx` -- mounts PostHog in `app/layout.tsx`.
- `lib/analytics-events.ts` -- type-safe event-name + payload unions
  (see A3).

**Files to modify:**
- `app/layout.tsx` -- include `<Analytics />`.
- `app/avg-dpia/page.tsx` -- add a section "Welke analytics gebruiken
  wij?" listing PostHog EU, event-only mode, no replay, retention period.

### A3. Define the event taxonomy

**Output:** `docs/analytics-events.md` -- single source of truth.

The taxonomy below is the **frozen contract**. `lib/analytics-events.ts`
must export a TypeScript union that matches it exactly; CI will fail if
they drift.

```
landing_view                       { path }
branche_view                       { branche, gemeente?: string }
pricing_view                       { surface: 'home'|'branche'|'pricing-page' }
roi_calc_used                      { branche?, monthly_movers?: number }
sample_flyer_viewed                { source: 'hero-cta'|'pricing'|'direct' }
cta_click                          { cta_id, surface }
signup_started                     { method: 'email'|'magiclink' }
signup_completed                   { user_id }
login_started                      { method }
login_completed                    { user_id }
wizard_started                     { user_id }
wizard_step_completed              { user_id, step: number, step_name }
wizard_abandoned                   { user_id, last_step }
checkout_started                   { user_id, tier, monthly_amount_cents }
checkout_error                     { error_code, error_surface }
payment_succeeded                  { user_id, stripe_subscription_id }
contact_submitted                  { topic? }
demo_requested                     { surface }
```

### A4. Build `/admin/funnel` dev dashboard

**Files to create:**
- `app/admin/funnel/page.tsx` -- server component, behind `requireAuth`
  AND an `isAdmin(userId)` check (see Security below).
- `app/api/admin/funnel/route.ts` -- queries PostHog API or, as a
  fallback, queries our own event table if we mirror events to Neon.
  Returns last-30-day counts at each funnel step.

**Security:** the admin gate. Add `isAdmin(userId): boolean` to
`lib/auth.ts`. Implementation reads `ADMIN_EMAILS` env var (comma list).
Reject if missing or empty. Log access via `captureEvent('admin.access',
{ route })`.

### A5. Performance + a11y baseline

**Output:** `docs/baseline-perf.md` (committed). Document the numbers
for `homepage`, `flyers-versturen-nieuwe-bewoners`, top 3 branche pages,
`pricing`, `app/login`:
- Lighthouse Performance, Accessibility, Best Practices, SEO scores.
- Core Web Vitals (LCP, INP, CLS) per page.
- Top 5 axe violations per page.
- WebPageTest filmstrip notes (first paint, fully loaded).

No code changes. This is the reference point Phase F regresses against.

---

## Phase B -- Trust, clarity, pricing coherence

### B1. Homepage above-the-fold rewrite

**Files to modify:** `components/landing/LandingPage.tsx` (lines ~67-200,
the HERO section). Note: B1 lands BEFORE E1 (split), so this is an
in-place rewrite. E1 then extracts.

Concrete changes:
- One promise: "Elke maand automatisch flyers naar nieuwe huiseigenaren
  in jouw postcodes -- tussen de 28e en 30e op de mat."
- One primary CTA: "Start je campagne" -> `/app` (or signup).
- One secondary CTA: "Bekijk voorbeeldcampagne" -> `/voorbeelden/maandrapport`
  (B5 fixes the destination if needed).
- Remove the second "or" pathway, the email-capture-strip, and any
  competing CTA above the fold.
- Reduce or gate Hero3D: only render above 1024px viewport AND with
  `prefers-reduced-motion: no-preference`. Below that, a still SVG
  rendering of the same particle network (export from current Three
  scene at canonical viewport once).

Wire `cta_click` events on both CTAs.

### B2. Trust block component (new)

**Files to create:**
- `components/landing/TrustBlock.tsx` -- presentational, no animation.

Contents (Dutch copy, sourced from real ops, **must not overstate**):
1. **Drukker en bezorging** -- print partner name + bezorggarantie
   window ("Tussen de 28e en 30e van elke maand bij elke nieuwe
   huiseigenaar op de mat").
2. **Databron** -- "Wij koppelen Kadaster-eigendomsoverdrachten via
   Altum, dezelfde bron die makelaars en NVM-leden gebruiken."
3. **Privacy / AVG** -- one line + link to `/avg-dpia`.
4. **De maker** -- founder photo + name + direct email
   (`kristian@lokaalkabaal.agency` or whatever the canonical address is;
   verify against current contact-config).
5. **Support response** -- "Reactie binnen 1 werkdag op werkdagen."
   Only commit if this is operationally true.
6. **Wat gebeurt er nadat je betaalt?** -- 4-step timeline:
   1. Welkomstmail met dashboard-link
   2. Postcodes selecteren in dashboard
   3. Flyerontwerp uploaden of laten genereren
   4. Eerste bezorging tussen 28-30e van de eerstvolgende maand.

**Files to modify:** `components/landing/LandingPage.tsx` -- import
`TrustBlock`, render directly above `<PricingSection />`.

### B3. ICP-shaped worked example

**Files to create:** `components/landing/IcpExample.tsx`.

Content (use a generic installateur, **do not name verbouwpro.nl
publicly** without explicit permission):

> "Een installatiebedrijf in Zwolle kiest 12 postcodes. Per maand
> verhuizen daar gemiddeld ~180 nieuwe huiseigenaren. Bij €X per flyer
> is de maandelijkse investering €Y. Conversiecijfer in de pilot was 2%:
> dat is ~3 nieuwe klanten/maand, bij gemiddeld €8.000 verbouwbudget
> jaar 1 = €24.000 omzet uit één maand flyers."

All numbers MUST be cross-checked against `lib/printone-pricing.ts` and
`lib/clv.ts`. If they don't match, the example must be edited to match,
not the other way around (see Phase D1).

**Files to modify:**
- `components/landing/LandingPage.tsx` -- render between TrustBlock and
  PricingSection.
- `app/flyers-versturen-installateur/page.tsx` -- include same component.

### B4. Pricing coherence audit

**Audit target list (read-only):**
- `components/PricingSection.tsx` (356 lines)
- `components/landing/PricingPreviewCalculator.tsx` (140 lines)
- `app/tools/roi-calculator/page.tsx`
- All `app/flyers-versturen-*/page.tsx` (5 branche pages)
- `app/flyers-versturen-[branche]-in-[gemeente]/page.tsx`
- `app/page.tsx` heading area

**Output:** `docs/pricing-coherence-audit.md` -- table of every
price-bearing claim found, the file, the line, and whether it matches
`lib/printone-pricing.ts`. Then a follow-up PR that aligns
discrepancies.

**The canonical pricing data lives in `lib/printone-pricing.ts`.**
Component-level price strings must read from a single exported
constant (or compute at render time), never hardcode.

### B5. Reachable sample flyer

**Files to modify:**
- `app/voorbeelden/maandrapport/page.tsx` -- if this is the sample
  flyer page, ensure it loads a real sample (PNG or the PDF route)
  above the fold. If it's specifically a monthly report, create
  `app/voorbeeld-flyer/page.tsx` instead.
- `components/landing/LandingPage.tsx` -- hero secondary CTA points
  here. Wire `sample_flyer_viewed` event on page mount.

---

## Phase C -- Checkout friction + first-payment smoke test

### C1. Checkout walk-through and Dutch error coverage

**Process:** Kristian (or one of us) walks the Stripe checkout end-to-end
on production with a real card in test mode. Screenshot every step.
List every screen that:
- has non-Dutch copy
- has a generic "Er ging iets mis" without context
- has a CTA that doesn't say what happens next
- requires a step that isn't strictly required.

**Files likely to modify:**
- `app/api/stripe/checkout/route.ts` -- error response body. Per
  `docs/review-lessons.md`: keep the generic Dutch message for clients
  but always log the real error via `captureError`. Verify each Stripe
  failure code (`card_declined`, `incorrect_cvc`, `expired_card`,
  `authentication_required`, `processing_error`, network/timeout) maps
  to a distinct user-readable Dutch sentence.
- `lib/checkout-handler.ts` -- shared error->Dutch mapping (new export
  `dutchStripeError(code: string): string`).
- Whatever wizard component fronts checkout (likely under `app/app/`)
  -- ensure error display uses inline error per review-lesson:
  *"use inline error for direct-action failures the user is watching"*.

**TDD:** new tests for `dutchStripeError` covering every Stripe code we
care about (see TDD sequence below).

### C2. Demo fallback

**Files to create:**
- `components/landing/DemoFallback.tsx` -- a card that appears on
  checkout-error states OR after `exitIntent` on the pricing page,
  offering a 10-minute call with Kristian. Pre-filled Calendly URL or
  mailto.

**Files to modify:**
- `components/landing/PricingSection.tsx` -- render below pricing tiers,
  desktop only.
- `app/app/page.tsx` (or wherever checkout-error UI lives) -- on the
  error state, show DemoFallback alongside the retry button.

Wire `demo_requested` event.

### C3. First-payment smoke test (the partial-onboarding scope)

**Not an automated test.** This is a manual walkthrough Kristian (or us
on his behalf with a test account) does after C1+C2 ship.

**Process:**
1. Pay with a real card (or staging-prod-mirrored test account).
2. Walk every screen after `payment_succeeded`: welcome email,
   dashboard first load, wizard, flyer-create, postcode-select,
   monthly-reach preview, "what happens next" copy.
3. List every dead end / unclear copy / missing confirmation in
   `docs/first-payment-smoke-test.md`.
4. Fix only those listed. No new features. No redesign.

**Files likely affected:** `app/app/page.tsx`, `lib/email-templates.ts`,
welcome-email path in `lib/email.ts`. Exact set is discovered during the
walkthrough.

### C4. First-data review

After Phase A events have been live ~2 weeks AND C3 has shipped, read
the `/admin/funnel` numbers. Identify the highest-drop-off step. File a
new spec (do NOT inline here) for the next iteration. Stop this spec.

---

## Phase D -- SEO hygiene and accuracy

### D1. Copy <-> ops alignment audit

**Process:** read every claim on:
- `app/page.tsx` (via `LandingPage`)
- `app/flyers-versturen-nieuwe-bewoners/page.tsx`
- 5 branche pages
- `app/direct-mail-mkb/page.tsx`

Cross-check against:
- Actual print/delivery window (PrintOne pipeline timing in
  `lib/dispatch.ts` and `lib/printone.ts`).
- Actual automation level (does it really run unattended? what manual
  steps remain?).
- Actual data freshness from Altum/Kadaster (lag time, coverage).
- Actual pricing (`lib/printone-pricing.ts`).

**Output:** `docs/copy-ops-audit.md`. Every misalignment becomes a
copy-fix PR in this phase, BEFORE D2.

### D2. GSC top-20-impressions / rank-11-30 fixes

**Process:** Kristian pulls GSC export. Identify 20 queries with rank
11-30. For each, identify the corresponding page. Rewrite title + H1 +
first 100 words to lead with the exact query phrase (where it isn't
spammy).

**Files to modify:** page metadata + H1 of the affected pages. No new
pages.

### D3. Internal linking + breadcrumb schema

**Files to create:**
- `components/Breadcrumbs.tsx` -- visual breadcrumbs + emits
  `BreadcrumbList` JSON-LD via a `<Script type="application/ld+json">`.

**Files to modify:**
- All branche pages.
- All gemeente pages.
- Blog post pages.

Each branche page links up to the corresponding gemeente hub (if
relevant) and laterally to 2-3 sibling branches. Each gemeente page
links to the 5 branche variants for that gemeente.

**Explicitly out of scope for Phase D:** new blog posts, new
programmatic gemeente pages, new branche templates.

---

## Phase E -- Tech debt that compounds (parallel)

### E1. Split `LandingPage.tsx`

**Current:** 669 lines, monolithic, inline styles.

**Target file layout:**
```
components/landing/
  LandingPage.tsx              (composition root, < 80 lines)
  HeroSection.tsx              (new)
  StappenSection.tsx           (new)
  CLVSection.tsx               (new)
  TrustBlock.tsx               (created in B2)
  IcpExample.tsx               (created in B3)
  PricingBlock.tsx             (new wrapper around PricingSection)
  TestimonialsSection.tsx      (new wrapper)
  FooterCTA.tsx                (new)
```

**Strategy:** one section per PR. Each PR includes a screenshot diff
(before/after, 1280px desktop + 375px mobile + dark mode). Animation
behavior must be byte-identical -- `framer-motion` props move with the
JSX, no values change. Inline style objects move with the JSX into the
new component; do NOT convert to Tailwind in this PR (that's E2).

### E2. Inline -> Tailwind, mechanical only

**Constraint:** only inline styles that have a 1:1 Tailwind equivalent
are converted. Theme tokens (`var(--ink)`, `var(--paper)`,
`var(--sidebar-*)`) and any computed values (e.g.
`'rgba(0,232,122,0.08)'`) stay as inline `style` props. The goal is
*shorter files*, not *zero inline styles*.

### E3. CI workflow

**Files to create:** `.github/workflows/ci.yml`.

```
on: [pull_request, push to main]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node (20)
      - cache npm
      - npm ci
      - npm run lint
      - npx tsc --noEmit
      - npm test
      - npm run build
```

Build cache and Next.js telemetry disabled in CI. Secrets needed:
none for these steps (build needs `NEXT_PUBLIC_*` env defaults --
populate from `.env.example` defaults).

**Note:** there is no GitHub Actions workflow yet (`.github/` is
absent). E3 is foundational for safe E1/E2 refactors and should ideally
ship BEFORE E1.

---

## Phase F -- A11y / perf polish

### F1. Fix axe violations from A5 baseline

Target: top 5 axe violations per surveyed page. Most likely categories:
missing alt text, low color contrast, missing form labels, missing
landmark roles. Each fix is a tiny PR.

### F2. next/image migration + AVIF/WebP

Audit every `<img>` in `app/` and `components/`. Convert to
`next/image` with explicit `width`/`height`. Confirm `next.config.mjs`
sets `images.formats = ['image/avif', 'image/webp']`.

### F3. Hero3D desktop-only lazy load

Already gated visually in B1. Now gate the *import*: extend the
existing `dynamic(() => import('@/components/Hero3D'), { ssr: false })`
in `LandingPage.tsx` with a viewport-width check that skips importing
the chunk on mobile entirely. Three.js bundle is ~600KB gzipped --
mobile users should never download it.

---

## TDD sequence

Per CLAUDE.md, tests freeze first, code passes them.

### A1 (Sentry sidecar)

**Tests to write FIRST -- `lib/__tests__/telemetry-sentry.test.ts`:**

```
test_captureError_withSentryDsn_callsSentryCaptureException
test_captureError_withoutSentryDsn_doesNotCallSentry
test_captureError_alwaysCallsConsoleErrorRegardlessOfSentry
test_captureError_sentryFailure_doesNotThrow
test_captureWarning_withSentryDsn_callsSentryCaptureMessage_levelWarning
test_captureEvent_doesNotForwardToSentry
   (events are analytics not errors, by design)
test_telemetry_scrubsCookieHeader_fromBreadcrumbs
test_telemetry_scrubsAuthorizationHeader_fromBreadcrumbs
test_telemetry_scrubsEmailAddresses_fromMessages
test_telemetry_scrubsPostcodes_fromMessages
   (NL postcode regex: /\b\d{4}\s?[A-Z]{2}\b/)
```

Mock `@sentry/nextjs` via `vi.mock`. Set/unset `process.env.SENTRY_DSN`
per test.

The pre-existing `tests/lib/test_telemetry.ts` MUST keep passing
unchanged. If any of those break, the implementation is wrong.

### A2 (analytics wrapper)

**Tests -- `tests/lib/test_analytics.ts`:**

```
test_track_withoutPosthogKey_noOps
test_track_withPosthogKey_callsPosthogCapture
test_track_unknownEventName_throwsInDev_silentInProd
   (compile-time guard via TS union is primary; runtime is defence)
test_identify_withUserId_callsPosthogIdentify
test_pageView_callsPosthogCaptureWithPageview
test_track_neverThrows_evenIfPosthogIsBroken
```

### A3 (event taxonomy contract)

**Tests -- `tests/lib/test_analytics-events.ts`:**

```
test_analyticsEvents_matchDocsFile
   (parse docs/analytics-events.md and compare with the TS union)
```

This is the drift-detection test. If somebody adds an event to the .md
without updating the .ts (or vice versa), CI fails.

### A4 (admin funnel)

**Tests -- `tests/lib/test_auth-isAdmin.ts` + e2e for the page:**

```
test_isAdmin_userEmailInAdminList_returnsTrue
test_isAdmin_userEmailNotInList_returnsFalse
test_isAdmin_adminEmailsEnvUnset_returnsFalse
test_isAdmin_adminEmailsEnvEmpty_returnsFalse
test_isAdmin_caseInsensitiveMatch_returnsTrue

# playwright (tests-e2e/)
test_adminFunnelRoute_unauthenticated_redirectsToLogin
test_adminFunnelRoute_authenticatedNonAdmin_returns403
test_adminFunnelRoute_authenticatedAdmin_renders
```

### B2 (TrustBlock)

**Tests -- `tests/components/test_TrustBlock.tsx`:**

```
test_TrustBlock_rendersAllSixBlocks
test_TrustBlock_avgLink_pointsToAvgDpiaRoute
test_TrustBlock_founderEmail_isMailtoLink
test_TrustBlock_supportSlaCopy_matchesContactConfig
   (ensures copy comes from lib/contact-config.ts, not hardcoded)
```

### B3 (IcpExample)

**Tests -- `tests/components/test_IcpExample.tsx`:**

```
test_IcpExample_pricePerFlyer_matchesPrintonePricing
test_IcpExample_clvNumber_matchesClvLibForInstallateur
test_IcpExample_doesNotMentionVerbouwpro
   (guard against accidental brand-leak)
```

### B4 (pricing coherence)

No code tests for the audit doc. But add:

**Tests -- `tests/lib/test_pricing-canonical.ts`:**

```
test_PricingSection_priceString_matchesPrintonePricing
test_PricingPreviewCalculator_priceString_matchesPrintonePricing
test_roiCalculator_pricePerFlyer_matchesPrintonePricing
```

These regression-pin the alignment so a future edit to one place
breaks tests if the canonical source isn't followed.

### C1 (dutchStripeError)

**Tests -- `tests/lib/test_checkout-handler-dutch.ts`:**

```
test_dutchStripeError_cardDeclined_returnsCardDeclinedDutch
test_dutchStripeError_incorrectCvc_returnsCvcDutch
test_dutchStripeError_expiredCard_returnsExpiredDutch
test_dutchStripeError_authenticationRequired_returns3dsDutch
test_dutchStripeError_processingError_returnsGeneralDutch
test_dutchStripeError_unknownCode_returnsGenericDutch
test_dutchStripeError_emptyCode_returnsGenericDutch
test_dutchStripeError_never_returnsEnglishOrLeaksStripeMessage
```

### D3 (Breadcrumbs)

**Tests -- `tests/components/test_Breadcrumbs.tsx`:**

```
test_Breadcrumbs_emitsJsonLdScriptTag
test_Breadcrumbs_jsonLd_validBreadcrumbListSchema
test_Breadcrumbs_homeAlwaysFirstItem
test_Breadcrumbs_currentPageHasNoLink
```

### E3 (CI workflow)

No unit test. Validation = open a no-op PR; CI must run and pass on the
no-op. This is the acceptance.

### F (a11y / perf)

Tests are exploratory (Lighthouse, axe) rather than unit-level. The
baseline file from A5 IS the test fixture.

---

## Edge-case analysis (mandatory per CLAUDE.md)

Per CLAUDE.md "Edge Case Discipline," every test suite goes through
five levels before writing test code. Below is the analysis for the
two highest-stakes suites in this spec (the rest follow the same
template at PR time).

### Suite: `telemetry-sentry.test.ts`

**1. Input boundaries.**
- `err` is `undefined`, `null`, `0`, `false`, empty string, a circular
  object, a thrown string, a `Promise.reject`-style rejection value.
- `context` has 0 keys, 1 key, 1000 keys, nested objects, functions
  (which our type signature forbids but TypeScript-erased JS won't).
- `process.env.SENTRY_DSN` is `''`, `'   '`, a malformed string, a
  string ending in newline.

**2. State / lifecycle.**
- Sentry init fails (network, bad DSN).
- Sentry is mid-flush when process exits (cron context).
- Sentry SDK is loaded twice (Next.js HMR in dev).

**3. Integration / environment.**
- Edge runtime: `@sentry/nextjs` Edge SDK differs from Node SDK.
- Build-time: Sentry source-map upload requires `SENTRY_AUTH_TOKEN`;
  CI without the token must still build.
- Tests: any DSN at all in tests pollutes the Sentry project.

**4. Business logic / domain.**
- Cookie / Authorization scrubbing: must scrub BOTH header names and
  values matching cookie syntax in stack-trace frames.
- Email + postcode scrubbing: must NOT corrupt legitimate URLs that
  contain numerals matching the postcode regex (e.g., `/dispatch/2025`).
  Use whole-word boundary on the regex.

**5. Failure modes / recovery.**
- A bug in our scrubber must not prevent the error from being logged
  to console. The order of operations is: console first, scrub-and-
  forward second. If scrub throws, swallow and continue.

### Suite: `dutchStripeError`

**1. Input boundaries.** Empty string, `null`, undefined, very long
string, codes with whitespace, codes with mixed case, codes prefixed
with namespace (e.g., `'invalid_request_error.card_declined'`).

**2. State.** Stateless function; no lifecycle concerns.

**3. Integration.** Output is rendered into a user-facing inline error.
Must be safe to render as-is (no HTML to escape, no quotes that break
JSON when logged).

**4. Domain.** Every Stripe code we MIGHT hit. Source: Stripe's
documented decline codes. Coverage list pinned in tests/fixtures/
`stripe-decline-codes.json` so future Stripe code additions force a
deliberate update.

**5. Failure modes.** Function MUST always return a non-empty Dutch
string. No `undefined`, no English fallback. The default branch returns
"Er ging iets mis met de betaling. Probeer het opnieuw of neem
contact op."

---

## Files to create / modify (summary)

### Create
- `sentry.server.config.ts`
- `sentry.client.config.ts`
- `sentry.edge.config.ts`
- `lib/analytics.ts`
- `lib/analytics-events.ts`
- `components/Analytics.tsx`
- `components/landing/TrustBlock.tsx`
- `components/landing/IcpExample.tsx`
- `components/landing/DemoFallback.tsx`
- `components/landing/HeroSection.tsx`
- `components/landing/StappenSection.tsx`
- `components/landing/CLVSection.tsx`
- `components/landing/PricingBlock.tsx`
- `components/landing/TestimonialsSection.tsx`
- `components/landing/FooterCTA.tsx`
- `components/Breadcrumbs.tsx`
- `app/admin/funnel/page.tsx`
- `app/api/admin/funnel/route.ts`
- `.github/workflows/ci.yml`
- `docs/analytics-events.md`
- `docs/baseline-perf.md`
- `docs/pricing-coherence-audit.md`
- `docs/copy-ops-audit.md`
- `docs/first-payment-smoke-test.md`
- `lib/__tests__/telemetry-sentry.test.ts`
- `tests/lib/test_analytics.ts`
- `tests/lib/test_analytics-events.ts`
- `tests/lib/test_auth-isAdmin.ts`
- `tests/lib/test_checkout-handler-dutch.ts`
- `tests/lib/test_pricing-canonical.ts`
- `tests/components/test_TrustBlock.tsx`
- `tests/components/test_IcpExample.tsx`
- `tests/components/test_Breadcrumbs.tsx`
- `tests-e2e/admin-funnel.spec.ts`

### Modify
- `lib/telemetry.ts` (additive Sentry, no behavior change for console)
- `lib/auth.ts` (add `isAdmin`)
- `lib/checkout-handler.ts` (add `dutchStripeError`)
- `next.config.mjs` (Sentry wrap + image formats)
- `app/layout.tsx` (mount Analytics)
- `app/page.tsx` / `components/landing/LandingPage.tsx` (B1, then E1 split)
- `app/avg-dpia/page.tsx` (analytics disclosure)
- `app/api/stripe/checkout/route.ts` (use `dutchStripeError`)
- Multiple Stripe / Resend / PrintOne route files (Sentry coverage in
  catches)
- `components/PricingSection.tsx` (read from canonical pricing constant)
- `components/landing/PricingPreviewCalculator.tsx` (same)
- `app/tools/roi-calculator/page.tsx` (same)
- 5 branche pages (D2 metadata, D3 breadcrumbs)
- `.env.example` (Sentry + PostHog env vars)

### Read-only audited
- `lib/printone-pricing.ts`, `lib/clv.ts`, `lib/dispatch.ts`,
  `lib/printone.ts`, `lib/contact-config.ts`.

---

## Security considerations

1. **Sentry data leakage.** Default Sentry config sends request URL,
   query params, IP, user-agent, breadcrumbs (incl. console.log
   contents). Configure `beforeSend` to:
   - Drop `cookie` and `authorization` request headers entirely.
   - Replace email addresses in `message`, `breadcrumbs[].message`, and
     any stack-frame `vars` with `<email-redacted>`.
   - Replace NL postcodes (`\b\d{4}\s?[A-Z]{2}\b`) with `<pc4-redacted>`.
   - Drop the full request body when method is POST/PUT/PATCH.

2. **PostHog AVG / GDPR.**
   - EU region only. `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`.
   - Session replay OFF until DPIA updated.
   - Add to `/avg-dpia` page: data categories collected, retention
     period (PostHog default is 7 years; we'll set 90 days), user's
     right to deletion, processor (PostHog Inc / PostHog BV EU).
   - Cookie banner: PostHog with `persistence: 'memory'` so no cookie
     is dropped. Verify with browser devtools.

3. **`/admin/funnel` route.** Authn via existing `requireAuth`. Authz
   via new `isAdmin(userId)` reading `ADMIN_EMAILS`. Per
   review-lessons.md, *every* admin endpoint MUST also rate-limit; use
   the existing `authLimiter` or a new `adminLimiter`.

4. **CSP update for Sentry + PostHog.** `middleware.ts` CSP currently
   does NOT allow Sentry or PostHog. Add:
   - `connect-src` += `https://*.sentry.io https://eu.i.posthog.com`
   - `script-src` += `https://eu.i.posthog.com` (PostHog snippet)
   - `img-src` already permissive enough (`https:`).
   - **Do not** add `unsafe-eval` (review-lessons.md, 2026-03-26).
     Both Sentry and PostHog work without it.

5. **Source maps.** `withSentryConfig` uploads source maps to Sentry on
   build. This is fine (Sentry-only, not public). But verify the
   `.next/` output does not ship `*.map` files publicly. The default
   `hideSourceMaps: true` handles this; assert in build output.

6. **Demo fallback Calendly link.** External URL, may set third-party
   cookies. Use a plain mailto: fallback if Calendly is not
   AVG-compliant in the chosen plan.

7. **Sentry release tag.** Tag with the Vercel deployment SHA so
   alerts route to the right commit. Do NOT include `process.env`
   contents in release metadata.

---

## Scalability impact

- **Sentry quota.** Default sampling 100% errors. With current traffic
  (~0 paying users) quota is irrelevant; revisit at >10k events/month.
  Traces sampled at 10% from the start to avoid surprise bill at
  product-launch traffic spike.

- **PostHog event volume.** Event taxonomy has ~18 distinct events.
  Even at 1000 visitors/day, that's <100k events/month -- well within
  PostHog free tier (1M events).

- **`/admin/funnel` query.** Hits PostHog API, not our DB. No
  scalability concern. If PostHog API is down, page should show a
  graceful "data unavailable" rather than 500.

- **Bundle size.** PostHog client ~50KB gzipped, Sentry client ~80KB.
  Total +130KB on every page is significant for mobile. Mitigations:
  - PostHog: use the lite/proxy import.
  - Sentry: tree-shake unused integrations.
  - Both load with `defer` / `next/script` strategy `lazyOnload`.
  Track in F2/F3 perf delta.

- **Hero3D mobile gate (F3) is a real perf win**: -600KB on mobile
  bundle, likely +5-10 Lighthouse mobile score.

---

## Acceptance criteria

Per phase, ALL of the following must be true before that phase is
marked done.

### Phase A
- [ ] `npm test` passes including all new tests in A1-A4.
- [ ] `tests/lib/test_telemetry.ts` (pre-existing, frozen) still
      passes byte-identical.
- [ ] An error thrown in `app/api/stripe/checkout/route.ts` appears in
      Sentry within 60 seconds.
- [ ] A `landing_view` event from a fresh-incognito visit appears in
      PostHog within 30 seconds.
- [ ] `/admin/funnel` shows nonzero counts for at least
      `landing_view`, `pricing_view`, `cta_click` after 24h of traffic.
- [ ] `docs/baseline-perf.md` committed with Lighthouse + CWV + axe
      numbers for at least 6 pages.
- [ ] `/avg-dpia` page mentions PostHog by name with EU region,
      retention period, and right-to-delete.
- [ ] CSP in `middleware.ts` updated; CSP report-only deploy run for
      48h shows zero blocked Sentry/PostHog requests.

### Phase B
- [ ] Hero shows ONE primary and ONE secondary CTA above the fold.
- [ ] `TrustBlock` renders six labelled blocks; all copy verified
      against ops (signed off by Kristian in PR review).
- [ ] `IcpExample` numbers cross-checked against
      `lib/printone-pricing.ts` and `lib/clv.ts` via the new
      regression tests.
- [ ] `docs/pricing-coherence-audit.md` exists; every discrepancy
      either fixed or explicitly waived with reason.
- [ ] Sample flyer reachable in <=2 clicks from homepage.

### Phase C
- [ ] `dutchStripeError` coverage tests pass for every code in
      `tests/fixtures/stripe-decline-codes.json`.
- [ ] No English error string visible in any user-facing checkout
      surface (manual walk).
- [ ] DemoFallback CTA emits `demo_requested` event with correct
      surface tag.
- [ ] `docs/first-payment-smoke-test.md` lists every dead end found
      during the walk AND a linked commit fixing each item.
- [ ] At least one real paid subscription closes successfully end to
      end (the verbouwpro.nl target).

### Phase D
- [ ] `docs/copy-ops-audit.md` exists; every misalignment either
      fixed in this phase or filed as a follow-up issue.
- [ ] 20 rank-11-30 queries have updated title + H1 + lead paragraph.
      Re-check GSC after 4 weeks (out of scope of this spec, file as a
      future check-in).
- [ ] Every branche + gemeente + blog page renders a `<Breadcrumbs />`
      with valid `BreadcrumbList` JSON-LD. Test via Schema.org
      validator.

### Phase E
- [ ] `components/landing/LandingPage.tsx` is < 80 lines (composition
      root only).
- [ ] CI workflow runs on every PR and required to pass before merge.
- [ ] No inline style was *converted* unless its Tailwind equivalent
      is 1:1.

### Phase F
- [ ] Lighthouse Performance on homepage mobile >= baseline + 10
      points OR >= 85 (whichever is lower).
- [ ] Zero axe violations of severity "serious" or "critical" on the
      6 surveyed pages.
- [ ] Hero3D chunk is absent from the network tab on a 375px mobile
      load.

---

## Risks and rollback strategy

### Risk: Sentry config breaks production
**Probability:** medium. The `withSentryConfig` Next.js wrapping has
edge cases with App Router and Vercel.
**Mitigation:** ship A1 behind a one-way env flag -- if `SENTRY_DSN`
unset, all Sentry code paths are no-ops (already in the design).
**Rollback:** unset `SENTRY_DSN` in Vercel. Code path returns to
console-only. No code revert required.

### Risk: PostHog client breaks page render
**Probability:** low (PostHog is mature).
**Mitigation:** `<Analytics />` is a client component, wrapped in
ErrorBoundary. If it throws, the rest of the page renders.
**Rollback:** unset `NEXT_PUBLIC_POSTHOG_KEY`. Analytics calls become
no-ops.

### Risk: CSP update breaks existing functionality
**Probability:** medium. Sites with strict CSP often discover hidden
inline-script issues only after deploy.
**Mitigation:** deploy CSP changes in Report-Only mode first (separate
header), monitor `report-uri` for 48h, then promote to enforced.
**Rollback:** revert middleware.ts.

### Risk: Splitting LandingPage.tsx regresses framer-motion animations
**Probability:** medium. Spring configs and `key` props at section
boundaries are easy to disturb.
**Mitigation:** per-section PR with screenshot diff; visual regression
review on desktop + mobile + dark mode.
**Rollback:** revert the offending section's PR. Other section splits
are independent.

### Risk: Trust block claims overstate live operations
**Probability:** high. Founder copy often promises more than ops can
deliver. Per Codex critique this is a trust-collapse risk.
**Mitigation:** Phase D1 runs an explicit copy-ops audit. Every claim
in TrustBlock and IcpExample MUST be in the audit's "verified" column
before B2/B3 ship. Failing that, the claim is removed.
**Rollback:** edit copy.

### Risk: PostHog session replay activated by accident exposes PII
**Probability:** low (explicit config decision).
**Mitigation:** session replay opt-in is a SEPARATE PR with mandatory
review including a re-read of `/avg-dpia`.
**Rollback:** disable replay in PostHog dashboard (immediate effect,
not a code deploy).

### Risk: Phase C3 smoke test reveals more than a "small fix"
**Probability:** high. Real users find real things.
**Mitigation:** time-box C3 fixes to 2 days of work. Anything bigger
becomes a new spec, not a Phase C overrun. The primary acceptance
criterion (first paid subscription) does NOT require zero rough edges,
just zero blockers.
**Rollback:** N/A (each fix is its own PR with normal revert path).

### Risk: First-data review (C4) shows the bottleneck is upstream of the
funnel (no one visits)
**Probability:** medium. Solo-founder pre-launch traffic is thin.
**Mitigation:** Phase D (SEO hygiene) gives a targeted answer. If
traffic is the issue, a follow-up spec focuses on paid acquisition or
PR / launch partnerships -- NOT on more website improvements.

---

## Dependencies

- `@sentry/nextjs` (new dep). Pinned to latest exact version per
  CLAUDE.md "dependencies pinned to exact versions."
- `posthog-js` and `posthog-node` (new deps).
- No DB migration in this spec. (`drizzle-kit generate` not needed.)
- No new external paid services beyond Sentry free tier + PostHog free
  tier. Both have generous free quotas at current traffic.

---

## Out-of-scope items explicitly deferred to future specs

Logged here so future Kristian / Claude can find them:

- Follow-up flyer UI (top-3 ICE bet per memory). Defer until first
  paid subscription is paying for a second month.
- Dashboard onboarding-checklist redesign (top-3 ICE bet). Defer
  until first 3 paying customers exist (retention signal becomes
  meaningful).
- Programmatic SEO content expansion (new gemeente pages, new blog
  posts). Defer until funnel converts at >=1% on existing pages.
- BE / DE locale work.
- Visual rebrand.
- Stack migration.
- Component-level Storybook (would help E1 but adds scope).
- Session replay rollout (requires DPIA update first).
- Conversion-rate-optimization A/B test framework (premature without
  baseline traffic).
