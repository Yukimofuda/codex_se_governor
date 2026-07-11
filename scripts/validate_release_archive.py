#!/usr/bin/env python3
"""Validate exact release archive hygiene, UTF-8 paths, and dist manifest."""

from pathlib import Path
import sys
import zipfile

sys.dont_write_bytecode = True

from archive_rules import bad_entry, has_required_paths, mojibake_paths
from governor_config import load_config
from release_manifest import validate_dist

ROOT = Path(__file__).resolve().parents[1]


def main(argv=None):
    argv = list(argv or sys.argv[1:])
    config = load_config()
    archive = Path(argv[0]).resolve() if argv else ROOT / config["release_archive"]
    failures = []
    if archive != (ROOT / config["release_archive"]).resolve():
        failures.append(f"release validator requires exact patch archive: {config['release_archive']}")
    if not archive.is_file():
        failures.append(f"archive not found: {archive}")
    else:
        try:
            with zipfile.ZipFile(archive) as handle:
                names = handle.namelist()
        except zipfile.BadZipFile as exc:
            failures.append(f"invalid zip archive: {exc}")
        else:
            failures.extend(f"generated artifact in release archive: {name}" for name in names if bad_entry(name))
            failures.extend(f"required archive path missing: {path}" for path in has_required_paths(names))
            failures.extend(f"mojibake course path in release archive: {name}" for name in mojibake_paths(names))
    failures.extend(validate_dist(config))
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
