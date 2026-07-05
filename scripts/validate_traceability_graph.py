#!/usr/bin/env python3
"""Validate requirement, test, risk, security, and final-report graph links."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
EXAMPLES = ROOT / "examples"
REQ_RE = re.compile(r"\b(?:FR|NFR)-\d{3}\b")
AC_RE = re.compile(r"\bAC-\d{3}\b")
RISK_RE = re.compile(r"\bR-\d{3}\b")


def read(path):
    return path.read_text(encoding="utf-8") if path.exists() else ""


def validate_dir(path):
    failures = []
    req = read(path / "REQUIREMENTS.md")
    matrix = read(path / "TEST_CASE_MATRIX.md")
    risk = read(path / "RISK_REGISTER.md")
    security = read(path / "SECURITY_REVIEW.md")
    final = read(path / "FINAL_REPORT.md")
    combined_downstream = "\n".join([matrix, risk, security, final])
    for requirement_id in sorted(set(REQ_RE.findall(req))):
        if requirement_id not in combined_downstream:
            failures.append(f"{path.relative_to(ROOT)} requirement not linked downstream: {requirement_id}")
    for ac_id in sorted(set(AC_RE.findall(req))):
        if ac_id not in matrix and f"{ac_id}: not applicable" not in matrix:
            failures.append(f"{path.relative_to(ROOT)} acceptance criterion not linked to test: {ac_id}")
    risk_ids = sorted(set(RISK_RE.findall(risk)))
    for risk_id in risk_ids:
        if risk_id not in security and risk_id not in final and risk_id not in matrix:
            failures.append(f"{path.relative_to(ROOT)} risk not linked to security, test, or final report: {risk_id}")
    if "rollback" not in final.lower():
        failures.append(f"{path.relative_to(ROOT)} final report lacks rollback link")
    return failures


def main():
    targets = sorted(path for path in EXAMPLES.glob("example_*_task") if path.is_dir())
    tasks = ROOT / "tasks"
    if tasks.exists():
        targets.extend(sorted(path for path in tasks.iterdir() if path.is_dir() and not path.name.endswith("-smoke")))
    failures = []
    for target in targets:
        if not target.exists():
            failures.append(f"missing traceability target: {target.relative_to(ROOT)}")
            continue
        failures.extend(validate_dir(target))
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
