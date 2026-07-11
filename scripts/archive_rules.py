#!/usr/bin/env python3
"""Shared archive and generated-artifact rules."""

from pathlib import Path

BAD_DIRS = {".pytest_cache", "__pycache__", "__MACOSX", ".venv", "venv", "env"}
BAD_FILES = {".DS_Store"}
BAD_SUFFIXES = {".pyc", ".pyo", ".pyd"}
REQUIRED_ARCHIVE_PATH_SUFFIXES = ("references/course/软件工程全整理.md",)
MOJIBAKE_COURSE_NAME = "Φ╜»Σ╗╢σ╖Ñτ¿ïσà¿µò┤τÉå.md"


def bad_entry(name):
    parts = Path(name).parts
    if any(part in BAD_DIRS for part in parts):
        return True
    leaf = parts[-1] if parts else name
    return leaf in BAD_FILES or leaf.endswith(tuple(BAD_SUFFIXES))


def has_required_paths(names):
    normalized = [name.replace("\\", "/") for name in names]
    missing = []
    for suffix in REQUIRED_ARCHIVE_PATH_SUFFIXES:
        if not any(name.endswith(suffix) for name in normalized):
            missing.append(suffix)
    return missing


def mojibake_paths(names):
    normalized = [name.replace("\\", "/") for name in names]
    return [name for name in normalized if MOJIBAKE_COURSE_NAME in name]
