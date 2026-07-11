#!/usr/bin/env python3
"""Run deterministic tiered validation and persist a result manifest."""

from pathlib import Path
import argparse
import os
import sys
import time

sys.dont_write_bytecode = True

from governor_config import load_config
from validation_result import ValidationResult, finalize_manifest, new_manifest, run_command, write_json

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
PYTHON = sys.executable
TIMEOUT_EXIT_CODE = 124


def spec(name, script, *args):
    return (name, [PYTHON, f"scripts/{script}", *args])


FAST_SPECS = [
    spec("clean_artifacts", "clean_artifacts.py"),
    spec("validate_clean_package", "validate_clean_package.py"),
    spec("se_gate", "se_gate.py"),
    spec("validate_pr_checklist", "validate_pr_checklist.py"),
    spec("validate_traceability", "validate_traceability.py"),
    spec("validate_doc_structure", "validate_doc_structure.py"),
    spec("validate_templates", "validate_templates.py"),
    spec("validate_skill", "validate_skill.py"),
    spec("validate_pytest_environment", "validate_pytest_environment.py"),
    spec("validate_smell_baseline", "validate_smell_baseline.py"),
    spec("validate_smell_baseline_sync", "validate_smell_baseline_sync.py"),
    spec("validate_course_source_lock", "validate_course_source_lock.py"),
    spec("validate_course_outline_lock", "validate_course_outline_lock.py"),
    spec("validate_course_provenance", "validate_course_provenance.py"),
    spec("validate_governor_config", "validate_governor_config.py"),
    spec("scan_task_artifacts", "scan_task_artifacts.py"),
    spec("tests_unit", "run_tests_clean.py", "--unit"),
    spec("validate_test_performance_unit", "validate_test_performance.py", "--suite", "unit"),
]

STANDARD_SPECS = [
    spec("validate_course_coverage", "validate_course_coverage.py"),
    spec("validate_course_semantic_coverage", "validate_course_semantic_coverage.py"),
    spec("semantic_coverage_score", "semantic_coverage_score.py", "--output", "dist/semantic-coverage-score.json"),
    spec("validate_semantic_coverage_score", "validate_semantic_coverage_score.py", "--input", "dist/semantic-coverage-score.json"),
    spec("validate_task_artifacts", "validate_task_artifacts.py"),
    spec("validate_traceability_graph", "validate_traceability_graph.py"),
    spec("validate_glossary", "validate_glossary.py"),
    spec("validate_test_strategy", "validate_test_strategy.py"),
    spec("validate_test_traceability", "validate_test_traceability.py"),
    spec("complexity_report", "complexity_report.py", "--output", "dist/complexity-report.json"),
    spec("validate_complexity_thresholds", "validate_complexity_thresholds.py", "--report", "dist/complexity-report.json"),
    spec("test_matrix_coverage_report", "test_matrix_coverage_report.py"),
    spec("validate_architecture_scenarios", "validate_architecture_scenarios.py"),
    spec("validate_project_management", "validate_project_management.py"),
    spec("validate_ai_review_template", "validate_ai_review_template.py"),
    spec("ai_review_score", "ai_review_score.py", "--output", "dist/ai-review-score.json"),
    spec("validate_ai_review_evidence", "validate_ai_review_evidence.py", "--input", "dist/ai-review-score.json"),
    spec("validate_process_compliance_template", "validate_process_compliance_template.py"),
    spec("validate_mutation_testing_plan", "validate_mutation_testing_plan.py"),
    spec("validate_maintenance_docs", "validate_maintenance_docs.py"),
    spec("evidence_package_score", "evidence_package_score.py", "--output", "dist/evidence-package-score.json"),
    spec("validate_evidence_package", "validate_evidence_package.py", "--input", "dist/evidence-package-score.json"),
    spec("tests_integration", "run_tests_clean.py", "--integration"),
    spec("validate_test_performance_integration", "validate_test_performance.py", "--suite", "integration"),
    spec("check_adoption", "check_adoption.py", "."),
]

REPORT_SPECS = [
    spec("governance_metrics", "governance_metrics.py", "--output", "dist/governance-metrics.json"),
    spec("generate_governance_maturity_report", "generate_governance_maturity_report.py"),
    spec("validate_governance_maturity", "validate_governance_maturity.py"),
]

