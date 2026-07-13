#!/usr/bin/env python3
"""Run the repository software engineering gate from inside the Skill."""

from pathlib import Path
import runpy
import sys

ROOT = Path(__file__).resolve().parents[4]
SCRIPT = ROOT / "scripts" / "se_gate.py"

if not SCRIPT.exists():
    print(f"FAIL missing {SCRIPT}")
    sys.exit(1)

runpy.run_path(str(SCRIPT), run_name="__main__")
