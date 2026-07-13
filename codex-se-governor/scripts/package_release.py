#!/usr/bin/env python3
"""Create exact and compatibility release archives with UTF-8-safe names."""

from pathlib import Path
import shutil
import sys
import zipfile

sys.dont_write_bytecode = True

from governor_config import load_config
from release_manifest import stale_archives, write_manifest

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", ".pytest_cache", "__pycache__", "__MACOSX", ".venv", "venv", "env", "dist", "node_modules", ".next", ".wrangler"}
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


def build_archive(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.unlink(missing_ok=True)
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED, strict_timestamps=False) as archive:
        for source in sorted(ROOT.rglob("*")):
            if include(source):
                archive.write(source, Path("codex-se-governor") / source.relative_to(ROOT))


def main(argv=None):
    config = load_config()
    failures = [f"stale undeclared distribution: {path}" for path in stale_archives(config)]
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    exact = ROOT / config["release_archive"]
    build_archive(exact)
    alias_value = config.get("compatibility_archive")
    if alias_value:
        alias = ROOT / alias_value
        alias.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(exact, alias)
    write_manifest(config)
    print(f"PASS created {exact.relative_to(ROOT)}")
    if alias_value:
        print(f"- compatibility alias: {alias_value}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
