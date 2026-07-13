#!/usr/bin/env python3
"""Validate example requirement-to-test traceability."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
REQ = ROOT / "examples" / "example_feature_task" / "REQUIREMENTS.md"
MATRIX = ROOT / "examples" / "example_feature_task" / "TEST_CASE_MATRIX.md"
TEMPLATE = ROOT / "templates" / "TEST_CASE_MATRIX.md"
ID_RE = re.compile(r"\b(?:FR|NFR)-\d{3}\b")
AC_RE = re.compile(r"\bAC-\d{3}\b")


def table_rows(path):
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("|---") or "Test ID" in line:
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) >= 8:
            rows.append(cells)
    return rows


def main():
    failures = []
    for path in [REQ, MATRIX, TEMPLATE]:
        if not path.exists():
            failures.append(f"missing traceability artifact: {path.relative_to(ROOT)}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    req_text = REQ.read_text(encoding="utf-8")
    matrix_text = MATRIX.read_text(encoding="utf-8")
    requirement_ids = sorted(set(ID_RE.findall(req_text)))
    ac_ids = sorted(set(AC_RE.findall(req_text)))
    rows = table_rows(MATRIX)
    for requirement_id in requirement_ids:
        if requirement_id not in matrix_text:
            failures.append(f"requirement without test case: {requirement_id}")
    for ac_id in ac_ids:
        if ac_id not in matrix_text and f"{ac_id}: not applicable" not in matrix_text:
            failures.append(f"acceptance criterion without test case or justification: {ac_id}")
    for index, cells in enumerate(rows, start=1):
        labels = ["Test ID", "Requirement ID", "Test Type", "Input", "Expected Output", "Reason", "Coverage", "Status"]
        for label, value in zip(labels, cells[:8]):
            if not value:
                failures.append(f"test row {index} missing {label}")
    security_requirements = [line for line in req_text.splitlines() if ID_RE.search(line) and any(term in line.lower() for term in ["security", "audit", "generic", "brute-force"])]
    if security_requirements and "security" not in matrix_text.lower():
        failures.append("security-sensitive requirements lack security test")
    if "failure" not in matrix_text.lower():
        failures.append("failure modes lack failure-path test")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
