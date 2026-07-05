#!/usr/bin/env python3
"""Validate Python function complexity against a baseline."""

from pathlib import Path
import json
import os
import subprocess
import sys

sys.dont_write_bytecode = True

from governor_config import load_config, version_is_expired

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / "docs" / "quality" / "COMPLEXITY_BASELINE.md"
THRESHOLD = 12
REQUIRED_FIELDS = [
    "Path",
    "Function",
    "Complexity",
    "Status",
    "Owner",
    "Rationale",
    "Refactoring/test obligation",
    "Review date",
    "Target version",
    "Issue or follow-up ID",
    "Trend",
]
VALID_STATUSES = {"accepted", "needs-refactor", "fixed", "temporary-exception"}
VALID_TRENDS = {"improving", "stable", "worsening", "new"}


def baseline_entries():
    if not BASELINE.exists():
        return {}, ["missing docs/quality/COMPLEXITY_BASELINE.md"]
    text = BASELINE.read_text(encoding="utf-8")
    failures = [f"baseline missing field: {field}" for field in REQUIRED_FIELDS if field not in text]
    entries = {}
    for line in text.splitlines():
        if not line.startswith("| ") or line.startswith("|---") or "Path" in line:
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) >= len(REQUIRED_FIELDS):
            path, function, complexity, status, owner, rationale, obligation, review_date, target_version, issue, trend = cells[:11]
            if not all([path, function, complexity, status, owner, rationale, obligation, review_date, target_version, issue, trend]):
                failures.append(f"incomplete complexity baseline entry: {path}::{function}")
            entries[(path, function)] = cells
    return entries, failures


def main():
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    result = subprocess.run([sys.executable, str(ROOT / "scripts" / "complexity_report.py")], cwd=ROOT, text=True, capture_output=True, check=False, env=env)
    if result.returncode != 0:
        print("FAIL")
        print("- complexity_report.py failed")
        return result.returncode
    rows = json.loads(result.stdout)
    entries, failures = baseline_entries()
    for row in rows:
        if row.get("complexity", 0) <= THRESHOLD:
            continue
        key = (row["file"], row["function"])
        entry = entries.get(key)
        if not entry:
            failures.append(f"unbaselined complexity threshold violation: {row['file']}::{row['function']} complexity {row['complexity']}")
            continue
        status = entry[3].lower()
        if status not in VALID_STATUSES:
            failures.append(f"invalid complexity baseline status for {row['file']}::{row['function']}: {entry[3]}")
        if entry[10] not in VALID_TRENDS:
            failures.append(f"invalid complexity trend for {row['file']}::{row['function']}: {entry[10]}")
        if row.get("complexity", 0) > 20 and status != "temporary-exception":
            failures.append(f"complexity over 20 requires temporary-exception: {row['file']}::{row['function']}")
        if status == "temporary-exception" and version_is_expired(entry[8], load_config()["version"]):
            failures.append(f"expired temporary complexity exception: {row['file']}::{row['function']}")
        if row.get("complexity", 0) > 20 and "refactor" not in entry[6].lower():
            failures.append(f"complexity over 20 lacks explicit refactoring obligation: {row['file']}::{row['function']}")
        if entry[10] == "worsening" and version_is_expired(entry[8], load_config()["version"]):
            failures.append(f"worsening complexity trend not allowed: {row['file']}::{row['function']}")
        if "test" not in entry[6].lower():
            failures.append(f"complexity exception lacks test obligation: {row['file']}::{row['function']}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
