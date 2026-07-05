#!/usr/bin/env python3
"""Run pytest without leaving generated cache artifacts behind."""

from pathlib import Path
import json
import os
import re
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]


def run(command, env):
    print(f"$ {' '.join(command)}")
    return subprocess.run(command, cwd=ROOT, text=True, env=env, capture_output=True, check=False)


def parse_args(argv):
    args = []
    timing_json = None
    iterator = iter(argv)
    for item in iterator:
        if item == "--timing-json":
            timing_json = Path(next(iterator))
        else:
            args.append(item)
    return args, timing_json


def parse_slowest(output):
    pattern = re.compile(r"^\s*(\d+\.\d+)s\s+(.*)$")
    return [line.strip() for line in output.splitlines() if pattern.match(line)]


def main(argv=None):
    args, timing_json = parse_args(list(argv or sys.argv[1:]))
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    pytest_command = [sys.executable, "-m", "pytest", "-p", "no:cacheprovider", "--durations=10", "--durations-min=0.01", *args]
    started = time.monotonic()
    pytest_result = run(pytest_command, env)
    elapsed = time.monotonic() - started
    print(pytest_result.stdout, end="")
    if pytest_result.stderr:
        print(pytest_result.stderr, end="", file=sys.stderr)
    cleanup_result = run([sys.executable, "scripts/clean_artifacts.py"], env)
    print(cleanup_result.stdout, end="")
    clean_result = run([sys.executable, "scripts/validate_clean_package.py"], env)
    print(clean_result.stdout, end="")
    if timing_json is not None:
        timing_json.write_text(
            json.dumps(
                {
                    "elapsed_seconds": round(elapsed, 2),
                    "slowest": parse_slowest(pytest_result.stdout),
                    "returncode": pytest_result.returncode,
                },
                indent=2,
                sort_keys=True,
            ),
            encoding="utf-8",
        )
    print(f"Test duration: {elapsed:.2f}s")
    if pytest_result.returncode != 0:
        print("FAIL pytest failed")
        return pytest_result.returncode
    if cleanup_result.returncode != 0:
        print("FAIL cleanup failed")
        return cleanup_result.returncode
    if clean_result.returncode != 0:
        print("FAIL clean package validation failed after tests")
        return clean_result.returncode
    print("PASS tests completed without retained generated artifacts")
    return 0


if __name__ == "__main__":
    sys.exit(main())
