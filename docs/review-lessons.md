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
<!-- Example: Every endpoint returning a list MUST have pagination (skip/take or cursor) -- caught: YYYY-MM-DD, [context] -->

## State Management
<!-- Example: Context providers must not trigger full-tree re-renders -- check for memoization -- caught: YYYY-MM-DD, [context] -->

## Database / ORM
<!-- Example: Every new foreign key must have an index in Drizzle schema -- caught: YYYY-MM-DD, [context] -->

## Component Patterns
<!-- Example: Forms must disable submit during async operations (isLoading guard) -- caught: YYYY-MM-DD, [context] -->

## Error Handling
<!-- Example: API error responses must not leak internal details (stack traces, DB errors) -- caught: YYYY-MM-DD, [context] -->

## Security
<!-- Example: Stripe webhook endpoints must verify signatures -- caught: YYYY-MM-DD, [context] -->

## Testing
<!-- Example: Mocked dependencies must be reset between tests (afterEach cleanup) -- caught: YYYY-MM-DD, [context] -->

## Performance
<!-- Example: Images must use next/image with dimensions -- caught: YYYY-MM-DD, [context] -->

## External Integrations
<!-- Example: PrintOne API calls must handle rate limits and retry with backoff -- caught: YYYY-MM-DD, [context] -->
