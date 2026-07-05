#!/usr/bin/env python3
"""Validate release and maintenance documentation."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = {
    "CHANGELOG.md": ["Version history", "Upgrade path", "Rollback strategy"],
    "VERSIONING.md": ["Version history", "Deprecation process", "Adoption migration"],
    "MAINTENANCE_GUIDE.md": ["Baseline update process", "Course reference update process", "Support process", "Known limitations", "Rollback strategy"],
    "SUPPORT_RUNBOOK.md": ["Triage", "Monitoring method", "Rollback or release criteria", "Maintainer"],
    "DEPRECATION_POLICY.md": ["Deprecation process", "Upgrade path", "Baseline update process", "Adoption migration", "Known limitations", "Rollback strategy"],
}


def main():
    failures = []
    for filename, fields in DOCS.items():
        path = ROOT / filename
        if not path.exists():
            failures.append(f"missing maintenance doc: {filename}")
            continue
        text = path.read_text(encoding="utf-8").lower()
        for field in fields:
            if field.lower() not in text:
                failures.append(f"{filename} missing heading: {field}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
