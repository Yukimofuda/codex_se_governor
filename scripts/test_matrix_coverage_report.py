#!/usr/bin/env python3
"""Check that test matrix artifacts represent required test categories."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
MATRIX_PATHS = [ROOT / "templates" / "TEST_CASE_MATRIX.md"]
MATRIX_PATHS.extend(sorted((ROOT / "examples").glob("**/TEST_CASE_MATRIX.md")))
REQUIRED = {
    "normal": ["normal", "happy path", "valid"],
    "boundary": ["boundary", "edge"],
    "invalid": ["invalid", "error"],
    "security": ["security", "auth", "authorization", "threat"],
    "regression": ["regression"],
}


def represented_categories(text):
    lowered = text.lower()
    return {name for name, terms in REQUIRED.items() if any(term in lowered for term in terms)}


def main():
    failures = []
    for path in MATRIX_PATHS:
        if not path.exists():
            failures.append(f"missing test matrix: {path.relative_to(ROOT)}")
            continue
        found = represented_categories(path.read_text(encoding="utf-8"))
        missing = sorted(set(REQUIRED) - found)
        if missing:
            failures.append(f"{path.relative_to(ROOT)} missing categories: {', '.join(missing)}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
