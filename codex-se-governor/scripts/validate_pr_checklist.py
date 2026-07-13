#!/usr/bin/env python3
"""Validate that the pull request template covers lifecycle review areas."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PR = ROOT / ".github" / "pull_request_template.md"
REQUIRED = [
    "Requirement trace",
    "Analysis",
    "Design",
    "Implementation quality",
    "Testing",
    "Security",
    "AI Usage Review",
    "Documentation",
    "Risk",
    "Rollback",
]


def main():
    if not PR.exists():
        print("FAIL missing .github/pull_request_template.md")
        return 1
    text = PR.read_text(encoding="utf-8").lower()
    missing = [item for item in REQUIRED if item.lower() not in text]
    if missing:
        print("FAIL")
        for item in missing:
            print(f"- missing PR checklist item: {item}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
