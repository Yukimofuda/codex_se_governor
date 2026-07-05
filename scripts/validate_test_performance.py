#!/usr/bin/env python3
"""Validate that the clean pytest wrapper stays within the documented threshold."""

from pathlib import Path
import json
import os
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / "docs" / "quality" / "TEST_PERFORMANCE_BASELINE.md"
THRESHOLD_RE = re.compile(r"Suite threshold seconds:\s*(\d+)")


def load_threshold():
    if not BASELINE.exists():
        return 30
    text = BASELINE.read_text(encoding="utf-8")
    match = THRESHOLD_RE.search(text)
    return int(match.group(1)) if match else 30


def main():
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    with tempfile.NamedTemporaryFile(prefix="test-timing-", suffix=".json", delete=False) as handle:
        timing_path = Path(handle.name)
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "run_tests_clean.py"), "--timing-json", str(timing_path)],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
        env=env,
    )
    if result.stdout:
        print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr)
    if result.returncode != 0:
        print("FAIL")
        print("- run_tests_clean.py failed")
        return result.returncode
    payload = json.loads(timing_path.read_text(encoding="utf-8"))
    timing_path.unlink(missing_ok=True)
    threshold = load_threshold()
    elapsed = payload.get("elapsed_seconds", 0)
    if elapsed > threshold:
        print("FAIL")
        print(f"- test suite exceeded threshold: {elapsed}s > {threshold}s")
        for item in payload.get("slowest", []):
            print(f"- slow test: {item}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
