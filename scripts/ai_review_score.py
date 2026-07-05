#!/usr/bin/env python3
"""Score AI usage review evidence for examples and generated tasks."""

from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
FIELDS = [
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


def review_files():
    files = sorted((ROOT / "examples").glob("example_*_task/AI_USAGE_REVIEW.md"))
    tasks = ROOT / "tasks"
    if tasks.exists():
        files.extend(sorted(tasks.glob("*/AI_USAGE_REVIEW.md")))
    return [path for path in files if path.exists()]


def score(path):
    text = path.read_text(encoding="utf-8").lower()
    present = [field for field in FIELDS if field.lower() in text]
    return {
        "path": str(path.relative_to(ROOT)),
        "score": len(present),
        "max_score": len(FIELDS),
        "missing": [field for field in FIELDS if field not in present],
    }


def main():
    rows = [score(path) for path in review_files()]
    print(json.dumps(rows, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
