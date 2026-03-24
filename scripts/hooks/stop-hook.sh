#!/bin/bash
# Stop hook: agent cannot finish if tasks remain or checks fail
#
# Design: This hook checks TODO.md (universal task tracker) and code quality gates.
# Spec acceptance criteria are NOT checked here -- those are tracked by /build and
# /team-build commands, which update their own spec files.
#
# Active gates for lokaalkabaal (Next.js / TypeScript):
#   1. TODO items
#   2. Tests (npm test)
#   3. Type checking (tsc --noEmit)
#   4. Linting (npm run lint)
#   5. Build (npm run build)

INPUT=$(cat)

# --- Gate 1: Incomplete TODO items ---
if [ -f "TODO.md" ]; then
    REMAINING=$(grep -c "^\- \[ \]" TODO.md 2>/dev/null || echo "0")
    if [ "$REMAINING" -gt "0" ]; then
        echo "There are still $REMAINING uncompleted tasks in TODO.md. Continue working on the next unchecked item." >&2
        exit 2
    fi
fi

# --- Gate 2: Tests ---
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    TEST_RESULT=$(npm test 2>&1)
    TEST_EXIT=$?
    if [ "$TEST_EXIT" -ne 0 ]; then
        echo "Tests are failing. Fix these before finishing:" >&2
        echo "$TEST_RESULT" | tail -30 >&2
        exit 2
    fi
fi

# --- Gate 3: Type checking ---
if [ -f "tsconfig.json" ] && [ -d "node_modules/typescript" ]; then
    echo "Running type check..." >&2
    TS_RESULT=$(node node_modules/typescript/bin/tsc --noEmit 2>&1)
    if [ $? -ne 0 ]; then
        echo "Type check failed. Fix type errors before finishing:" >&2
        echo "$TS_RESULT" | tail -20 >&2
        exit 2
    fi
fi

# --- Gate 4: Linting ---
if [ -f "package.json" ] && grep -q '"lint"' package.json; then
    echo "Running linter..." >&2
    LINT_RESULT=$(npm run lint 2>&1)
    if [ $? -ne 0 ]; then
        echo "Lint check failed. Fix lint errors before finishing:" >&2
        echo "$LINT_RESULT" | tail -20 >&2
        exit 2
    fi
fi

# --- Gate 5: Build ---
if [ -f "package.json" ] && grep -q '"build"' package.json; then
    echo "Running build..." >&2
    BUILD_RESULT=$(npm run build 2>&1)
    if [ $? -ne 0 ]; then
        echo "Build failed. Fix build errors before finishing:" >&2
        echo "$BUILD_RESULT" | tail -20 >&2
        exit 2
    fi
fi

# All gates passed
exit 0
