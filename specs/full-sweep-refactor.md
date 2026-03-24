# Full Sweep Refactor Plan

## Objective

Comprehensive refactor of the Lokaalkabaal codebase to fix edge cases, improve code quality, and harden security -- while preserving all existing functionality. The app works; this sweep makes it robust, maintainable, and production-ready.

---

## Current State Summary

| Metric | Value |
|--------|-------|
| TypeScript files | 69 |
| API routes | 28 (21 unauthenticated) |
| Components | 6 |
| Tests | 0 |
| console.log in prod | 20+ |
| Emdashes in code | 311 instances |
| Input validation | Minimal |
| Auth middleware | None |
| Security headers | None |
| Rate limiting | None |
| Error boundaries | None |

---

## Phase 1: Foundation (Testing Infrastructure + Critical Fixes)

### 1.1 Set Up Testing Infrastructure

**Why:** TDD is mandated but zero tests exist. Every subsequent phase depends on having tests.

**Files to create:**
- `vitest.config.ts` -- test runner config
- `tests/setup.ts` -- global test setup (mocks for env vars, DB)
- `tests/lib/test_schema.ts` -- schema validation tests
- `tests/lib/test_tiers.ts` -- tier limits tests
- `tests/lib/test_verification.ts` -- verification URL tests
- `tests/lib/test_printone-pricing.ts` -- pricing calculation tests

**Files to modify:**
- `package.json` -- add vitest, @testing-library/react, test scripts

**TDD sequence:**
1. Install vitest + testing-library
2. Write tests for pure functions in `lib/` (tiers.ts, printone-pricing.ts, verification.ts)
3. Verify tests fail (no mocking issues)
4. Verify tests pass against existing code
5. These become the regression safety net for all subsequent phases

**Acceptance criteria:**
- `npm test` runs and passes
- All pure utility functions in lib/ have tests
- Coverage report generated

---

### 1.2 Remove console.log from Production Code

**Why:** CLAUDE.md forbids console.log in production. 20+ instances leak debug info.

**Files to modify:**
- `components/NLMap.tsx` (7 instances)
- `app/app/page.tsx` (1 instance)
- `app/api/cron/addresses/route.ts` (6 instances)
- `app/api/flyer/generate/route.ts` (6 instances)
- `app/api/printone/webhook/route.ts` (4 instances)
- `app/api/campaigns/route.ts` (1 instance)
- `app/api/scrape/route.ts` (1 instance)
- `app/api/stripe/webhook/route.ts` (1 instance)

**Action:** Remove all console.log/console.warn. Replace critical ones with structured console.error for genuine error paths only. Long-term: add a proper logger (Phase 5).

**TDD sequence:**
1. Write lint rule or grep-based test that fails if console.log found in app/ or components/
2. Remove all instances
3. Verify build still passes

---

### 1.3 Fix All Emdashes

**Why:** CLAUDE.md explicitly forbids emdashes. 311 instances found.

**Files to modify:** All .tsx/.ts files containing `\u2014` (em dash character)

**Action:** Replace all `--` (emdash) with ` -- ` (double hyphen), `-` (single hyphen), or restructured sentence depending on context.

**TDD sequence:**
1. Write grep-based test that fails if emdash character found
2. Find and replace all instances
3. Verify grep test passes

---

## Phase 2: Security Hardening

### 2.1 Authentication Middleware

**Why:** 21 of 28 API routes have zero authentication. Anyone can create campaigns, modify branding, export codes, grant credits under any email.

**Files to create:**
- `lib/auth.ts` -- auth helper: validate session, extract user
- `app/api/middleware-auth.ts` -- reusable auth wrapper for route handlers
- `tests/lib/test_auth.ts` -- auth tests

**Files to modify:**
- All API routes in `app/api/` that handle retailer data (campaigns, branding, codes, conversies, pincode, stripe/checkout, stripe/credit, stripe/portal, subscription/status, flyer/generate, ai, addresses)

**Approach:**
- Use existing localStorage email-based auth as foundation
- Add server-side session validation (signed HTTP-only cookie with retailer email + id)
- Login route sets secure cookie; all protected routes verify it
- Public routes stay public: verify/[code] GET (QR scan), webhooks (have their own auth), geocode, pc4, pc4grenzen

