#!/usr/bin/env python3
"""Validate scored AI review evidence."""

from pathlib import Path
import json
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
MIN_SCORE = 8


def main():
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "ai_review_score.py")],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
        env=env,
    )
    if result.returncode != 0:
        print("FAIL")
        print("- ai_review_score.py failed")
        return result.returncode
    rows = json.loads(result.stdout)
    failures = []
    if not rows:
        failures.append("no AI review evidence files found")
    for row in rows:
        if row["score"] < MIN_SCORE:
            failures.append(f"{row['path']} AI review score below {MIN_SCORE}: {row['score']}/{row['max_score']}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
