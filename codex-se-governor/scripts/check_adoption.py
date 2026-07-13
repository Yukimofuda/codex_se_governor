#!/usr/bin/env python3
"""Check whether a target repository has adopted core governor files."""

from pathlib import Path
import sys

REQUIRED = [
    "AGENTS.md",
    "docs/software-engineering/17_REVISION_MASTER_CHECKLIST.md",
    "docs/software-engineering/18_TRACEABILITY_MATRIX.md",
    "templates/REQUIREMENTS_TEMPLATE.md",
    ".agents/skills/software-engineering-governor/SKILL.md",
    "scripts/se_gate.py",
    ".github/pull_request_template.md",
    ".github/workflows/se-quality-gate.yml",
]


def main(argv):
    if len(argv) != 2:
        print("Usage: python scripts/check_adoption.py /path/to/target/repo")
        return 2
    target = Path(argv[1]).resolve()
    missing = [item for item in REQUIRED if not (target / item).exists()]
    if missing:
        print("FAIL")
        for item in missing:
            print(f"- missing adoption file: {item}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

