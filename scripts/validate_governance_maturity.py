#!/usr/bin/env python3
"""Validate governance maturity scores from the generated report."""

from pathlib import Path
import re
import sys

sys.dont_write_bytecode = True

from governor_config import load_config, version_is_expired

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "docs" / "reports" / "GOVERNANCE_MATURITY_REPORT.md"
ROW_RE = re.compile(r"^\|\s*(?P<area>[^|]+)\|\s*(?P<score>\d)\s*\|\s*(?P<status>[^|]+)\|\s*(?P<target>[^|]+)\|")


def main():
    failures = []
    if not REPORT.exists():
        print("FAIL")
        print("- missing docs/reports/GOVERNANCE_MATURITY_REPORT.md")
        return 1
    current_version = load_config()["version"]
    rows = []
    for line in REPORT.read_text(encoding="utf-8").splitlines():
        match = ROW_RE.match(line)
        if match:
            rows.append(match.groupdict())
    if not rows:
        failures.append("maturity report missing score table")
    for row in rows:
        score = int(row["score"])
        target = row["target"].strip()
        if score < 4 and version_is_expired(target, current_version):
            failures.append(f"maturity area below threshold without future target: {row['area'].strip()} score {score}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
