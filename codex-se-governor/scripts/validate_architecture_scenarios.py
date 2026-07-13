#!/usr/bin/env python3
"""Validate architecture scenario template and architecture scenario linkage."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "templates" / "ARCHITECTURE_SCENARIO_TEMPLATE.md"
VIEW_DOC = ROOT / "docs" / "architecture" / "4_PLUS_1_VIEW.md"
REQUIRED = [
    "Scenario ID",
    "Quality attribute",
    "Stimulus",
    "Environment",
    "Response",
    "Response measure",
    "Architecture view",
    "Test evidence",
    "Risk",
    "Trade-off",
]


def main():
    failures = []
    if not TEMPLATE.exists():
        failures.append("missing template: ARCHITECTURE_SCENARIO_TEMPLATE.md")
    else:
        text = TEMPLATE.read_text(encoding="utf-8").lower()
        for field in REQUIRED:
            if field.lower() not in text:
                failures.append(f"ARCHITECTURE_SCENARIO_TEMPLATE.md missing field: {field}")
    if not VIEW_DOC.exists():
        failures.append("missing architecture doc: docs/architecture/4_PLUS_1_VIEW.md")
    else:
        view_text = VIEW_DOC.read_text(encoding="utf-8").lower()
        if "architecture_scenario_template.md" not in view_text:
            failures.append("4_PLUS_1_VIEW.md does not link architecture scenario template")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
