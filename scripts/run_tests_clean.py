#!/usr/bin/env python3
"""Run isolated pytest suites without retaining generated cache artifacts."""

from pathlib import Path
import json
import os
import re
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
SUITE_ARGS = {
    "unit": ["tests/unit"],
    "integration": ["tests/integration"],
    "fast": ["-m", "not e2e"],
    "e2e": ["-m", "e2e"],
}


def run(command, env):
    print(f"$ {' '.join(command)}")
    return subprocess.run(command, cwd=ROOT, text=True, env=env, capture_output=True, check=False)


def parse_args(argv):
    args = []
    timing_json = None
    mode = "fast"
    iterator = iter(argv)
    for item in iterator:
        if item == "--timing-json":
            timing_json = Path(next(iterator))
        elif item == "--fast":
            mode = "fast"
        elif item == "--unit":
            mode = "unit"
        elif item == "--integration":
            mode = "integration"
        elif item == "--e2e":
            mode = "e2e"
        else:
            args.append(item)
    return args, timing_json, mode


def parse_slowest(output):
    pattern = re.compile(r"^\s*(\d+\.\d+)s\s+(.*)$")
    return [line.strip() for line in output.splitlines() if pattern.match(line)]


def main(argv=None):
    args, timing_json, mode = parse_args(list(argv or sys.argv[1:]))
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    env["PYTEST_DISABLE_PLUGIN_AUTOLOAD"] = "1"
    suite_args = SUITE_ARGS[mode]
    pytest_command = [sys.executable, "-m", "pytest", "-p", "no:cacheprovider", "--durations=10", "--durations-min=0.01", *suite_args, *args]
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
    timing_json = timing_json or DIST / f"test-timing-{mode}.json"
    timing_json.parent.mkdir(parents=True, exist_ok=True)
    timing_json.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "suite": mode,
                "elapsed_seconds": round(elapsed, 3),
                "slowest": parse_slowest(pytest_result.stdout),
                "returncode": pytest_result.returncode,
                "plugin_autoload_disabled": env["PYTEST_DISABLE_PLUGIN_AUTOLOAD"] == "1",
                "bytecode_disabled": env["PYTHONDONTWRITEBYTECODE"] == "1",
                "cache_provider_disabled": "no:cacheprovider" in pytest_command,
                "command": pytest_command,
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
