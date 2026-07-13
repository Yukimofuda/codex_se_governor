#!/usr/bin/env python3
"""Validate AI usage review evidence in templates and PR checklist."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    ROOT / "templates" / "AI_USAGE_REVIEW_TEMPLATE.md",
    ROOT / ".github" / "pull_request_template.md",
    ROOT / "examples" / "example_feature_task" / "AI_USAGE_REVIEW.md",
]
REQUIRED = [
    "AI tool used",
    "AI-generated code yes/no",
    "Human review yes/no",
    "Security-sensitive areas",
    "Privacy-sensitive areas",
    "IP/license risk",
    "Bias/fairness risk",
    "Hallucination risk",
    "Tests added",
    "Final human decision",
]


def main():
    failures = []
    for path in FILES:
        if not path.exists():
            failures.append(f"missing AI review artifact: {path.relative_to(ROOT)}")
            continue
        text = path.read_text(encoding="utf-8").lower()
        for field in REQUIRED:
            if field.lower() not in text:
                failures.append(f"{path.relative_to(ROOT)} missing field: {field}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
