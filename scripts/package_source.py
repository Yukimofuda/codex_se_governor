#!/usr/bin/env python3
"""Create the canonical UTF-8-safe source distribution archive."""

from pathlib import Path
import sys
import zipfile

sys.dont_write_bytecode = True

from governor_config import load_config
from package_release import include
from release_manifest import stale_archives, write_manifest

ROOT = Path(__file__).resolve().parents[1]


def main():
    config = load_config()
    failures = [f"stale undeclared distribution: {path}" for path in stale_archives(config)]
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    archive_path = ROOT / config["source_archive"]
    archive_path.parent.mkdir(parents=True, exist_ok=True)
    archive_path.unlink(missing_ok=True)
    with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED, strict_timestamps=False) as archive:
        for source in sorted(ROOT.rglob("*")):
            if include(source):
                archive.write(source, Path("codex-se-governor") / source.relative_to(ROOT))
    write_manifest(config)
    print(f"PASS created {archive_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
