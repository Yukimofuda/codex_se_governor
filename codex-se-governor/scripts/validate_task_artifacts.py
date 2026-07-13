#!/usr/bin/env python3
"""Validate generated task lifecycle artifacts when tasks are present."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
TASKS = ROOT / "tasks"
EXAMPLES = ROOT / "examples"
REQUIRED_FILES = [
    "REQUIREMENTS.md",
    "USER_STORY.md",
    "ANALYSIS.md",
    "DESIGN.md",
    "ADR.md",
    "TEST_PLAN.md",
    "TEST_CASE_MATRIX.md",
    "RISK_REGISTER.md",
    "SECURITY_REVIEW.md",
    "AI_USAGE_REVIEW.md",
    "PROCESS_COMPLIANCE_REPORT.md",
    "DEPLOYMENT_PLAN.md",
    "MAINTENANCE_TASK.md",
    "FINAL_REPORT.md",
]
REQ_RE = re.compile(r"\b(?:FR|NFR)-\d{3}\b")
AC_RE = re.compile(r"\bAC-\d{3}\b")


def task_dirs():
    targets = []
    if EXAMPLES.exists():
        targets.extend(sorted(path for path in EXAMPLES.glob("example_*_task") if path.is_dir()))
    if TASKS.exists():
        targets.extend(sorted(path for path in TASKS.iterdir() if path.is_dir() and not path.name.endswith("-smoke")))
    return targets


def read(path):
    return path.read_text(encoding="utf-8") if path.exists() else ""


def validate_task(task):
    failures = []
    for filename in REQUIRED_FILES:
        if not (task / filename).exists():
            failures.append(f"{task.relative_to(ROOT)} missing task artifact: {filename}")
    requirements = read(task / "REQUIREMENTS.md")
    matrix = read(task / "TEST_CASE_MATRIX.md")
    risk = read(task / "RISK_REGISTER.md").lower()
    ai = read(task / "AI_USAGE_REVIEW.md").lower()
    process = read(task / "PROCESS_COMPLIANCE_REPORT.md").lower()
    final = read(task / "FINAL_REPORT.md").lower()
    for requirement_id in sorted(set(REQ_RE.findall(requirements))):
        if requirement_id not in matrix:
            failures.append(f"{task.relative_to(ROOT)} requirement lacks test trace: {requirement_id}")
    for ac_id in sorted(set(AC_RE.findall(requirements))):
        if ac_id not in matrix and f"{ac_id}: not applicable" not in matrix:
            failures.append(f"{task.relative_to(ROOT)} acceptance criterion lacks test trace: {ac_id}")
    for field in ["mitigation", "contingency", "residual risk", "detection method", "review cadence"]:
        if field not in risk:
            failures.append(f"{task.relative_to(ROOT)} risk register missing: {field}")
    for field in ["ai tool used", "human review yes/no", "final human decision"]:
        if field not in ai:
            failures.append(f"{task.relative_to(ROOT)} AI review missing: {field}")
    for field in ["selected process model", "release cadence", "retrospective evidence"]:
        if field not in process:
            failures.append(f"{task.relative_to(ROOT)} process report missing: {field}")
    for field in ["rollback plan", "memory update suggestions"]:
        if field not in final:
            failures.append(f"{task.relative_to(ROOT)} final report missing: {field}")
    return failures


def main():
    failures = []
    tasks = task_dirs()
    if not tasks:
        print("PASS no task or example directories to validate")
        return 0
    for task in tasks:
        failures.extend(validate_task(task))
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
