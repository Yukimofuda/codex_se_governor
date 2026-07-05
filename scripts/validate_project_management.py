#!/usr/bin/env python3
"""Validate concrete project-management governance evidence."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = [
    ROOT / "docs" / "project-management" / "ROADMAP.md",
    ROOT / "docs" / "project-management" / "MILESTONES.md",
    ROOT / "docs" / "project-management" / "RELEASE_PLAN.md",
    ROOT / "docs" / "project-management" / "RISK_REGISTER.md",
]
REQUIRED = ["version", "milestone", "deliverables", "owner", "monitoring", "risk", "rollback", "future"]
EVIDENCE_TERMS = ["target date", "cadence", "acceptance", "release criteria", "rollback criteria", "risk link"]


def has_concrete_evidence(text):
    lines = [line.strip() for line in text.splitlines()]
    table_rows = [line for line in lines if line.startswith("| ") and not line.startswith("|---")]
    bullets = [line for line in lines if line.startswith("- ") and ":" in line and len(line.split(":", 1)[1].strip()) > 2]
    return len(table_rows) >= 2 or len(bullets) >= 4


def main():
    failures = []
    for path in DOCS:
        if not path.exists():
            failures.append(f"missing project-management doc: {path.relative_to(ROOT)}")
            continue
        text = path.read_text(encoding="utf-8").lower()
        for field in REQUIRED:
            if field not in text:
                failures.append(f"{path.relative_to(ROOT)} missing concept: {field}")
        if not has_concrete_evidence(path.read_text(encoding="utf-8")):
            failures.append(f"{path.relative_to(ROOT)} lacks concrete rows or filled bullets")
    combined = "\n".join(path.read_text(encoding="utf-8").lower() for path in DOCS if path.exists())
    for term in EVIDENCE_TERMS:
        if term not in combined:
            failures.append(f"project management evidence missing: {term}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
