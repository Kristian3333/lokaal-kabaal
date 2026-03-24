---
description: "Review recent changes for security, quality, and test coverage"
argument-hint: <optional: specific files or area to review>
model: opus
disallowed-tools: Write, Edit
---

Review the recent changes in this codebase. You may only read -- do not modify anything.

## Input
$ARGUMENTS

If no specific area given, review `git diff HEAD~1` or recent uncommitted changes.

## Review Checklist

### Security
- [ ] No hardcoded secrets, keys, or credentials
- [ ] All external input is validated and sanitized
- [ ] No SQL injection vectors (Drizzle parameterized queries used correctly)
- [ ] No command injection vectors
- [ ] Authentication/authorization on all protected endpoints
- [ ] No sensitive data in logs
- [ ] Dependencies pinned to exact versions
- [ ] Stripe webhook signatures verified
- [ ] No client-side exposure of server secrets

### Test Coverage
- [ ] Every new public function has tests
- [ ] Tests cover happy path, edge cases, and error cases
- [ ] Tests are deterministic and independent
- [ ] No tests were modified to pass (TDD violation check)
- [ ] Coverage target (90%) maintained

### Code Quality
- [ ] Type hints on all function signatures (no `any` types)
- [ ] No broad exception handlers
- [ ] No dead code or commented-out code
- [ ] Functions are short and single-purpose
- [ ] Error handling is explicit
- [ ] Linter and type checker pass clean
- [ ] No `console.log` left in production code

### Scalability
- [ ] No in-memory-only state that prevents horizontal scaling
- [ ] Connection pooling for Neon configured correctly
- [ ] Pagination on list endpoints
- [ ] Appropriate database indexes

### Review Lessons Check
Read `docs/review-lessons.md` and verify each applicable item against the current changes. This file contains project-specific checks learned from past mistakes. Any violation found here is a critical issue.

## Output
- PASS or FAIL with severity (critical / warning / info)
- Specific issues with file paths and line numbers
- Review-lessons violations (if any), referencing the specific lesson
- Recommended fixes for each issue
