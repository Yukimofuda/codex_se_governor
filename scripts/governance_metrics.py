#!/usr/bin/env python3
"""Emit side-effect-free governance metrics from static files and cached results."""

from pathlib import Path
import argparse
import json
import sys

sys.dont_write_bytecode = True

from governor_config import load_config, version_is_expired
from validation_result import load_json, write_json

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"


def count_files(path, pattern):
    root = ROOT / path
    return len(list(root.rglob(pattern))) if root.exists() else 0


def pytest_discovered():
    tests = ROOT / "tests"
    if not tests.exists():
        return 0
    return sum(
        1
        for path in tests.rglob("test_*.py")
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.lstrip().startswith("def test_")
    )


def cache_artifacts():
    return sum(
        1
        for path in ROOT.rglob("*")
        if ".git" not in path.relative_to(ROOT).parts
        and (path.name in {".pytest_cache", "__pycache__", ".DS_Store", "__MACOSX"} or path.suffix == ".pyc")
    )


def course_reference_stats():
    root = ROOT / "references" / "course"
    files = sorted(path for path in root.rglob("*") if path.is_file()) if root.exists() else []
    line_count = 0
    for path in files:
        try:
            line_count += len(path.read_text(encoding="utf-8").splitlines())
        except UnicodeDecodeError:
            pass
    return len(files), line_count


def manifest_results(manifest):
    return {item.get("validator"): item for item in (manifest or {}).get("results", [])}


def result_status(results, name):
    return results.get(name, {}).get("status", "unknown")


def pass_zero(results, name):
    status = result_status(results, name)
    return 0 if status == "pass" else None if status == "unknown" else 1


def read_score(name, default=None):
    return load_json(DIST / name, default)


def average_score(rows, key="score"):
    if not isinstance(rows, list) or not rows:
        return None
    return round(sum(float(row.get(key, 0)) for row in rows) / len(rows), 2)


def complexity_baseline_counts():
    path = ROOT / "docs" / "quality" / "COMPLEXITY_BASELINE.md"
    if not path.exists():
        return 0, 0, 0, 0
    exceptions = temporary = over_20 = expired = 0
    current = load_config()["version"]
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("|---") or "Path" in line:
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) < 11:
            continue
        exceptions += 1
        temporary += cells[3] == "temporary-exception"
        try:
            over_20 += int(cells[2]) > 20
        except ValueError:
            pass
        expired += cells[3] == "temporary-exception" and version_is_expired(cells[8], current)
    return int(exceptions), int(temporary), int(over_20), int(expired)


def maturity_min_score():
    report = ROOT / "docs" / "reports" / "GOVERNANCE_MATURITY_REPORT.md"
    if not report.exists():
        return None
    scores = []
    unknown = False
    for line in report.read_text(encoding="utf-8").splitlines():
        if line.startswith("| "):
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            if len(cells) >= 2 and cells[1].isdigit():
                scores.append(int(cells[1]))
            elif len(cells) >= 2 and cells[1] == "unknown":
                unknown = True
    return None if unknown else min(scores) if scores else None


def static_course_counts():
    outline = load_json(ROOT / "docs" / "software-engineering" / "COURSE_OUTLINE_LOCK.json", [])
    coverage_path = ROOT / "docs" / "software-engineering" / "19_COURSE_SECTION_COVERAGE.md"
    coverage = coverage_path.read_text(encoding="utf-8") if coverage_path.exists() else ""
    covered = sum(1 for item in outline if f"| {item.get('section')} |" in coverage)
    return len(outline), covered


def semantic_rows():
    path = ROOT / "docs" / "software-engineering" / "20_COURSE_SEMANTIC_COVERAGE.md"
    if not path.exists():
        return 0
    return sum(1 for line in path.read_text(encoding="utf-8").splitlines() if line.startswith("| ") and not line.startswith("|---") and "Course sections covered" not in line)


def baseline_warning_count():
    path = ROOT / "docs" / "quality" / "SMELL_BASELINE.md"
    if not path.exists():
        return 0
    return sum(1 for line in path.read_text(encoding="utf-8").splitlines() if line.startswith("| ") and "| obsolete |" not in line and "| Path |" not in line)


