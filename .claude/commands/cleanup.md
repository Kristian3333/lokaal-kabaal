---
description: Post-feature cleanup -- simplify changed files, run checks, review against lessons
argument-hint: <branch-name or leave blank for current branch>
model: opus
---

# Post-Feature Cleanup

Run a simplification and review pass on all files changed in a feature branch.

## Step 1 -- Identify changed files

If $ARGUMENTS is provided, diff against that branch:
```
git diff --name-only main..$ARGUMENTS -- '*.ts' '*.tsx' '*.js' '*.jsx'
```

If no argument, diff the current branch against main:
```
git diff --name-only main..HEAD -- '*.ts' '*.tsx' '*.js' '*.jsx'
```

Exclude generated files, type declarations, config files, and anything in node_modules, .next, drizzle/generated, or dist/.

## Step 2 -- Order by dependency layer

Sort the changed files into phases. Process them in this order:
1. Utilities, helpers, and library code (lib/)
2. Components (components/)
3. Pages, routes, API handlers (app/)

Within each phase, process files alphabetically.

## Step 3 -- Simplify each file

For each file, apply these simplifications where applicable:
- Remove unnecessary abstractions and wrapper functions that add indirection without value
- Collapse trivial wrapper functions into their callers
- Inline variables that are used only once and whose name adds no clarity
- Flatten unnecessarily nested conditionals (early returns instead of deep if/else)
- Remove dead code paths, unused imports, and commented-out code
- Simplify overly verbose type annotations where TypeScript can infer them
- Remove leftover `console.log` statements

Do NOT simplify:
- Code that handles documented edge cases
- Performance-critical sections with comments explaining why they're written that way
- Code that is complex because the domain is complex (not because the implementation is messy)

## Step 4 -- Validate after each phase

After completing each phase, run the full check suite:
1. Type checking: `npx tsc --noEmit`
2. Linting: `npm run lint`
3. Build: `npm run build`

If any check fails, fix the issue before moving to the next phase. If a simplification caused the failure, revert that specific change and move on.

## Step 5 -- Review against lessons

Read `docs/review-lessons.md`. For each lesson that applies to the changed files, verify the code does not violate it. Fix any violations found.

## Step 6 -- Report

When finished, output:
- Total files processed
- Summary of changes per phase
- Any files where simplification was reverted due to check failures
- Any review-lessons violations found and fixed
- Final check suite status: PASS or FAIL
