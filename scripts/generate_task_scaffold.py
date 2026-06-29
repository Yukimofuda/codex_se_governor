#!/usr/bin/env python3
"""Generate a lifecycle task scaffold from reusable templates."""

from pathlib import Path
import re
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "templates"

MAP = {
    "REQUIREMENTS.md": "REQUIREMENTS_TEMPLATE.md",
    "USER_STORY.md": "USER_STORY_TEMPLATE.md",
    "ANALYSIS.md": "ANALYSIS_MODEL_TEMPLATE.md",
    "DESIGN.md": "DESIGN_DOC_TEMPLATE.md",
    "ADR.md": "ARCHITECTURE_DECISION_RECORD.md",
    "TEST_PLAN.md": "TEST_PLAN_TEMPLATE.md",
    "TEST_CASE_MATRIX.md": "TEST_CASE_MATRIX.md",
    "RISK_REGISTER.md": "RISK_REGISTER.md",
    "SECURITY_REVIEW.md": "SECURITY_REVIEW_TEMPLATE.md",
    "FINAL_REPORT.md": "FINAL_ENGINEERING_REPORT.md",
}


def slugify(value):
    slug = re.sub(r"[^A-Za-z0-9._-]+", "-", value.strip()).strip("-")
    return slug or "task"


def main(argv):
    if len(argv) != 2:
        print('Usage: python scripts/generate_task_scaffold.py "feature-login-rate-limit"')
        return 2
    task = slugify(argv[1])
    target = ROOT / "tasks" / task
    target.mkdir(parents=True, exist_ok=True)
    for dest, src in MAP.items():
        shutil.copyfile(TEMPLATES / src, target / dest)
    print(f"Created {target.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
