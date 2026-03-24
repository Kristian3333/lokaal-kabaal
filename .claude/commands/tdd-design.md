---
description: "Design tests first from a specification (Step 1 of TDD)"
argument-hint: <feature description or spec file>
model: opus
disallowed-tools: Write(app/*), Write(components/*), Write(lib/*), Edit(app/*), Edit(components/*), Edit(lib/*)
---

You are designing tests for a feature. You may ONLY create or modify files
in the tests/ directory. You are explicitly forbidden from touching app/, components/, or lib/.

## Strict TDD -- Step 1: Design Tests

### Input
$ARGUMENTS

### Workflow

1. **Understand** the feature specification completely
2. **Read** existing code in app/, components/, lib/ to understand interfaces, types, and patterns
3. **Edge Case Analysis** (mandatory, before writing any test code)

   Produce a written edge case analysis covering each level below. Document this
   analysis as a comment block at the top of the main test file, or as a section
   in the spec file. Do not skip this step; without it the test suite will have
   blind spots.

   **Level 1 -- Input boundaries**
   For every function parameter and API field, ask:
   - What happens with null/undefined/missing values?
   - What happens with empty values (empty string, empty array, empty object)?
   - What happens at the minimum and maximum of valid ranges (0, 1, MAX_INT, negative numbers)?
   - What happens with type mismatches (string where number expected, object where array expected)?
   - What happens with special characters, unicode, emoji, extremely long strings?
   - What happens with duplicate values where uniqueness is assumed?

   **Level 2 -- State and lifecycle**
   For every stateful operation, ask:
   - What happens if called before initialization / after cleanup?
   - What happens if called twice in a row (idempotency)?
   - What happens during concurrent access (two users, two requests, two tabs)?
   - What happens with stale or expired data (cached values, expired tokens, outdated references)?
   - What happens during partial completion (operation succeeds halfway, then fails)?
   - What happens if dependent state was deleted or modified between read and write?

   **Level 3 -- Integration and environment**
   For every external dependency (Stripe, PrintOne, Anthropic, Neon, Resend), ask:
   - What happens on timeout?
   - What happens on partial response (some fields missing, truncated payload)?
   - What happens on rate limiting (429)?
   - What happens on auth expiration mid-operation?
   - What happens when the dependency returns valid but unexpected data (extra fields, different types, deprecated format)?
   - What happens with network partition (request sent, no response ever)?

   **Level 4 -- Business logic and domain**
   For every business rule or domain constraint, ask:
   - What is the most unusual combination of valid inputs? Test it.
   - What are the boundary transitions in any state machine? Test every edge that crosses a boundary.
   - What permissions or roles change the behavior? Test the boundaries of each role.
   - What happens at temporal boundaries (midnight, timezone changes, daylight saving, end of month)?
   - What happens with the "just barely invalid" case (one character too long, one cent over budget)?
   - Are there ordering assumptions? What if events arrive out of order?

   **Level 5 -- Failure modes and recovery**
   For every operation that can fail, ask:
   - Does the system leave behind partial state on failure? (Dangling records, orphaned files, half-written transactions)
   - Can the operation be retried safely? What happens on double-retry?
   - What does the error message reveal? (No stack traces to users, no internal IDs leaked)
   - What happens when the error handler itself fails?
   - Is cleanup/rollback triggered, and is that cleanup itself safe to fail?

   **Output of this step:** A written list of identified edge cases grouped by level.
   Each entry should note whether it will be tested, and if not, why not.

4. **Design** comprehensive tests informed by the analysis above
5. **Write** all tests to the appropriate files in tests/
6. **Verify** tests are syntactically valid by running them (they should FAIL -- the code doesn't exist yet)
7. **Report** what you wrote and the expected failure count

### Test Quality Checklist
- [ ] Edge case analysis document produced and included before test code
- [ ] Every test has a descriptive name: test_[function]_[scenario]_[expected]
- [ ] Tests are independent -- no shared mutable state between tests
- [ ] Tests are deterministic -- no randomness, no timing dependencies
- [ ] Setup and teardown are explicit
- [ ] Assertions are specific (not just "assert result is not None")
- [ ] Both positive and negative cases are covered
- [ ] Each level of the edge case analysis is represented in the test suite (or explicitly marked N/A)

### Output
- Edge case analysis document (grouped by level)
- List of test files created/modified
- Number of tests written
- Summary of what each test group covers
- Confirmation that all tests FAIL (proving they're testing real behavior)

DO NOT write any implementation code. Tests only.