**TDD sequence:**
1. Write tests for auth helper: valid session, expired session, missing session, tampered session
2. Write tests for protected route wrapper: returns 401 without auth, passes through with valid auth
3. Implement auth helper and wrapper
4. Apply wrapper to each unprotected route, one by one
5. Write integration test: unauthenticated request to /api/campaigns returns 401

**Security considerations:**
- Cookie: HttpOnly, Secure, SameSite=Lax, short expiry
- Session token signed with server secret (env var)
- No email in query params for data access -- use session identity

---

### 2.2 Input Validation

**Why:** Most routes accept unvalidated input. No email format checks, no range validation, no URL sanitization.

**Files to create:**
- `lib/validation.ts` -- shared validation functions (email, postcode, URL, ranges)
- `tests/lib/test_validation.ts`

**Files to modify:**
- `app/api/campaigns/route.ts` -- validate branche, formaat, duurMaanden (1-24), straalKm, pc4Lijst
- `app/api/branding/route.ts` -- validate email format, hex colors, URL format
- `app/api/ai/route.ts` -- validate input lengths, branche enum
- `app/api/scrape/route.ts` -- validate URL (no internal IPs, no file:// protocol) to prevent SSRF
- `app/api/flyer/generate/route.ts` -- validate all design inputs
- `app/api/addresses/route.ts` -- validate postcode format (4 digits)
- `app/api/pincode/route.ts` -- validate pin format (4-6 digits)
- `app/api/verify/[code]/route.ts` -- add brute-force protection (rate limit PIN attempts)

**TDD sequence:**
1. Write validation function tests: valid/invalid emails, postcodes, URLs, ranges
2. Implement validation functions
3. Write API route tests: invalid input returns 400 with safe error message
4. Add validation to each route

---

### 2.3 Security Headers

**Why:** No CSP, HSTS, X-Frame-Options, or other security headers configured.

**Files to create:**
- `middleware.ts` -- Next.js middleware for security headers

**Headers to add:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://api.stripe.com https://*.tile.openstreetmap.org; frame-src https://js.stripe.com;
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

**TDD sequence:**
1. Write test: response from any route includes expected security headers
2. Implement middleware
3. Verify headers present

---

### 2.4 Fix PrintOne Webhook Fallback

**Why:** If PRINTONE_WEBHOOK_SECRET env var is missing, all webhook requests are accepted.

**File to modify:**
- `app/api/printone/webhook/route.ts` (line 17-18)

**Action:** Change fallback from "accept all" to "reject all" when secret is not configured. Log a warning.

**TDD sequence:**
1. Write test: missing secret rejects request with 500
2. Fix the fallback logic

---

### 2.5 Fix Error Response Leakage

**Why:** Several routes return raw error messages to clients, potentially exposing internal details.

**Files to modify:**
- `app/api/stripe/checkout/route.ts` -- generic error instead of err.message
- `app/api/campaigns/route.ts` -- sanitize PrintOne error responses
- `app/api/printone/route.ts` -- sanitize error responses

**TDD sequence:**
1. Write test: error responses contain only safe, generic messages
2. Implement safe error responses
3. Verify no stack traces or internal details leak

---

### 2.6 CSV Injection Prevention

**Why:** codes/export generates CSV that could contain formula injection payloads.

**File to modify:**
- `app/api/codes/export/route.ts`

**Action:** Prefix cell values starting with `=`, `+`, `-`, `@`, `\t`, `\r` with a single quote.

**TDD sequence:**
1. Write test: CSV cell starting with `=SUM(` is escaped
2. Implement escaping

---

## Phase 3: Code Quality & Refactoring

### 3.1 Split app/app/page.tsx (4,604 lines)

**Why:** Single file with the entire dashboard is unmaintainable. Complex state, inline styles, mixed concerns.

**Files to create (extract from app/app/page.tsx):**
- `components/dashboard/CampaignWizard.tsx` -- campaign creation flow
- `components/dashboard/FlyerPreview.tsx` -- flyer preview and editing
- `components/dashboard/PostcodeSelector.tsx` -- map-based postcode selection
- `components/dashboard/PriceCalculator.tsx` -- real-time pricing
- `components/dashboard/CampaignList.tsx` -- existing campaigns view
- `components/dashboard/MonthSelector.tsx` -- month/duration picker

**Files to modify:**
- `app/app/page.tsx` -- reduce to composition of extracted components

**TDD sequence:**
1. Write component tests for each extracted component (renders, handles props, fires callbacks)
2. Extract components one by one
3. Verify dashboard still works end-to-end
4. Verify no regressions in existing behavior

**Approach:**
- Extract bottom-up: pure display components first, then stateful ones
- Keep state management in page.tsx, pass down as props
- Do NOT change any behavior or styling -- pure extraction

---

### 3.2 Split app/page.tsx (717 lines)

**Why:** Landing page is manageable but would benefit from component extraction for reusability.

**Files to create:**
- `components/landing/StaggerText.tsx`
- `components/landing/CountUp.tsx`
- `components/landing/CLVSection.tsx`
- `components/landing/StepsSection.tsx`
- `components/landing/FadeUp.tsx`

**TDD sequence:**
1. Write render tests for extracted components
2. Extract components
3. Verify landing page renders identically

---

### 3.3 Replace alert() with Toast Notifications

**Why:** alert() blocks the UI thread and is poor UX.

**Files to modify:**
- `app/app/page.tsx` (campaign limit alerts)
- `components/FlyerExport.tsx` (PDF error alerts)

**Files to create:**
- `components/Toast.tsx` -- simple toast notification component

**TDD sequence:**
1. Write toast component tests
2. Implement toast
3. Replace all alert() calls
4. Verify same messages shown to user

---

### 3.4 Fix Silent Error Swallowing

**Why:** Several catch blocks silently discard errors without logging.

**Files to modify:**
- `app/api/flyer/generate/route.ts` (lines 439, 663) -- add console.error
- `app/api/scrape/route.ts` (line 105) -- add console.error

**Action:** Every catch block must either re-throw or log the error. No empty catches.

---

### 3.5 Fix Hero3D Memory Leaks

**Why:** Three.js geometries and materials are never disposed, causing memory leaks on navigation.

**File to modify:**
- `components/Hero3D.tsx`

**Action:**
- Add cleanup in useEffect return: dispose geometries, materials
- Add WebGL context loss handling
- Consider reducing particle count on mobile

**TDD sequence:**
1. Write test: component unmount triggers cleanup
2. Add disposal logic

---

## Phase 4: Accessibility & UX

### 4.1 Add Error Boundaries

**Files to create:**
- `components/ErrorBoundary.tsx` -- generic error boundary with fallback UI

**Files to modify:**
- `app/layout.tsx` -- wrap dynamic imports (Hero3D, NLMap) in error boundaries
- `app/app/page.tsx` -- wrap map and flyer preview in error boundaries

**TDD sequence:**
1. Write test: error boundary catches child errors, shows fallback
2. Implement error boundary
3. Wrap dynamic components

---

### 4.2 Accessibility Improvements

**Files to modify:**
- `components/Nav.tsx` -- add aria-labels to SVGs, keyboard navigation
- `app/app/page.tsx` -- proper label associations for form inputs, fix empty alt texts
- `components/Hero3D.tsx` -- add aria-hidden="true" (decorative)
- `components/HeroMapAnim.tsx` -- add aria-hidden="true" (decorative)

**TDD sequence:**
1. Write accessibility tests (check for aria attributes, alt text)
2. Add missing attributes

---

### 4.3 Replace `<img>` with Next.js `<Image>`

**Why:** Raw img tags miss out on automatic optimization, lazy loading, and responsive sizing.

**Files to modify:** All files using raw `<img>` tags for static/remote images.

**Action:** Replace with `next/image` where applicable. Keep raw img for dynamically generated content (flyer previews from blob URLs).

---

## Phase 5: Performance & Polish

### 5.1 Lazy Load Heavy Components

**Files to modify:**
- `app/page.tsx` -- lazy load PricingSection, CLV section below fold
- `app/app/page.tsx` -- lazy load map component until user reaches that step

**Action:** Use `React.lazy` + Suspense or Next.js dynamic imports with loading skeletons.

---

### 5.2 Responsive Design Fixes

**Files to modify:**
- `components/Nav.tsx` -- add tablet breakpoint (1024px)
- `components/HeroMapAnim.tsx` -- responsive sizing instead of fixed 340x400
- `components/Hero3D.tsx` -- reduce particle count on mobile, cap dpr

---

### 5.3 CountUp Animation Fix

**File to modify:**
- `app/page.tsx` (CountUp component)

**Action:** Replace setInterval with requestAnimationFrame or Framer Motion useSpring for smoother animation and proper cleanup.

---

## Phase 6: Documentation & Lessons

### 6.1 Update review-lessons.md

After completing all phases, document every new failure pattern discovered:
- API routes without auth
- console.log in production
- Emdashes in code
- Silent error catching
- CSV injection risk
- PrintOne webhook fallback
- Missing error boundaries
- Memory leaks in Three.js components

### 6.2 Update CLAUDE.md Status

Mark testing infrastructure as set up. Update current status checklist.

---

## Execution Order

| Order | Phase | Task | Risk | Estimated Complexity |
|-------|-------|------|------|---------------------|
| 1 | 1.1 | Testing infrastructure | Low | Medium |
| 2 | 1.2 | Remove console.log | Low | Low |
| 3 | 1.3 | Fix emdashes | Low | Low |
| 4 | 2.1 | Auth middleware | Medium | High |
| 5 | 2.2 | Input validation | Low | Medium |
| 6 | 2.3 | Security headers | Low | Low |
| 7 | 2.4 | PrintOne webhook fix | Low | Low |
| 8 | 2.5 | Error response leakage | Low | Low |
| 9 | 2.6 | CSV injection fix | Low | Low |
| 10 | 3.1 | Split dashboard page | Medium | High |
| 11 | 3.2 | Split landing page | Low | Medium |
| 12 | 3.3 | Toast notifications | Low | Low |
| 13 | 3.4 | Fix silent catches | Low | Low |
| 14 | 3.5 | Hero3D memory leaks | Low | Low |
| 15 | 4.1 | Error boundaries | Low | Low |
| 16 | 4.2 | Accessibility | Low | Medium |
| 17 | 4.3 | Next.js Image | Low | Medium |
| 18 | 5.1 | Lazy loading | Low | Low |
| 19 | 5.2 | Responsive fixes | Low | Medium |
| 20 | 5.3 | CountUp fix | Low | Low |
| 21 | 6.1 | Update lessons | None | Low |
| 22 | 6.2 | Update CLAUDE.md | None | Low |

---

## Security Considerations

- **Auth middleware (2.1)** is the highest-impact security change. Currently any user can access any other user's data via email parameter.
- **SSRF in /api/scrape** -- must validate URLs to prevent internal network access.
- **PIN brute-force** -- /api/verify/[code] POST needs rate limiting on PIN attempts.
- **Session management** -- new cookie-based sessions must use signed tokens with short expiry.
- **CORS** -- restrict to lokaalkabaal.agency domain only.

## Scalability Impact

- Component extraction (3.1, 3.2) improves code splitting and reduces bundle size.
- Lazy loading (5.1) reduces initial page load.
- Auth middleware adds minimal overhead per request (one cookie verification).
- No database schema changes in this plan.

## Risks and Rollback Strategy

| Risk | Mitigation |
|------|-----------|
| Auth middleware breaks existing flows | Deploy behind feature flag; test with existing test accounts first |
| Component extraction changes behavior | Extract one component at a time; visual regression test after each |
| Security headers break Stripe/Leaflet | Test CSP in report-only mode first |
| Test infrastructure setup fails | Start with vitest minimal config; add complexity incrementally |

**Rollback:** All changes are on a feature branch. If any phase causes issues, revert that phase's commits. Each phase is independently deployable.

---

## Not In Scope

- New features
- Database schema changes
- Migration to different auth provider (NextAuth.js)
- i18n/translation system
- Full rate limiting infrastructure (would need Redis/Upstash)
- CI/CD pipeline changes
- Monitoring/alerting setup
