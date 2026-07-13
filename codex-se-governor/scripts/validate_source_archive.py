#!/usr/bin/env python3
"""Validate canonical source archive contents, UTF-8 names, and release manifest."""

from pathlib import Path, PurePosixPath
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
    archive = Path(argv[0]).resolve() if argv else ROOT / config["source_archive"]
    failures = []
    if archive != (ROOT / config["source_archive"]).resolve():
        failures.append(f"source validator requires exact source archive: {config['source_archive']}")
    if not archive.is_file():
        failures.append(f"archive not found: {archive}")
    else:
        try:
            with zipfile.ZipFile(archive) as handle:
                names = handle.namelist()
        except zipfile.BadZipFile as exc:
            failures.append(f"invalid zip archive: {exc}")
        else:
            failures.extend(f"generated artifact in source archive: {name}" for name in names if bad_entry(name))
            failures.extend(f"required archive path missing: {path}" for path in has_required_paths(names))
            failures.extend(f"mojibake course path in source archive: {name}" for name in mojibake_paths(names))
            roots = {PurePosixPath(name).parts[0] for name in names if PurePosixPath(name).parts}
            if roots != {"codex-se-governor"}:
                failures.append(f"source archive must contain project root exactly once: {sorted(roots)}")
            if not any(name.startswith("codex-se-governor/tests/") for name in names):
                failures.append("source archive missing tests/")
            if any("/dist/" in name for name in names):
                failures.append("source archive must exclude dist/")
    failures.extend(validate_dist(config, require_all=True))
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
