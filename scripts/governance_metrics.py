#!/usr/bin/env python3
"""Emit lightweight governance metrics as JSON."""

from pathlib import Path
import json
import os
import subprocess
import sys

sys.dont_write_bytecode = True

from governor_config import load_config, version_tag, version_is_expired

ROOT = Path(__file__).resolve().parents[1]


def count_files(path, pattern):
    root = ROOT / path
    return len(list(root.rglob(pattern))) if root.exists() else 0


def run_script(name):
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / name)],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
        env=env,
    )
    return result


def missing_count(output):
    return sum(1 for line in output.splitlines() if line.startswith("- "))


def pytest_discovered():
    count = 0
    tests = ROOT / "tests"
    if not tests.exists():
        return 0
    for path in tests.rglob("test_*.py"):
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.lstrip().startswith("def test_"):
                count += 1
    return count


def cache_artifacts():
    count = 0
    for path in ROOT.rglob("*"):
        rel = path.relative_to(ROOT)
        if ".git" in rel.parts:
            continue
        if path.name in {".pytest_cache", "__pycache__", ".DS_Store", "__MACOSX"} or path.suffix == ".pyc":
            count += 1
    return count


def course_outline_count():
    result = run_script("extract_course_outline.py")
    if result.returncode != 0:
        return 0
    try:
        return len(json.loads(result.stdout))
    except json.JSONDecodeError:
        return 0


def course_coverage_counts():
    outline = run_script("extract_course_outline.py")
    if outline.returncode != 0:
        return 0, 0
    try:
        sections = json.loads(outline.stdout)
    except json.JSONDecodeError:
        return 0, 0
    coverage_text = ""
    for rel in ["docs/software-engineering/18_TRACEABILITY_MATRIX.md", "docs/software-engineering/19_COURSE_SECTION_COVERAGE.md"]:
        path = ROOT / rel
        if path.exists():
            coverage_text += "\n" + path.read_text(encoding="utf-8")
    covered = sum(1 for item in sections if f"| {item['section']} |" in coverage_text)
    return covered, max(0, len(sections) - covered)


def course_reference_stats():
    root = ROOT / "references" / "course"
    if not root.exists():
        return 0, 0
    files = sorted(path for path in root.rglob("*") if path.is_file())
    line_count = 0
    for path in files:
        try:
            line_count += len(path.read_text(encoding="utf-8").splitlines())
        except UnicodeDecodeError:
            continue
    return len(files), line_count


def status_for(path):
    return "present" if (ROOT / path).exists() else "missing"


def semantic_coverage_stats():
    path = ROOT / "docs" / "software-engineering" / "20_COURSE_SEMANTIC_COVERAGE.md"
    if not path.exists():
        return 0, 0
    rows = [line for line in path.read_text(encoding="utf-8").splitlines() if line.startswith("| ") and not line.startswith("|---") and "Course sections covered" not in line]
    result = run_script("validate_course_semantic_coverage.py")
    return len(rows), missing_count(result.stdout) if result.returncode else 0


def semantic_cluster_count():
    return semantic_coverage_stats()[0]


def complexity_violations():
    result = run_script("validate_complexity_thresholds.py")
    if result.returncode == 0:
        return 0
    return sum(1 for line in result.stdout.splitlines() if "complexity threshold violation" in line)


def status_script(script):
    return "pass" if run_script(script).returncode == 0 else "fail"


def pytest_mode_status():
    config = ROOT / "pytest.ini"
    wrapper = ROOT / "scripts" / "run_tests_clean.py"
    if not config.exists() or not wrapper.exists():
        return "fail"
    config_text = config.read_text(encoding="utf-8")
    wrapper_text = wrapper.read_text(encoding="utf-8")
    if 'not e2e' not in config_text:
        return "fail"
    if "--fast" not in wrapper_text or "--e2e" not in wrapper_text:
        return "fail"
    return "pass"


def ai_average_score():
    result = run_script("ai_review_score.py")
    if result.returncode != 0:
        return 0
    try:
        rows = json.loads(result.stdout)
    except json.JSONDecodeError:
        return 0
    if not rows:
        return 0
    return round(sum(row.get("score", 0) for row in rows) / len(rows), 2)


def complexity_baseline_counts():
    path = ROOT / "docs" / "quality" / "COMPLEXITY_BASELINE.md"
    if not path.exists():
        return 0, 0, 0
    exceptions = 0
    over_20 = 0
    expired = 0
    current = load_config()["version"]
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("|---") or "Path" in line:
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) >= 11:
            exceptions += 1
            try:
                if int(cells[2]) > 20:
                    over_20 += 1
            except ValueError:
                pass
            if cells[3] == "temporary-exception" and version_is_expired(cells[8], current):
                expired += 1
    return exceptions, over_20, expired


def evidence_package_average():
    result = run_script("evidence_package_score.py")
    if result.returncode != 0:
        return 0
    try:
        rows = json.loads(result.stdout)
    except json.JSONDecodeError:
        return 0
    if not rows:
        return 0
    return round(sum(row.get("score", 0) for row in rows) / len(rows), 2)


def semantic_score():
    result = run_script("semantic_coverage_score.py")
    if result.returncode != 0:
        return {}
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {}


def maturity_min_score():
    report = ROOT / "docs" / "reports" / "GOVERNANCE_MATURITY_REPORT.md"
    if not report.exists():
        return 0
    scores = []
    for line in report.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("|---"):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) >= 4 and cells[1].isdigit():
            scores.append(int(cells[1]))
    return min(scores) if scores else 0


