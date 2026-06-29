#!/usr/bin/env python3
"""Conservative software engineering governance gate."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = [
    "AGENTS.md",
    "docs/software-engineering/17_REVISION_MASTER_CHECKLIST.md",
    "docs/software-engineering/18_TRACEABILITY_MATRIX.md",
    "templates/REQUIREMENTS_TEMPLATE.md",
    "templates/USER_STORY_TEMPLATE.md",
    "templates/ACCEPTANCE_CRITERIA_TEMPLATE.md",
    "templates/ANALYSIS_MODEL_TEMPLATE.md",
    "templates/DESIGN_DOC_TEMPLATE.md",
    "templates/TEST_PLAN_TEMPLATE.md",
    "templates/TEST_CASE_MATRIX.md",
    "templates/RISK_REGISTER.md",
    "templates/SECURITY_REVIEW_TEMPLATE.md",
    "templates/CODE_REVIEW_TEMPLATE.md",
    ".github/pull_request_template.md",
    ".agents/skills/software-engineering-governor/SKILL.md",
]

PATTERNS = [
    "hardcoded password",
    "api" + "_key =",
    "secret" + " =",
    "TODO:" + " fix later",
    "skip" + " tests",
    "ev" + "al(",
    "ex" + "ec(",
    "verify" + "=False",
]

SKIP_DIRS = {".git", "__pycache__", ".pytest_cache", "node_modules"}
SKIP_FILES = {
    Path("scripts/se_gate.py"),
    Path("scripts/scan_for_engineering_smells.py"),
    Path(".agents/skills/software-engineering-governor/scripts/se_gate.py"),
}


def iter_text_files():
    for path in ROOT.rglob("*"):
        rel = path.relative_to(ROOT)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        if path.is_file() and rel not in SKIP_FILES:
            try:
                path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue
            yield path


def main():
    failures = []
    for item in REQUIRED:
        if not (ROOT / item).exists():
            failures.append(f"missing required artifact: {item}")

    for path in iter_text_files():
        text = path.read_text(encoding="utf-8", errors="ignore")
        lowered = text.lower()
        for pattern in PATTERNS:
            if pattern.lower() in lowered:
                failures.append(f"dangerous text '{pattern}' found in {path.relative_to(ROOT)}")

    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
