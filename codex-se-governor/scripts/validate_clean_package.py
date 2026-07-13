#!/usr/bin/env python3
"""Fail if generated local artifacts are present in the project package."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DIR_NAMES = {".pytest_cache", "__pycache__", "__MACOSX"}
FILE_NAMES = {".DS_Store"}
FILE_SUFFIXES = {".pyc"}


def violations():
    for path in sorted(ROOT.rglob("*")):
        rel = path.relative_to(ROOT)
        if ".git" in rel.parts:
            continue
        if path.is_dir() and path.name in DIR_NAMES:
            yield rel
        elif path.is_file() and (path.name in FILE_NAMES or path.suffix in FILE_SUFFIXES):
            yield rel


def main():
    found = list(violations())
    if found:
        print("FAIL")
        for path in found:
            print(f"- clean package violation: generated artifact present: {path}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
