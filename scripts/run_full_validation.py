#!/usr/bin/env python3
"""Run the full governor validation sequence in a safe order."""

from pathlib import Path
import os
import subprocess
import sys

sys.dont_write_bytecode = True

from governor_config import load_config

ROOT = Path(__file__).resolve().parents[1]
COMMANDS = [
    ["python3", "scripts/clean_artifacts.py"],
    ["python3", "scripts/validate_clean_package.py"],
    ["python3", "scripts/se_gate.py"],
    ["python3", "scripts/validate_pr_checklist.py"],
    ["python3", "scripts/validate_traceability.py"],
    ["python3", "scripts/validate_doc_structure.py"],
    ["python3", "scripts/validate_templates.py"],
    ["python3", "scripts/validate_skill.py"],
    ["python3", "scripts/validate_smell_baseline.py"],
    ["python3", "scripts/validate_smell_baseline_sync.py"],
    ["python3", "scripts/validate_course_source_lock.py"],
    ["python3", "scripts/validate_course_outline_lock.py"],
    ["python3", "scripts/validate_course_coverage.py"],
    ["python3", "scripts/validate_course_semantic_coverage.py"],
    ["python3", "scripts/validate_semantic_coverage_score.py"],
    ["python3", "scripts/validate_task_artifacts.py"],
    ["python3", "scripts/validate_traceability_graph.py"],
    ["python3", "scripts/validate_glossary.py"],
    ["python3", "scripts/validate_test_strategy.py"],
    ["python3", "scripts/validate_test_traceability.py"],
    ["python3", "scripts/validate_complexity_thresholds.py"],
    ["python3", "scripts/complexity_report.py"],
    ["python3", "scripts/test_matrix_coverage_report.py"],
    ["python3", "scripts/validate_architecture_scenarios.py"],
    ["python3", "scripts/validate_project_management.py"],
    ["python3", "scripts/validate_ai_review_template.py"],
    ["python3", "scripts/validate_ai_review_evidence.py"],
    ["python3", "scripts/validate_process_compliance_template.py"],
    ["python3", "scripts/validate_mutation_testing_plan.py"],
    ["python3", "scripts/validate_maintenance_docs.py"],
    ["python3", "scripts/generate_governance_maturity_report.py"],
    ["python3", "scripts/validate_governance_maturity.py"],
    ["python3", "scripts/validate_governor_config.py"],
    ["python3", "scripts/evidence_package_score.py"],
    ["python3", "scripts/validate_evidence_package.py"],
    ["python3", "scripts/validate_test_performance.py"],
    ["python3", "scripts/validate_no_side_effects.py", "--", "python3", "scripts/governance_metrics.py"],
    ["python3", "scripts/governance_metrics.py"],
    ["python3", "scripts/check_adoption.py", "."],
    ["python3", "scripts/scan_for_engineering_smells.py"],
    ["python3", "scripts/package_release.py"],
    ["python3", "scripts/validate_release_archive.py"],
    ["python3", "scripts/clean_artifacts.py"],
    ["python3", "scripts/validate_clean_package.py"],
]


def main():
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    archive_path = ROOT / load_config()["release_archive"]
    commands = []
    for command in COMMANDS:
        if command == ["python3", "scripts/validate_release_archive.py"]:
            if not archive_path.exists():
                continue
            commands.append(["python3", "scripts/validate_release_archive.py", str(archive_path)])
            commands.append(["python3", "scripts/validate_outer_archive.py", str(archive_path)])
            continue
        commands.append(command)
    for command in commands:
        print(f"$ {' '.join(command)}")
        result = subprocess.run(command, cwd=ROOT, text=True, env=env, check=False)
        if result.returncode != 0:
            print(f"FAIL: {' '.join(command)} exited {result.returncode}")
            return result.returncode
    print("PASS full validation completed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
