# Lokaalkabaal

## Overview
Lokaalkabaal is a Dutch-language SaaS platform for local businesses to create and distribute targeted flyers (direct mail) to specific postcodes in the Netherlands. It handles flyer design (AI-assisted via Anthropic), printing via PrintOne API, Stripe payments, and campaign management. Deployed on Vercel.

## Tech Stack
- Language: TypeScript 5
- Framework: Next.js 14 (App Router)
- Database: PostgreSQL (Neon serverless) via Drizzle ORM
- Payments: Stripe
- Email: Resend
- AI: Anthropic SDK (flyer content generation)
- Styling: Tailwind CSS, Framer Motion
- Maps: Leaflet / React-Leaflet
- 3D: Three.js / React Three Fiber
- PDF: jsPDF + html2canvas
- Blob Storage: Vercel Blob
- Testing: (not yet configured)
- Build: npm, Next.js
- Linting: ESLint (next config)

## Architecture
Next.js App Router with the following structure:
- `app/` -- Pages, layouts, API routes
- `app/api/` -- Backend API endpoints (Stripe webhooks, AI generation, PrintOne integration)
- `app/app/` -- Authenticated dashboard area
- `components/` -- Shared React components
- `lib/` -- Core business logic, database schema, utilities
- `lib/schema.ts` -- Drizzle ORM schema (source of truth for DB)
- `drizzle/` -- Migration files
- `seo/` -- SEO-related content/config
- docs/architecture.md -- Full technical design (create when needed)

## Key Conventions
- All components and pages use TypeScript with strict mode
- Type hints on all function signatures, no exceptions
- Every public function/component has a docstring or JSDoc comment
- Config via environment variables, never hardcoded values
- Logging on every error path and every external call
- All external dependencies (Stripe, PrintOne, Anthropic, Neon) are abstracted behind interfaces
- Dutch-language UI; English-language code and comments
- Use `@/` path alias for imports

## Engineering Standards

### Test-Driven Development (Strict TDD)

This project follows strict TDD. The workflow is ALWAYS:

1. **Design tests first** based on the specification
2. **Freeze the tests** -- once written, tests are NOT modified to make them pass
3. **Write code** that makes the frozen tests pass
4. **Refactor** only after all tests are green

The test suite is the specification. If code doesn't pass the tests, the code is wrong, not the tests.

#### Test Structure
- Tests mirror the source structure: `lib/schema.ts` -> `tests/lib/test_schema.ts`
- Unit tests for every public function
- Integration tests for every module boundary
- End-to-end tests for every user-facing workflow
- Coverage target: 90% minimum, measured on every build
- Tests must be deterministic, no flaky tests, no timing dependencies

#### Test Naming
- `test_[function]_[scenario]_[expected_result]`
- Example: `test_calculatePrice_invalidPostcode_throwsError`

#### Edge Case Discipline

Before writing any test suite, perform a structured edge case analysis covering five levels: input boundaries, state/lifecycle, integration/environment, business logic/domain, and failure modes/recovery. Document the analysis before writing test code. The `/tdd-design` command enforces this as a mandatory step with detailed prompts for each level. When writing tests outside of `/tdd-design`, apply the same discipline: a test suite that only covers the happy path and one or two obvious error cases is incomplete. When in doubt, write the test; removing a redundant test later is cheaper than missing a real bug.

### Security

- Never hardcode secrets, API keys, tokens, or credentials anywhere
- All secrets via environment variables or a secrets manager
- Validate and sanitize ALL external input, user input, API responses, file content
- Use parameterized queries for all database operations (Drizzle handles this, but verify)
- Apply principle of least privilege everywhere: minimal permissions, minimal access, minimal exposure
- Log security-relevant events (auth failures, permission denials, input validation failures)
- All HTTP endpoints require authentication unless explicitly documented as public
- Dependencies must be pinned to exact versions
- No `eval()` or dynamic code execution from external input

### Deployment Security

