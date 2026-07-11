#!/usr/bin/env python3
"""Validate deterministic pytest isolation and suite selection."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
WRAPPER = ROOT / "scripts" / "run_tests_clean.py"
CONFIG = ROOT / "pytest.ini"


def main():
    failures = []
    wrapper = WRAPPER.read_text(encoding="utf-8") if WRAPPER.exists() else ""
    config = CONFIG.read_text(encoding="utf-8") if CONFIG.exists() else ""
    required = {
        'env["PYTEST_DISABLE_PLUGIN_AUTOLOAD"] = "1"': "run_tests_clean.py must disable pytest plugin autoload",
        'env["PYTHONDONTWRITEBYTECODE"] = "1"': "run_tests_clean.py must disable bytecode writes",
        '"no:cacheprovider"': "run_tests_clean.py must disable pytest cacheprovider",
        '"fast"': "run_tests_clean.py missing fast mode",
        '"e2e"': "run_tests_clean.py missing e2e mode",
    }
    for token, message in required.items():
        if token not in wrapper:
            failures.append(message)
    if "not e2e" not in config:
        failures.append("pytest.ini must exclude e2e tests by default")
    for path in sorted((ROOT / "scripts").glob("validate_*.py")):
        if path == Path(__file__):
            continue
        text = path.read_text(encoding="utf-8")
        if "import pytest" in text or "pytest_plugins" in text:
            failures.append(f"validator requires pytest/plugin behavior: {path.relative_to(ROOT)}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
