#!/usr/bin/env python3
"""
Validation hook: checks that a file contains required content.
Useful for verifying plans have all required sections, or that
generated files include mandatory elements.

Usage: python3 validate_file_contains.py <filepath> <required_string> [required_string2 ...]
Exit code 0 = all strings found, exit code 1 = missing strings (prints to stderr)

Examples:
  # Check a plan has required sections
  python3 validate_file_contains.py specs/plan.md "## Objective" "## Acceptance criteria" "## Risks"

  # Check a test file has setup/teardown
  python3 validate_file_contains.py tests/test_auth.py "def setup" "def teardown"
"""

import sys
import os


def check_file_contains(filepath: str, required_strings: list[str]) -> list[str]:
    """Check that a file contains all required strings."""
    if not os.path.exists(filepath):
        return [f"File does not exist: {filepath}"]

    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    missing = []
    for required in required_strings:
        if required not in content:
            missing.append(f"Missing required content: '{required}'")

    return missing


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(
            "Usage: python3 validate_file_contains.py <filepath> <required> [required2 ...]",
            file=sys.stderr,
        )
        sys.exit(1)

    filepath = sys.argv[1]
    required_strings = sys.argv[2:]

    issues = check_file_contains(filepath, required_strings)

    if issues:
        print(f"Validation FAILED for {filepath}:", file=sys.stderr)
        for issue in issues:
            print(f"  - {issue}", file=sys.stderr)
        sys.exit(1)
    else:
        print(f"Validation PASSED: {filepath} contains all {len(required_strings)} required elements")
        sys.exit(0)