def collect_metrics():
    config = load_config()
    manifest = load_json(DIST / "validation-results.json", {})
    results = manifest_results(manifest)
    semantic = read_score("semantic-coverage-score.json", {}) or {}
    evidence = read_score("evidence-package-score.json", [])
    ai = read_score("ai-review-score.json", [])
    complexity = read_score("complexity-report.json", [])
    release_manifest = read_score("RELEASE_MANIFEST.json", {}) or {}
    distribution_states = {item.get("kind"): item.get("status") for item in release_manifest.get("artifacts", [])}
    course_refs, course_lines = course_reference_stats()
    course_count, coverage_count = static_course_counts()
    exceptions, temporary, over_20, expired = complexity_baseline_counts()
    matrix = ROOT / "docs" / "software-engineering" / "18_TRACEABILITY_MATRIX.md"
    traceability_rows = sum(1 for line in matrix.read_text(encoding="utf-8").splitlines() if line.startswith("| ")) - 1 if matrix.exists() else 0
    return {
        "governor_version": config["version"],
        "validation_mode": manifest.get("validation_mode", "unknown"),
        "validation_manifest_status": "present" if manifest else "unknown",
        "validation_total_duration_seconds": manifest.get("total_duration_seconds"),
        "validator_statuses": {name: item.get("status", "unknown") for name, item in sorted(results.items())},
        "docs_count": count_files("docs/software-engineering", "*.md"),
        "templates_count": count_files("templates", "*.md"),
        "scripts_count": count_files("scripts", "*.py"),
        "tests_count": count_files("tests", "test_*.py"),
        "pytest_tests_discovered": pytest_discovered(),
        "issue_templates_count": count_files(".github/ISSUE_TEMPLATE", "*.md"),
        "github_workflows_count": count_files(".github/workflows", "*.yml"),
        "validators_count": len(list((ROOT / "scripts").glob("validate_*.py"))),
        "traceability_rows_estimate": max(0, traceability_rows),
        "cache_artifact_count": cache_artifacts(),
        "clean_package_violation_count": cache_artifacts(),
        "course_reference_count": course_refs,
        "course_reference_line_count": course_lines,
        "course_section_count": course_count,
        "course_coverage_count": coverage_count,
        "course_coverage_missing_count": max(0, course_count - coverage_count),
        "semantic_coverage_rows": semantic_rows(),
        "semantic_coverage_score": semantic.get("score"),
        "semantic_too_broad_cluster_count": semantic.get("too_broad_cluster_count"),
        "semantic_coverage_missing_count": pass_zero(results, "validate_course_semantic_coverage"),
        "evidence_package_average_score": average_score(evidence),
        "ai_review_average_score": average_score(ai),
        "complexity_report_function_count": len(complexity) if isinstance(complexity, list) else None,
        "complexity_exception_count": exceptions,
        "complexity_temporary_exception_count": temporary,
        "complexity_over_20_count": over_20,
        "complexity_expired_exception_count": expired,
        "complexity_threshold_violations": pass_zero(results, "validate_complexity_thresholds"),
        "smell_baseline_active_count": baseline_warning_count(),
        "smell_baseline_sync_status": result_status(results, "validate_smell_baseline_sync"),
        "course_source_lock_status": result_status(results, "validate_course_source_lock"),
        "outline_lock_status": result_status(results, "validate_course_outline_lock"),
        "course_provenance_status": result_status(results, "validate_course_provenance"),
        "pytest_environment_status": result_status(results, "validate_pytest_environment"),
        "test_traceability_status": result_status(results, "validate_test_traceability"),
        "task_artifact_validation_status": result_status(results, "validate_task_artifacts"),
        "traceability_graph_status": result_status(results, "validate_traceability_graph"),
        "governor_config_status": result_status(results, "validate_governor_config"),
        "release_archive_status": result_status(results, "validate_release_archive"),
        "source_archive_status": result_status(results, "validate_source_archive"),
        "release_artifact_manifest_status": distribution_states.get("release", "unknown"),
        "source_artifact_manifest_status": distribution_states.get("source", "unknown"),
        "compatibility_alias_manifest_status": distribution_states.get("compatibility_alias", "unknown"),
        "test_unit_status": result_status(results, "tests_unit"),
        "test_integration_status": result_status(results, "tests_integration"),
        "test_e2e_status": result_status(results, "tests_e2e"),
        "governance_maturity_min_score": maturity_min_score(),
        "release_archive_version": config["release_archive"],
        "source_archive_version": config["source_archive"],
    }


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    args = parser.parse_args(argv)
    metrics = collect_metrics()
    if args.output:
        write_json(args.output, metrics)
        print(f"PASS wrote {args.output}")
    else:
        print(json.dumps(metrics, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
