#!/usr/bin/env python3
"""Fail when semantic coverage score drops below threshold."""

from pathlib import Path
import json
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
THRESHOLD = 85


def main():
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "semantic_coverage_score.py")],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
        env=env,
    )
    if result.returncode != 0:
        print("FAIL")
        print("- semantic_coverage_score.py failed")
        return result.returncode
    payload = json.loads(result.stdout)
    failures = []
    if payload["score"] < THRESHOLD:
        failures.append(f"semantic coverage score below threshold: {payload['score']} < {THRESHOLD}")
    if payload["too_broad_cluster_count"] > 0:
        failures.append(f"semantic coverage has too-broad clusters: {payload['too_broad_cluster_count']}")
    if payload["artifact_missing_count"] > 0:
        failures.append(f"semantic coverage has missing artifacts: {payload['artifact_missing_count']}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