RELEASE_SPECS = [
    spec("tests_e2e", "run_tests_clean.py", "--e2e"),
    spec("validate_test_performance_e2e", "validate_test_performance.py", "--suite", "e2e"),
    spec("package_release", "package_release.py"),
    spec("validate_release_archive", "validate_release_archive.py", "dist/codex-se-governor-v0.7.2.zip"),
    spec("validate_outer_archive", "validate_outer_archive.py", "dist/codex-se-governor-v0.7.2.zip"),
]

FINAL_CLEAN_SPECS = [
    spec("clean_artifacts_final", "clean_artifacts.py"),
    spec("validate_clean_package_final", "validate_clean_package.py"),
]


def mode_specs(mode):
    if mode == "fast":
        return list(FAST_SPECS)
    if mode == "standard":
        return [*FAST_SPECS, *STANDARD_SPECS, *REPORT_SPECS]
    return [*FAST_SPECS, *STANDARD_SPECS, *RELEASE_SPECS, *REPORT_SPECS, *FINAL_CLEAN_SPECS]


def mode_timeout(config, mode):
    return float(config["validation"][f"{mode}_timeout_seconds"])


def write_release_timing(started):
    elapsed = round(time.monotonic() - started, 3)
    write_json(
        DIST / "test-timing-release.json",
        {"schema_version": 1, "suite": "release", "elapsed_seconds": elapsed, "returncode": 0},
    )


def execute_specs(specs, mode, config, manifest_path, env=None):
    started = time.monotonic()
    manifest = new_manifest(config, mode)
    write_json(manifest_path, manifest)
    environment = dict(os.environ if env is None else env)
    environment["PYTHONDONTWRITEBYTECODE"] = "1"
    environment["PYTEST_DISABLE_PLUGIN_AUTOLOAD"] = "1"
    total_limit = mode_timeout(config, mode)
    validator_limit = float(config["validation"]["validator_timeout_seconds"])
    for name, command in specs:
        elapsed = time.monotonic() - started
        remaining = total_limit - elapsed
        if remaining <= 0:
            manifest["results"].append(
                ValidationResult(name, "timeout", round(elapsed, 3), [f"{mode} validation exceeded {total_limit:g}s total timeout"]).to_dict()
            )
            finalize_manifest(manifest, started)
            write_json(manifest_path, manifest)
            return TIMEOUT_EXIT_CODE
        timeout = max(0.1, min(validator_limit, remaining))
        print(f"$ {' '.join(command)}", flush=True)
        result, stdout, stderr = run_command(name, command, ROOT, environment, timeout)
        if stdout:
            print(stdout, end="")
        if stderr:
            print(stderr, end="", file=sys.stderr)
        manifest["results"].append(result.to_dict())
        write_json(manifest_path, manifest)
        if result.status != "pass":
            finalize_manifest(manifest, started)
            write_json(manifest_path, manifest)
            print(f"FAIL: {' '.join(command)} ended with {result.status} after {result.duration_seconds}s")
            return TIMEOUT_EXIT_CODE if result.status == "timeout" else 1
    if mode == "release":
        write_release_timing(started)
        performance_spec = spec("validate_test_performance_release", "validate_test_performance.py", "--suite", "release")
        name, command = performance_spec
        result, stdout, stderr = run_command(name, command, ROOT, environment, validator_limit)
        print(f"$ {' '.join(command)}")
        if stdout:
            print(stdout, end="")
        if stderr:
            print(stderr, end="", file=sys.stderr)
        manifest["results"].append(result.to_dict())
        if result.status != "pass":
            finalize_manifest(manifest, started)
            write_json(manifest_path, manifest)
            return 1
    finalize_manifest(manifest, started)
    write_json(manifest_path, manifest)
    print(f"PASS {mode} validation completed in {manifest['total_duration_seconds']}s")
    return 0


def parse_args(argv=None):
    parser = argparse.ArgumentParser()
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument("--fast", action="store_true")
    modes.add_argument("--standard", action="store_true")
    modes.add_argument("--release", action="store_true")
    parser.add_argument("--manifest", type=Path)
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    mode = "fast" if args.fast else "release" if args.release else "standard"
    config = load_config()
    manifest_path = args.manifest or ROOT / "dist" / "validation-results.json"
    return execute_specs(mode_specs(mode), mode, config, manifest_path)


if __name__ == "__main__":
    sys.exit(main())
