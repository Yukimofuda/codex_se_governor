#!/usr/bin/env python3
"""Remove generated local artifacts only."""

from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
DIR_NAMES = {".pytest_cache", "__pycache__", "__MACOSX"}
FILE_NAMES = {".DS_Store"}
FILE_SUFFIXES = {".pyc"}


def generated_paths():
    for path in sorted(ROOT.rglob("*")):
        rel = path.relative_to(ROOT)
        if any(part in {".git"} for part in rel.parts):
            continue
        if path.is_dir() and path.name in DIR_NAMES:
            yield path
        elif path.is_file() and (path.name in FILE_NAMES or path.suffix in FILE_SUFFIXES):
            yield path
        elif path.is_dir() and path.parent.name == "tasks" and path.name.endswith("-smoke"):
            yield path


def main():
    removed = []
    for path in list(generated_paths()):
        if not path.exists():
            continue
        if path.is_dir():
            shutil.rmtree(path)
        else:
            path.unlink()
        removed.append(str(path.relative_to(ROOT)))
    print("PASS")
    for item in removed:
        print(f"- removed {item}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

