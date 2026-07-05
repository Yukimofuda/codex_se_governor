#!/usr/bin/env python3
"""Shared archive and generated-artifact rules."""

from pathlib import Path

BAD_DIRS = {".pytest_cache", "__pycache__", "__MACOSX", ".venv", "venv", "env"}
BAD_FILES = {".DS_Store"}
BAD_SUFFIXES = {".pyc", ".pyo", ".pyd"}


def bad_entry(name):
    parts = Path(name).parts
    if any(part in BAD_DIRS for part in parts):
        return True
    leaf = parts[-1] if parts else name
    return leaf in BAD_FILES or leaf.endswith(tuple(BAD_SUFFIXES))