- CAPTCHA on all auth/signup routes
- IP + user-based rate limiting on all API endpoints
- Enable WAF and DDoS protection on Vercel
- HTTPS everywhere, enforce secure cookie flags (HttpOnly, Secure, SameSite)
- Set security headers: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options
- Configure CORS to allow only known origins
- Run `npm audit` regularly
- Never return more data than the client needs, audit all API responses for data leakage
- Never expose internal errors, stack traces, or internal IDs to clients

### Scalability

- Design for horizontal scaling from day one, no singleton state, no in-memory-only state
- All state must be externalized (database, cache)
- Use connection pooling for Neon (already serverless, but verify pool config)
- Async I/O for all network calls, never block the event loop
- Pagination on every endpoint that returns a list
- Rate limiting on all public-facing endpoints
- Database indexes on every foreign key and every column used in WHERE clauses

### Code Quality

- Functions do one thing and are short enough to read without scrolling
- No god objects, no god functions
- Errors are handled explicitly, never silently swallowed
- Dead code is deleted, not commented out
- No TODO comments in merged code, track them as issues instead
- Every PR is a single logical change, no "while I was here" additions

## Post-Implementation Workflow

After completing any feature implementation, ALWAYS run this sequence before committing:

1. **Simplify.** Run the code-simplifier agent on all files changed in this feature. Target: remove unnecessary abstractions, collapse trivial wrappers, inline single-use variables, flatten overly nested logic. Do not simplify code that is complex for a documented reason (edge case handling, performance).
2. **Validate.** Run the full check suite after simplification:
   - `npm test`
   - `npm run lint`
   - `npm run build`
   If any check fails, fix the issue before proceeding.
3. **Review against lessons.** Read `docs/review-lessons.md` and verify each applicable item against the current changes. If any lesson applies and the code violates it, fix it now.
4. **Update lessons.** If you encountered a new failure pattern during this implementation (something you had to fix that wasn't already in the lessons file), append it to `docs/review-lessons.md` with the date and context.

This workflow is not optional. Skipping it creates technical debt that compounds across features.

## NEVER Do
- NEVER modify test assertions to make tests pass, fix the code instead
- NEVER skip or disable tests to get a green build
- NEVER hardcode API keys, tokens, passwords, or any secret
- NEVER use `eval()` or dynamic code execution
- NEVER catch broad exceptions without re-raising or logging
- NEVER add dependencies without checking if an existing one covers the use case
- NEVER store sensitive data in logs
- NEVER commit .env files, credentials, or private keys
- NEVER use string concatenation/interpolation for SQL or shell commands
- NEVER ignore type checker or linter warnings, fix them or explicitly justify the suppression
- NEVER write code without tests first (TDD is non-negotiable)
- NEVER merge without the full test suite passing
- NEVER assume external input is safe, validate everything
- NEVER skip the Post-Implementation Workflow, simplify, validate, review, update lessons
- NEVER write tests without first producing a structured edge case analysis
- NEVER use `any` type in TypeScript, use proper types or `unknown`
- NEVER leave `console.log` in production code, use proper logging
- NEVER use emdashes in any writing or comments; use alternative punctuation

## Database Safety Rules
- NEVER run destructive Drizzle commands (`drizzle-kit drop`, `drizzle-kit push --force`)
- NEVER run raw DROP TABLE, DROP DATABASE, or TRUNCATE
- For any destructive schema change: describe it first and wait for approval
- Safe migrations (additive only): `npx drizzle-kit generate` then `npx drizzle-kit migrate` is fine
- Always back up data before running migrations on production

## Common Commands
- `npm test` -- Run test suite
- `npm run lint` -- Lint (ESLint with Next.js config)
- `npx tsc --noEmit` -- Type check
- `npm run dev` -- Start dev server
- `npm run build` -- Production build
- `npx drizzle-kit generate` -- Generate migration from schema changes
- `npx drizzle-kit migrate` -- Apply migrations
- `/cleanup [branch-name]` -- Post-feature simplification pass (see .claude/commands/cleanup.md)

## Current Status
<!-- Update this section at the end of each work session -->
- [x] Initial project setup
- [x] Core flyer distribution flow
- [x] Stripe integration
- [x] Multiple industry landing pages
- [x] SEO and sitemap
- [ ] Testing infrastructure (not yet set up)
- [ ] Claude Code project structure (setting up now)
