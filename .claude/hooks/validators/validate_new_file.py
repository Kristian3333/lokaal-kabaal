#!/usr/bin/env python3
"""
Validation hook: checks that newly created files follow project conventions.
Run this as part of the task validation pipeline.

Usage: python3 validate_new_file.py <filepath>
Exit code 0 = pass, exit code 1 = fail (prints issues to stderr)
"""

import sys
import os


def validate_python_file(filepath: str, content: str) -> list[str]:
    """Check Python file conventions."""
    issues = []
    lines = content.split("\n")

    # Check for module docstring
    stripped = content.lstrip()
    if not (stripped.startswith('"""') or stripped.startswith("'''")):
        issues.append(f"{filepath}: missing module-level docstring")

    # Check for type hints on function definitions
    for i, line in enumerate(lines, 1):
        stripped_line = line.strip()
        if stripped_line.startswith("def ") and "-> " not in stripped_line:
            issues.append(f"{filepath}:{i}: function missing return type hint: {stripped_line[:60]}")

    # Check for broad exception handlers
    for i, line in enumerate(lines, 1):
        stripped_line = line.strip()
        if stripped_line == "except:" or stripped_line == "except Exception:":
            issues.append(f"{filepath}:{i}: broad exception handler (catch specific exceptions)")

    # Check for hardcoded secrets patterns
    secret_patterns = ["api_key =", "api_secret =", "password =", "token =", "secret ="]
    for i, line in enumerate(lines, 1):
        lower_line = line.lower().strip()
        for pattern in secret_patterns:
            if pattern in lower_line and not lower_line.startswith("#"):
                issues.append(f"{filepath}:{i}: possible hardcoded secret: {line.strip()[:60]}")

    return issues


def validate_typescript_file(filepath: str, content: str) -> list[str]:
    """Check TypeScript/JavaScript file conventions."""
    issues = []
    lines = content.split("\n")

    # Check for console.log left in (common mistake)
    for i, line in enumerate(lines, 1):
        stripped_line = line.strip()
        if "console.log(" in stripped_line and not stripped_line.startswith("//"):
            issues.append(f"{filepath}:{i}: console.log left in code (use proper logging)")

    # Check for any type usage
    for i, line in enumerate(lines, 1):
        if ": any" in line or "<any>" in line or "as any" in line:
            issues.append(f"{filepath}:{i}: 'any' type used (use specific types)")

    return issues


def validate_file(filepath: str) -> list[str]:
    """Validate a single file based on its extension."""
    if not os.path.exists(filepath):
        return [f"{filepath}: file does not exist"]

    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    issues = []

    # Check file is not empty
    if not content.strip():
        return [f"{filepath}: file is empty"]

    # Check no TODO comments (should be tracked as issues)
    lines = content.split("\n")
    for i, line in enumerate(lines, 1):
        if "TODO" in line and not line.strip().startswith("#!"):
            issues.append(f"{filepath}:{i}: TODO comment found (track as issue instead)")

    # Language-specific checks
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".py":
        issues.extend(validate_python_file(filepath, content))
    elif ext in (".ts", ".tsx", ".js", ".jsx"):
        issues.extend(validate_typescript_file(filepath, content))

    return issues


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 validate_new_file.py <filepath> [filepath2 ...]", file=sys.stderr)
        sys.exit(1)

    all_issues = []
    for filepath in sys.argv[1:]:
        all_issues.extend(validate_file(filepath))

    if all_issues:
        print("Validation FAILED:", file=sys.stderr)
        for issue in all_issues:
            print(f"  - {issue}", file=sys.stderr)
        sys.exit(1)
    else:
        print("Validation PASSED")
        sys.exit(0)
