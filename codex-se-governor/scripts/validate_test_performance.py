#!/usr/bin/env python3
"""Validate persisted test or validation timing without starting pytest."""

from pathlib import Path
import argparse
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / "docs" / "quality" / "TEST_PERFORMANCE_BASELINE.md"
ROW_RE = re.compile(r"^\|\s*(?P<suite>[a-z0-9-]+)\s*\|\s*(?P<threshold>\d+(?:\.\d+)?)\s*\|")


def load_thresholds():
    thresholds = {}
    if not BASELINE.exists():
        return thresholds
    for line in BASELINE.read_text(encoding="utf-8").splitlines():
        match = ROW_RE.match(line)
        if match:
            thresholds[match.group("suite")] = float(match.group("threshold"))
    return thresholds


def parse_args(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument("--suite", choices=["unit", "integration", "fast", "e2e", "release"], required=True)
    parser.add_argument("--timing-json", type=Path)
    return parser.parse_args(argv)


def load_timing(path):
    if not path.exists():
        return {}, [f"missing timing artifact: {path.relative_to(ROOT) if path.is_relative_to(ROOT) else path}"]
    try:
        return json.loads(path.read_text(encoding="utf-8")), []
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        return {}, [f"invalid timing artifact: {exc}"]


def validate_payload(suite, payload, threshold):
    failures = []
    if payload.get("suite") != suite:
        failures.append(f"timing artifact suite mismatch: expected {suite}, got {payload.get('suite')}")
    elapsed = payload.get("elapsed_seconds")
    if isinstance(elapsed, (int, float)) and elapsed > threshold:
        failures.append(f"test suite exceeded threshold: {elapsed}s > {threshold:g}s")
    if payload.get("returncode") != 0:
        failures.append(f"timed suite did not pass: returncode {payload.get('returncode')}")
    if suite != "release" and payload.get("plugin_autoload_disabled") is not True:
        failures.append("pytest plugin autoload was not disabled")
    return failures


def main(argv=None):
    args = parse_args(argv)
    timing_path = args.timing_json or ROOT / "dist" / f"test-timing-{args.suite}.json"
    thresholds = load_thresholds()
    payload, failures = load_timing(timing_path)
    threshold = thresholds.get(args.suite)
    if threshold is None:
        failures.append(f"missing performance threshold for suite: {args.suite}")
    elif payload:
        failures.extend(validate_payload(args.suite, payload, threshold))
    elapsed = payload.get("elapsed_seconds")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    print(f"- {args.suite}: {elapsed}s <= {threshold:g}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
