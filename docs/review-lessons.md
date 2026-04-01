# Review Lessons

Accumulated review checklist built from actual mistakes caught during development.
When reviewing code (manually or via `/review` or `/cleanup`), verify each applicable item.

**How to use this file:**
- During review, scan each section and check any item that applies to the current changes.
- After catching a new mistake pattern, add it here immediately with the date and context.
- Keep entries specific and verifiable -- not vague principles, but concrete things to check.
- This file is referenced automatically by the post-implementation workflow in CLAUDE.md.

---

## API Design

- Every API route handling retailer data MUST call `requireAuth(req)` and use session identity, never trust email from query params or body -- caught: 2026-03-24, full sweep found 21/28 routes with zero auth
- Error responses MUST NOT contain raw error messages from external APIs (Stripe, PrintOne). Return generic Dutch-language messages only -- caught: 2026-03-24, stripe/checkout leaked err.message to clients

## State Management

- Single-file page components over 500 lines should be split into extracted components. Keep state in the parent, pass down as props -- caught: 2026-03-24, app/app/page.tsx was 4604 lines

## Database / ORM
<!-- No new lessons yet -->

## Component Patterns

- Never use `alert()` for user notifications. Use the Toast component (`showToast()` from `@/components/Toast`) -- caught: 2026-03-24, found alert() in FlyerExport and dashboard
- Three.js components MUST dispose geometries and materials in useEffect cleanup to prevent memory leaks -- caught: 2026-03-24, Hero3D created new BufferAttribute objects every frame without disposal
- Decorative/animation components (Hero3D, HeroMapAnim) MUST have `aria-hidden="true"` -- caught: 2026-03-24, screen readers were trying to parse particle network
- SVG icons inside interactive elements need `aria-hidden="true"` when the parent has an aria-label -- caught: 2026-03-24, Nav hamburger SVGs lacked accessibility attributes

## Error Handling

- API error responses must not leak internal details (stack traces, DB errors). Use generic messages like "Actie mislukt" -- caught: 2026-03-24, Stripe checkout route returned raw error messages
- Every `catch` block MUST either re-throw, log with `console.error`, or both. Empty catches silently swallow bugs -- caught: 2026-03-24, flyer/generate had 2 silent catches, scrape had 1
- Webhook routes that verify secrets MUST reject (not accept) when the secret env var is missing -- caught: 2026-03-24, PrintOne webhook accepted all requests if PRINTONE_WEBHOOK_SECRET was unset

## Security

- All API routes handling user data require auth via `requireAuth()` from `@/lib/auth` -- caught: 2026-03-24, 21 routes had no auth
- URL inputs (scrape, scan) MUST be validated with `isValidExternalUrl()` to prevent SSRF (blocks localhost, 127.0.0.1, 10.x, 192.168.x, file://) -- caught: 2026-03-24, /api/scrape accepted arbitrary URLs including internal IPs
- CSV exports MUST escape cells starting with `=`, `+`, `-`, `@` to prevent formula injection in Excel -- caught: 2026-03-24, codes/export generated unescaped CSV
- Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) are set in middleware.ts -- caught: 2026-03-24, no security headers were configured
- Input validation for all external data: use `lib/validation.ts` helpers (isValidEmail, isValidPc4, isValidFormaat, etc.) -- caught: 2026-03-24, most routes accepted unvalidated input
- Auth endpoints (login, register, magic-link) MUST have rate limiting via `authLimiter` from `@/lib/rate-limit` -- caught: 2026-03-26, zero rate limiting existed on any endpoint
- CSP must NOT include `unsafe-eval` -- Stripe.js works without it. Only `unsafe-inline` is needed for styles -- caught: 2026-03-26, CSP included unnecessary unsafe-eval

## Testing

- Vitest on Windows requires v2.x (not v4.x). Vitest 4.x depends on rolldown which lacks Windows native binaries -- caught: 2026-03-24, rolldown-binding.win32-x64-msvc.node not found
- Test files using `test_` prefix need vitest.config.ts include pattern: `tests/**/test_*.ts` -- caught: 2026-03-24, default vitest pattern only matches *.test.ts
- Pure function tests should use `environment: 'node'`, not `jsdom`. jsdom has ESM compatibility issues with Node 20 -- caught: 2026-03-24, html-encoding-sniffer ERR_REQUIRE_ESM

## Performance

- Three.js: reuse BufferAttribute objects in useFrame, never create new ones per frame -- caught: 2026-03-24, Hero3D allocated new BufferAttribute objects 60x/second
- Dynamic components (maps, 3D) should be wrapped in ErrorBoundary for graceful degradation -- caught: 2026-03-24, no error boundaries existed
- Use `next/font/google` instead of external Google Fonts stylesheet links to eliminate render-blocking requests -- caught: 2026-03-26, three external font stylesheets were blocking initial render
- Hardcoded URLs (like dashboard links in emails) MUST use `NEXT_PUBLIC_BASE_URL` env var for multi-environment support -- caught: 2026-03-26, 6 email functions had hardcoded production URLs

## External Integrations

- PrintOne webhook secret validation must fail closed (reject if env var missing), not fail open -- caught: 2026-03-24, fallback was to accept all requests
