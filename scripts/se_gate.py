#!/usr/bin/env python3
"""Conservative software engineering governance gate."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = [
    "AGENTS.md",
    "docs/software-engineering/17_REVISION_MASTER_CHECKLIST.md",
    "docs/software-engineering/18_TRACEABILITY_MATRIX.md",
    "docs/software-engineering/19_COURSE_SECTION_COVERAGE.md",
    "docs/software-engineering/20_COURSE_SEMANTIC_COVERAGE.md",
    "docs/software-engineering/COURSE_OUTLINE_LOCK.json",
    "references/course/README.md",
    "references/course/软件工程全整理.md",
    "docs/GLOSSARY.md",
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
    "templates/AI_USAGE_REVIEW_TEMPLATE.md",
    "templates/PROCESS_COMPLIANCE_REPORT.md",
    "templates/PROJECT_CONTEXT_TEMPLATE.md",
    "templates/PROCESS_DECISION_TEMPLATE.md",
    "templates/REQUIREMENTS_ELICITATION_LOG.md",
    "templates/GLOSSARY_TEMPLATE.md",
    "templates/TEST_STRATEGY_TEMPLATE.md",
    "templates/ARCHITECTURE_SCENARIO_TEMPLATE.md",
    ".github/pull_request_template.md",
    ".agents/skills/software-engineering-governor/SKILL.md",
    "scripts/clean_artifacts.py",
    "scripts/run_full_validation.py",
    "scripts/validate_no_side_effects.py",
    "scripts/package_release.py",
    "scripts/validate_release_archive.py",
    "scripts/validate_clean_package.py",
    "scripts/extract_course_outline.py",
    "scripts/validate_course_coverage.py",
    "scripts/validate_course_semantic_coverage.py",
    "scripts/validate_course_outline_lock.py",
    "scripts/validate_doc_structure.py",
    "scripts/validate_templates.py",
    "scripts/validate_skill.py",
    "scripts/validate_smell_baseline.py",
    "scripts/validate_glossary.py",
    "scripts/validate_test_strategy.py",
    "scripts/validate_test_traceability.py",
    "scripts/validate_complexity_thresholds.py",
    "scripts/complexity_report.py",
    "scripts/test_matrix_coverage_report.py",
    "scripts/validate_architecture_scenarios.py",
    "scripts/validate_project_management.py",
    "scripts/validate_ai_review_template.py",
    "scripts/validate_process_compliance_template.py",
    "scripts/validate_maintenance_docs.py",
    "scripts/governance_metrics.py",
    "scripts/check_adoption.py",
    "docs/quality/SMELL_BASELINE.md",
    "docs/quality/COMPLEXITY_BASELINE.md",
    "docs/architecture/4_PLUS_1_VIEW.md",
    "docs/architecture/COMPONENTS_AND_CONNECTORS.md",
    "docs/architecture/QUALITY_ATTRIBUTE_TRADEOFFS.md",
    "docs/architecture/ADR_INDEX.md",
    "docs/project-management/ROADMAP.md",
    "docs/project-management/MILESTONES.md",
    "docs/project-management/RELEASE_PLAN.md",
    "docs/project-management/RISK_REGISTER.md",
    "CHANGELOG.md",
    "VERSIONING.md",
    "MAINTENANCE_GUIDE.md",
    "SUPPORT_RUNBOOK.md",
    "DEPRECATION_POLICY.md",
    ".gitignore",
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
SKIP_PREFIXES = (Path("references") / "course",)
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
        if any(rel == prefix or prefix in rel.parents for prefix in SKIP_PREFIXES):
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
