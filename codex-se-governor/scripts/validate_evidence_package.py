#!/usr/bin/env python3
"""Validate scored engineering evidence packages."""

from pathlib import Path
import argparse
import json
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
THRESHOLD = 85


def load_packages(path):
    if path:
        return json.loads(path.read_text(encoding="utf-8"))
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "evidence_package_score.py")],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
        env=env,
    )
    if result.returncode != 0:
        print("FAIL")
        print("- evidence_package_score.py failed")
        raise RuntimeError("evidence_package_score.py failed")
    return json.loads(result.stdout)


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path)
    args = parser.parse_args(argv)
    try:
        packages = load_packages(args.input)
    except (OSError, json.JSONDecodeError, RuntimeError) as exc:
        print("FAIL")
        print(f"- {exc}")
        return 1
    failures = []
    for package in packages:
        if package["score"] < THRESHOLD:
            failures.append(f"{package['path']} evidence package score below threshold: {package['score']}")
        for name, passed in package["criteria"].items():
            if not passed:
                failures.append(f"{package['path']} missing evidence criterion: {name}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
