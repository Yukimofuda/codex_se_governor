#!/usr/bin/env python3
"""Validate required chapter document headings."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs" / "software-engineering"
REQUIRED_HEADINGS = [
    "Purpose",
    "Concepts from PDF",
    "Codex Rules",
    "Required Outputs",
    "Checklist",
    "Anti-patterns",
    "Enforcement",
]


def headings(text):
    result = set()
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("## "):
            result.add(stripped[3:].strip())
    return result


def main():
    failures = []
    for path in sorted(DOCS.glob("*.md")):
        if path.name == "18_TRACEABILITY_MATRIX.md":
            text = path.read_text(encoding="utf-8")
            for field in ["PDF Chapter", "Subtopic", "Engineering Meaning", "Codex Rule", "Project Artifact", "Enforcement Method", "Validation Status"]:
                if field not in text:
                    failures.append(f"{path.relative_to(ROOT)} missing matrix field: {field}")
            continue
        if path.name == "19_COURSE_SECTION_COVERAGE.md":
            text = path.read_text(encoding="utf-8")
            for field in ["Course Section", "Course Title", "Governor Coverage", "Artifact", "Enforcement", "Status"]:
                if field not in text:
                    failures.append(f"{path.relative_to(ROOT)} missing coverage field: {field}")
            continue
        if path.name == "20_COURSE_SEMANTIC_COVERAGE.md":
            text = path.read_text(encoding="utf-8")
            for field in ["Course sections covered", "Course concept", "Engineering meaning", "Codex rule", "Required artifact", "Enforcement method", "Coverage depth", "Validation evidence", "Remaining limitation"]:
                if field not in text:
                    failures.append(f"{path.relative_to(ROOT)} missing semantic coverage field: {field}")
            continue
        found = headings(path.read_text(encoding="utf-8"))
        for heading in REQUIRED_HEADINGS:
            if heading not in found:
                failures.append(f"{path.relative_to(ROOT)} missing heading: {heading}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
