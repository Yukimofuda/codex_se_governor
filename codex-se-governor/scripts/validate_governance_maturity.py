#!/usr/bin/env python3
"""Validate capability maturity report structure and numeric gates."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "docs" / "reports" / "GOVERNANCE_MATURITY_REPORT.md"
ROW_RE = re.compile(r"^\|\s*(?P<area>[^|]+)\|\s*(?P<score>[1-5]|unknown)\s*\|\s*(?P<status>PASS|FAIL|UNKNOWN)\s*\|")


def main():
    failures = []
    if not REPORT.exists():
        print("FAIL")
        print("- missing docs/reports/GOVERNANCE_MATURITY_REPORT.md")
        return 1
    text = REPORT.read_text(encoding="utf-8")
    for heading in ["Governor Capability Maturity Report", "Governor Capability Maturity", "Adoption Readiness", "Active Task And Package Maturity", "Unavailable Evidence"]:
        if heading not in text:
            failures.append(f"maturity report missing section: {heading}")
    rows = [match.groupdict() for line in text.splitlines() if (match := ROW_RE.match(line))]
    if len(rows) < 10:
        failures.append("maturity report missing capability/readiness/package rows")
    for row in rows:
        if row["score"].isdigit() and int(row["score"]) < 4:
            failures.append(f"capability below maturity threshold: {row['area'].strip()} score {row['score']}")
        if row["score"] == "unknown" and row["status"] != "UNKNOWN":
            failures.append(f"unknown maturity must use UNKNOWN status: {row['area'].strip()}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
