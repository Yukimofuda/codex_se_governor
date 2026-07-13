#!/usr/bin/env python3
"""Validate the test strategy template against course testing concepts."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "templates" / "TEST_STRATEGY_TEMPLATE.md"
REQUIRED = [
    "Verification testing",
    "Defect testing",
    "Unit testing",
    "Integration testing",
    "System testing",
    "Acceptance testing",
    "Black-box testing",
    "White-box testing",
    "Equivalence partitioning",
    "Boundary testing",
    "Regression testing",
    "Statement coverage",
    "Branch coverage",
    "Condition coverage",
    "Path coverage",
    "Cyclomatic complexity",
    "TDD",
    "Mutation testing / mutation score",
    "Test oracle",
    "Pass/fail criteria",
]


def main():
    failures = []
    if not TEMPLATE.exists():
        failures.append("missing template: TEST_STRATEGY_TEMPLATE.md")
    else:
        text = TEMPLATE.read_text(encoding="utf-8").lower()
        for field in REQUIRED:
            if field.lower() not in text:
                failures.append(f"TEST_STRATEGY_TEMPLATE.md missing field: {field}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
