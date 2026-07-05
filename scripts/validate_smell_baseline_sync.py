#!/usr/bin/env python3
"""Validate that smell baseline entries are current, complete, and not stale."""

from pathlib import Path
import re
import subprocess
import sys

sys.dont_write_bytecode = True

from governor_config import load_config, version_is_expired

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / "docs" / "quality" / "SMELL_BASELINE.md"
WARNING_RE = re.compile(r"^WARNING (?P<path>.*?):(?P<line>\d+): (?P<message>.*)$")
ALLOWED = {"accepted", "false positive", "needs follow-up", "obsolete", "temporary-exception"}


def current_warnings():
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "scan_for_engineering_smells.py")],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    warnings = set()
    for line in result.stdout.splitlines():
        match = WARNING_RE.match(line)
        if match:
            warnings.add((match.group("path"), match.group("message")))
    return warnings


def parse_baseline():
    failures = []
    entries = {}
    if not BASELINE.exists():
        return entries, ["missing docs/quality/SMELL_BASELINE.md"]
    for line in BASELINE.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| "):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) < 7 or cells[0] in {"Path", "---"}:
            continue
        path, message, status, owner, rationale, review_date, target_version = cells[:7]
        if status not in ALLOWED:
            failures.append(f"invalid smell baseline status: {path} {status}")
        if status != "obsolete":
            if not owner or not rationale or not review_date or not target_version:
                failures.append(f"incomplete active baseline entry: {path}: {message}")
        if status in {"accepted", "temporary-exception"} and version_is_expired(target_version, load_config()["version"]):
            failures.append(f"expired smell baseline entry: {path}: {message}")
        entries[(path, message)] = {
            "status": status,
            "owner": owner,
            "rationale": rationale,
            "review_date": review_date,
            "target_version": target_version,
        }
    return entries, failures


def main():
    current = current_warnings()
    entries, failures = parse_baseline()
    for warning in sorted(current):
        entry = entries.get(warning)
        if entry is None:
            failures.append(f"current warning missing baseline entry: {warning[0]}: {warning[1]}")
        elif entry["status"] == "obsolete":
            failures.append(f"warning still present but baseline marked obsolete: {warning[0]}: {warning[1]}")
    for warning, entry in sorted(entries.items()):
        if warning not in current and entry["status"] != "obsolete":
            failures.append(f"active baseline entry should be obsolete: {warning[0]}: {warning[1]}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
