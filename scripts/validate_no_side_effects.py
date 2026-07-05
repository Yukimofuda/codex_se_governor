#!/usr/bin/env python3
"""Run a command and fail if it creates generated local artifacts."""

from pathlib import Path
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
GENERATED_DIRS = {".pytest_cache", "__pycache__", "__MACOSX"}
GENERATED_FILES = {".DS_Store"}
GENERATED_SUFFIXES = {".pyc"}


def generated_artifacts():
    found = set()
    for path in ROOT.rglob("*"):
        rel = path.relative_to(ROOT)
        if ".git" in rel.parts:
            continue
        if path.is_dir() and path.name in GENERATED_DIRS:
            found.add(str(rel))
        elif path.is_file() and (path.name in GENERATED_FILES or path.suffix in GENERATED_SUFFIXES):
            found.add(str(rel))
    return found


def main(argv):
    if "--" not in argv:
        print("Usage: python scripts/validate_no_side_effects.py -- <command> [args...]")
        return 2
    index = argv.index("--")
    command = argv[index + 1 :]
    if not command:
        print("Usage: python scripts/validate_no_side_effects.py -- <command> [args...]")
        return 2
    before = generated_artifacts()
    env = os.environ.copy()
    env.setdefault("PYTHONDONTWRITEBYTECODE", "1")
    result = subprocess.run(command, cwd=ROOT, text=True, env=env, check=False)
    after = generated_artifacts()
    created = sorted(after - before)
    if result.returncode != 0 or created:
        print("FAIL")
        if result.returncode != 0:
            print(f"- command failed with exit code {result.returncode}: {' '.join(command)}")
        for item in created:
            print(f"- side effect artifact created: {item}")
        return result.returncode or 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
