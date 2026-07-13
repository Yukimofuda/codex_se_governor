#!/usr/bin/env python3
"""Print the Software Engineering Governor checklist."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
print((ROOT / "references" / "SE_CHECKLIST.md").read_text(encoding="utf-8"))
