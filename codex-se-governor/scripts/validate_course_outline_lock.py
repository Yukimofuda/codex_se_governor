#!/usr/bin/env python3
"""Validate that extracted course outline matches the accepted lock file."""

from pathlib import Path
import json
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
LOCK = ROOT / "docs" / "software-engineering" / "COURSE_OUTLINE_LOCK.json"


def load_outline():
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    result = subprocess.run([sys.executable, str(ROOT / "scripts" / "extract_course_outline.py")], cwd=ROOT, text=True, capture_output=True, check=False, env=env)
    if result.returncode != 0:
        return []
    return json.loads(result.stdout)


def main():
    if not LOCK.exists():
        print("FAIL")
        print("- missing docs/software-engineering/COURSE_OUTLINE_LOCK.json")
        return 1
    current = load_outline()
    locked = json.loads(LOCK.read_text(encoding="utf-8"))
    failures = []
    current_by_id = {item["section"]: item["title"] for item in current}
    locked_by_id = {item["section"]: item["title"] for item in locked}
    for section in sorted(set(locked_by_id) - set(current_by_id), key=lambda item: [int(part) for part in item.split(".")]):
        failures.append(f"section removed from extracted outline: {section} {locked_by_id[section]}")
    for section in sorted(set(current_by_id) - set(locked_by_id), key=lambda item: [int(part) for part in item.split(".")]):
        failures.append(f"section added to extracted outline: {section} {current_by_id[section]}")
    for section in sorted(set(current_by_id) & set(locked_by_id), key=lambda item: [int(part) for part in item.split(".")]):
        if current_by_id[section] != locked_by_id[section]:
            failures.append(f"section title changed: {section}: '{locked_by_id[section]}' -> '{current_by_id[section]}'")
    if failures:
        print("FAIL")
        for failure in failures[:80]:
            print(f"- {failure}")
        if len(failures) > 80:
            print(f"- ... {len(failures) - 80} more")
        print("- update COURSE_OUTLINE_LOCK.json intentionally if the course source changed")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
