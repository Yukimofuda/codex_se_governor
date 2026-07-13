#!/usr/bin/env python3
"""Fail when semantic coverage score drops below threshold."""

from pathlib import Path
import argparse
import json
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
THRESHOLD = 85


def load_payload(path):
    if path:
        return json.loads(path.read_text(encoding="utf-8"))
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    result = subprocess.run([sys.executable, str(ROOT / "scripts" / "semantic_coverage_score.py")], cwd=ROOT, text=True, capture_output=True, check=False, env=env)
    if result.returncode != 0:
        raise RuntimeError("semantic_coverage_score.py failed")
    return json.loads(result.stdout)


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path)
    args = parser.parse_args(argv)
    try:
        payload = load_payload(args.input)
    except (OSError, json.JSONDecodeError, RuntimeError) as exc:
        print("FAIL")
        print(f"- {exc}")
        return 1
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
