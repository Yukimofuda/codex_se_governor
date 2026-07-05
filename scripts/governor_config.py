#!/usr/bin/env python3
"""Shared governor configuration loader."""

from pathlib import Path
import re
import tomllib

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "governor.toml"
SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+$")


def load_config():
    data = tomllib.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    return {
        "name": data["name"],
        "version": data["version"],
        "release_archive": data["release_archive"],
    }


def version_tag(version):
    major, minor, _patch = version.split(".")
    return f"v{major}.{minor}"


def version_is_expired(target_version, current_version):
    current = tuple(int(part) for part in current_version.split("."))
    target = tuple(int(part) for part in target_version.lstrip("v").split("."))
    return target <= current[: len(target)]


def is_semver(value):
    return bool(SEMVER_RE.match(value))
