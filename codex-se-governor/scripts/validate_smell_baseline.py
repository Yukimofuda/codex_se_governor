#!/usr/bin/env python3
"""Validate that current smell warnings are triaged in the baseline."""

from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / "docs" / "quality" / "SMELL_BASELINE.md"
VALID_STATUSES = {"accepted", "fixed", "false positive", "needs follow-up"}
WARNING_RE = re.compile(r"^WARNING (?P<path>.*?):(?P<line>\d+): (?P<message>.*)$")


def current_warnings():
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "scan_for_engineering_smells.py")],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    warnings = []
    for line in result.stdout.splitlines():
        match = WARNING_RE.match(line)
        if match:
            warnings.append((match.group("path"), match.group("message")))
    return warnings


def baseline_entries():
    if not BASELINE.exists():
        return {}, ["missing docs/quality/SMELL_BASELINE.md"]
    entries = {}
    failures = []
    for line in BASELINE.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| "):
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) < 4 or cells[0] in {"Path", "---"}:
            continue
        path, message, status, owner = cells[:4]
        if status == "obsolete":
            continue
        if status not in VALID_STATUSES:
            failures.append(f"invalid baseline status for {path}: {status}")
        entries[(path, message)] = status
    return entries, failures


def main():
    entries, failures = baseline_entries()
    for path, message in current_warnings():
        status = entries.get((path, message))
        if status is None:
            failures.append(f"untriaged smell warning: {path}: {message}")
        elif status == "fixed":
            failures.append(f"baseline says fixed but warning still present: {path}: {message}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
