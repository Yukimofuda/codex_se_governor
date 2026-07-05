#!/usr/bin/env python3
"""Validate arbitrary zip archives for generated-artifact pollution."""

from pathlib import Path
import sys
import zipfile

sys.dont_write_bytecode = True

from archive_rules import bad_entry


def main(argv):
    if len(argv) != 2:
        print("Usage: python scripts/validate_outer_archive.py /path/to/archive.zip")
        return 2
    archive_path = Path(argv[1])
    if not archive_path.exists():
        print(f"FAIL missing archive: {archive_path}")
        return 1
    failures = []
    with zipfile.ZipFile(archive_path) as archive:
        for name in archive.namelist():
            if bad_entry(name):
                failures.append(f"generated artifact in outer archive: {name}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
