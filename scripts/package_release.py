#!/usr/bin/env python3
"""Create a clean release zip archive."""

from pathlib import Path
import sys
import zipfile

sys.dont_write_bytecode = True

from governor_config import load_config

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
SKIP_DIRS = {".git", ".pytest_cache", "__pycache__", "__MACOSX", ".venv", "venv", "env", "dist"}
SKIP_FILES = {".DS_Store"}
SKIP_SUFFIXES = {".pyc", ".pyo", ".pyd", ".log"}


def include(path):
    rel = path.relative_to(ROOT)
    if any(part in SKIP_DIRS for part in rel.parts):
        return False
    if path.name in SKIP_FILES or path.suffix in SKIP_SUFFIXES:
        return False
    if len(rel.parts) >= 2 and rel.parts[0] == "tasks" and rel.parts[1].endswith("-smoke"):
        return False
    return path.is_file()


def main(argv=None):
    archive_path = ROOT / load_config()["release_archive"]
    DIST.mkdir(exist_ok=True)
    archive_path.parent.mkdir(exist_ok=True)
    if archive_path.exists():
        archive_path.unlink()
    with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED, strict_timestamps=False) as archive:
        for path in sorted(ROOT.rglob("*")):
            if include(path):
                archive.write(path, Path("codex-se-governor") / path.relative_to(ROOT))
    print(f"PASS created {archive_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
