#!/usr/bin/env python3
"""Validate glossary structure."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
GLOSSARY = ROOT / "docs" / "GLOSSARY.md"
REQUIRED = ["Term", "Definition", "Source", "Related requirement", "Related module", "Ambiguity risk", "Owner"]


def main():
    failures = []
    if not GLOSSARY.exists():
        failures.append("missing glossary: docs/GLOSSARY.md")
    else:
        text = GLOSSARY.read_text(encoding="utf-8").lower()
        for field in REQUIRED:
            if field.lower() not in text:
                failures.append(f"docs/GLOSSARY.md missing field: {field}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