def main():
    doc_result = run_script("validate_doc_structure.py")
    template_result = run_script("validate_templates.py")
    smell_result = run_script("scan_for_engineering_smells.py")
    clean_result = run_script("validate_clean_package.py")
    coverage_count, coverage_missing = course_coverage_counts()
    semantic_rows, semantic_missing = semantic_coverage_stats()
    course_refs, course_ref_lines = course_reference_stats()
    complexity_exception_count, complexity_over_20_count, complexity_expired_count = complexity_baseline_counts()
    semantic = semantic_score()
    config = load_config()
    matrix = ROOT / "docs" / "software-engineering" / "18_TRACEABILITY_MATRIX.md"
    traceability_rows = 0
    if matrix.exists():
        traceability_rows = sum(1 for line in matrix.read_text(encoding="utf-8").splitlines() if line.startswith("| ") and not line.startswith("|---"))
        traceability_rows = max(0, traceability_rows - 1)
    metrics = {
        "docs_count": count_files("docs/software-engineering", "*.md"),
        "templates_count": count_files("templates", "*.md"),
        "scripts_count": count_files("scripts", "*.py"),
        "tests_count": count_files("tests", "test_*.py"),
        "issue_templates_count": count_files(".github/ISSUE_TEMPLATE", "*.md"),
        "github_workflows_count": count_files(".github/workflows", "*.yml"),
        "traceability_rows_estimate": traceability_rows,
        "docs_missing_heading_count": missing_count(doc_result.stdout),
        "templates_missing_field_count": missing_count(template_result.stdout),
        "smell_warning_count": sum(1 for line in smell_result.stdout.splitlines() if line.startswith("WARNING ")),
        "pytest_tests_discovered": pytest_discovered(),
        "cache_artifact_count": cache_artifacts(),
        "course_reference_count": course_refs,
        "course_reference_line_count": course_ref_lines,
        "course_section_count": course_outline_count(),
        "course_coverage_count": coverage_count,
        "course_coverage_missing_count": coverage_missing,
        "semantic_coverage_rows": semantic_rows,
        "semantic_coverage_missing_count": semantic_missing,
        "semantic_cluster_count": semantic_rows,
        "semantic_cluster_minimum_pass": semantic_rows >= 40,
        "clean_package_violation_count": missing_count(clean_result.stdout),
        "outline_lock_status": "pass" if run_script("validate_course_outline_lock.py").returncode == 0 else "fail",
        "no_side_effect_validation_status": status_for("scripts/validate_no_side_effects.py"),
        "release_archive_validator_status": status_for("scripts/validate_release_archive.py"),
        "test_traceability_status": "pass" if run_script("validate_test_traceability.py").returncode == 0 else "fail",
        "complexity_baseline_status": status_for("docs/quality/COMPLEXITY_BASELINE.md"),
        "complexity_threshold_violations": complexity_violations(),
        "ai_usage_example_status": status_for("examples/example_feature_task/AI_USAGE_REVIEW.md"),
        "process_compliance_template_status": status_for("templates/PROCESS_COMPLIANCE_REPORT.md"),
        "full_validation_orchestrator_status": status_for("scripts/run_full_validation.py"),
        "task_artifact_validation_status": status_script("validate_task_artifacts.py"),
        "traceability_graph_status": status_script("validate_traceability_graph.py"),
        "ai_review_average_score": ai_average_score(),
        "complexity_exception_count": complexity_exception_count,
        "complexity_over_20_count": complexity_over_20_count,
        "complexity_temporary_exception_count": complexity_exception_count,
        "complexity_expired_exception_count": complexity_expired_count,
        "maturity_report_status": status_for("docs/reports/GOVERNANCE_MATURITY_REPORT.md"),
        "mutation_plan_template_status": status_for("templates/MUTATION_TESTING_PLAN.md"),
        "deployment_template_status": status_for("templates/DEPLOYMENT_PLAN_TEMPLATE.md"),
        "maintenance_task_template_status": status_for("templates/MAINTENANCE_TASK_TEMPLATE.md"),
        "clean_test_wrapper_status": status_for("scripts/run_tests_clean.py"),
        "glossary_status": status_for("docs/GLOSSARY.md"),
        "process_template_status": status_for("templates/PROCESS_DECISION_TEMPLATE.md"),
        "project_context_template_status": status_for("templates/PROJECT_CONTEXT_TEMPLATE.md"),
        "test_strategy_template_status": status_for("templates/TEST_STRATEGY_TEMPLATE.md"),
        "architecture_scenario_template_status": status_for("templates/ARCHITECTURE_SCENARIO_TEMPLATE.md"),
        "maintenance_docs_count": sum(1 for name in ["CHANGELOG.md", "VERSIONING.md", "MAINTENANCE_GUIDE.md", "SUPPORT_RUNBOOK.md", "DEPRECATION_POLICY.md"] if (ROOT / name).exists()),
        "validators_count": len(list((ROOT / "scripts").glob("validate_*.py"))),
        "smell_baseline_sync_status": status_script("validate_smell_baseline_sync.py"),
        "test_performance_status": pytest_mode_status(),
        "semantic_coverage_score": semantic.get("score", 0),
        "semantic_too_broad_cluster_count": semantic.get("too_broad_cluster_count", 0),
        "outer_archive_validator_status": status_for("scripts/validate_outer_archive.py"),
        "example_task_count": count_files("examples", "example_*_task"),
        "evidence_package_average_score": evidence_package_average(),
        "governance_maturity_min_score": maturity_min_score(),
        "governor_config_status": status_script("validate_governor_config.py"),
        "release_archive_version": config["release_archive"],
    }
    print(json.dumps(metrics, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
