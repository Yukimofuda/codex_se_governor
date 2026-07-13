#!/usr/bin/env python3
"""Validate mutation testing planning template."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "templates" / "MUTATION_TESTING_PLAN.md"
REQUIRED = [
    "Mutation scope",
    "Mutation tool or manual approach",
    "Mutation score target",
    "Equivalent mutants",
    "Surviving mutants",
    "Test improvement action",
    "Risk accepted",
    "Owner",
    "Review cadence",
]


def main():
    failures = []
    if not TEMPLATE.exists():
        failures.append("missing templates/MUTATION_TESTING_PLAN.md")
    else:
        text = TEMPLATE.read_text(encoding="utf-8").lower()
        for field in REQUIRED:
            if field.lower() not in text:
                failures.append(f"MUTATION_TESTING_PLAN.md missing field: {field}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
