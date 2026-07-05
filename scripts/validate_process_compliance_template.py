#!/usr/bin/env python3
"""Validate process compliance report template."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "templates" / "PROCESS_COMPLIANCE_REPORT.md"
REQUIRED = [
    "selected process model",
    "requirement stability",
    "risk",
    "agile iteration evidence",
    "required documentation level",
    "test timing",
    "stakeholder feedback loop",
    "release cadence",
    "retrospective evidence",
]


def main():
    failures = []
    if not TEMPLATE.exists():
        failures.append("missing template: PROCESS_COMPLIANCE_REPORT.md")
    else:
        text = TEMPLATE.read_text(encoding="utf-8").lower()
        for field in REQUIRED:
            if field not in text:
                failures.append(f"PROCESS_COMPLIANCE_REPORT.md missing field: {field}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
