#!/usr/bin/env python3
"""Validate numbered course sections are mapped to governor artifacts."""

from pathlib import Path
import json
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
COVERAGE = ROOT / "docs" / "software-engineering" / "19_COURSE_SECTION_COVERAGE.md"
TRACEABILITY = ROOT / "docs" / "software-engineering" / "18_TRACEABILITY_MATRIX.md"
SEMANTIC = ROOT / "docs" / "software-engineering" / "20_COURSE_SEMANTIC_COVERAGE.md"


def load_outline():
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    result = subprocess.run([sys.executable, str(ROOT / "scripts" / "extract_course_outline.py")], cwd=ROOT, text=True, capture_output=True, check=False, env=env)
    if result.returncode != 0:
        return []
    return json.loads(result.stdout)


def main():
    failures = []
    if not COVERAGE.exists():
        failures.append("missing docs/software-engineering/19_COURSE_SECTION_COVERAGE.md")
        coverage_text = ""
    else:
        coverage_text = COVERAGE.read_text(encoding="utf-8")
    trace_text = TRACEABILITY.read_text(encoding="utf-8") if TRACEABILITY.exists() else ""
    combined = coverage_text + "\n" + trace_text
    for section in load_outline():
        token = f"| {section['section']} |"
        if token not in combined:
            failures.append(f"missing course section coverage: {section['section']} {section['title']}")
    for field in ["Course Section", "Course Title", "Governor Coverage", "Artifact", "Enforcement", "Status"]:
        if field not in coverage_text:
            failures.append(f"coverage document missing field: {field}")
    if not SEMANTIC.exists():
        failures.append("missing docs/software-engineering/20_COURSE_SEMANTIC_COVERAGE.md")
    else:
        semantic_text = SEMANTIC.read_text(encoding="utf-8")
        for field in ["Course sections covered", "Course concept", "Engineering meaning", "Codex rule", "Required artifact", "Enforcement method", "Coverage depth", "Validation evidence", "Remaining limitation"]:
            if field not in semantic_text:
                failures.append(f"semantic coverage document missing field: {field}")
        env = os.environ.copy()
        env["PYTHONDONTWRITEBYTECODE"] = "1"
        semantic_result = subprocess.run([sys.executable, str(ROOT / "scripts" / "validate_course_semantic_coverage.py")], cwd=ROOT, text=True, capture_output=True, check=False, env=env)
        if semantic_result.returncode != 0:
            failures.append("semantic course coverage validation failed")
    if failures:
        print("FAIL")
        for failure in failures[:80]:
            print(f"- {failure}")
        if len(failures) > 80:
            print(f"- ... {len(failures) - 80} more")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
