---
description: "Execute a plan from specs/"
argument-hint: <spec-file-name>
model: opus
---

Execute an implementation plan step by step.

## Input
$ARGUMENTS

## Workflow

1. **Read** the plan from specs/$ARGUMENTS
2. **Read** CLAUDE.md for project conventions and current status
3. **Execute** each step in the plan sequentially:
   - For each step, follow the TDD sequence if specified (tests first via /tdd-design, then code via /tdd-build)
   - Run relevant checks after each step (tests, linter, type checker)
   - If a step fails, diagnose and fix before proceeding to the next step
4. After each major task, **check off** the corresponding acceptance criterion in the spec file (change `- [ ]` to `- [x]`)

## Validation (after all tasks complete)

5. Run the full check suite:
   - Tests passing
   - Linter clean (`npm run lint`)
   - Type checker clean (`npx tsc --noEmit`)
   - Build succeeds (`npm run build`)
6. Verify ALL acceptance criteria in the spec are checked off. If any remain unchecked that you cannot complete (e.g., manual deployment steps), note them in your report but do not block on them.

## Post-Implementation Workflow

7. **Simplify.** Run the code-simplifier on all files changed in this task. Remove unnecessary abstractions, collapse trivial wrappers, inline single-use variables, flatten overly nested logic. Do not simplify code that is complex for a documented reason.
8. **Validate again.** Re-run the full check suite after simplification.
9. **Review against lessons.** Read `docs/review-lessons.md` and verify each applicable item against the current changes. Fix any violations.
10. **Update lessons.** If you encountered a new failure pattern during this implementation, append it to `docs/review-lessons.md` with the date and context.

## Report

11. Report final status:
   - Files created/modified
   - Full check suite results
   - Spec acceptance criteria status (checked vs remaining manual steps)
   - Any new entries added to docs/review-lessons.md
   - Any deviations from the plan (and why)
   - Status: COMPLETE or BLOCKED (with reason)
