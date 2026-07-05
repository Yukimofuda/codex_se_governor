from pathlib import Path
import json
import subprocess
import sys
import zipfile

from tests.helpers import copy_subset_repo, run_script


def test_se_gate_passes_and_fails_on_dangerous_text(tmp_path):
    repo = copy_subset_repo(
        tmp_path,
        [
            "AGENTS.md",
            ".gitignore",
            "CHANGELOG.md",
            "VERSIONING.md",
            "MAINTENANCE_GUIDE.md",
            "SUPPORT_RUNBOOK.md",
            "DEPRECATION_POLICY.md",
            "governor.toml",
            "docs",
            "templates",
            ".github/pull_request_template.md",
            ".agents/skills/software-engineering-governor",
            "references/course",
            "scripts",
        ],
    )
    result = run_script(repo, "se_gate.py")
    assert result.returncode == 0
    dangerous = "api" + "_key = " + '"abcdef123456"'
    (repo / "danger.txt").write_text(dangerous, encoding="utf-8")
    result = run_script(repo, "se_gate.py")
    assert result.returncode == 1
    assert "dangerous text" in result.stdout


def test_validate_pr_checklist_fails_for_malformed_template(tmp_path):
    repo = copy_subset_repo(
        tmp_path,
        ["scripts/validate_pr_checklist.py", ".github/pull_request_template.md"],
    )
    template = repo / ".github" / "pull_request_template.md"
    template.write_text("# Pull Request\n\n## Testing\n", encoding="utf-8")
    result = run_script(repo, "validate_pr_checklist.py")
    assert result.returncode == 1
    assert "missing PR checklist item: Requirement trace" in result.stdout


def test_validate_traceability_fails_when_chapter_missing(tmp_path):
    repo = copy_subset_repo(
        tmp_path,
        ["scripts/validate_traceability.py", "docs/software-engineering/18_TRACEABILITY_MATRIX.md"],
    )
    matrix = repo / "docs" / "software-engineering" / "18_TRACEABILITY_MATRIX.md"
    matrix.write_text(matrix.read_text(encoding="utf-8").replace("17. Revision", "17. Review Summary"), encoding="utf-8")
    result = run_script(repo, "validate_traceability.py")
    assert result.returncode == 1
    assert "missing chapter: 17. Revision" in result.stdout


def test_generate_task_scaffold_includes_v07_task_artifacts(tmp_path):
    repo = copy_subset_repo(
        tmp_path,
        [
            "scripts/generate_task_scaffold.py",
            "templates/REQUIREMENTS_TEMPLATE.md",
            "templates/USER_STORY_TEMPLATE.md",
            "templates/ANALYSIS_MODEL_TEMPLATE.md",
            "templates/DESIGN_DOC_TEMPLATE.md",
            "templates/ARCHITECTURE_DECISION_RECORD.md",
            "templates/TEST_PLAN_TEMPLATE.md",
            "templates/TEST_CASE_MATRIX.md",
            "templates/RISK_REGISTER.md",
            "templates/SECURITY_REVIEW_TEMPLATE.md",
            "templates/AI_USAGE_REVIEW_TEMPLATE.md",
            "templates/PROCESS_COMPLIANCE_REPORT.md",
            "templates/DEPLOYMENT_PLAN_TEMPLATE.md",
            "templates/MAINTENANCE_TASK_TEMPLATE.md",
            "templates/FINAL_ENGINEERING_REPORT.md",
        ],
    )
    result = run_script(repo, "generate_task_scaffold.py", "feature-login-rate-limit")
    assert result.returncode == 0
    task_dir = repo / "tasks" / "feature-login-rate-limit"
    assert (task_dir / "AI_USAGE_REVIEW.md").exists()
    assert (task_dir / "PROCESS_COMPLIANCE_REPORT.md").exists()


def test_generate_task_scaffold_rejects_bad_arguments(tmp_path):
    repo = copy_subset_repo(tmp_path, ["scripts/generate_task_scaffold.py"])
    result = run_script(repo, "generate_task_scaffold.py")
    assert result.returncode == 2
    assert "Usage:" in result.stdout


def test_scan_for_engineering_smells_warns_without_trace_id_false_positives(tmp_path):
    repo = copy_subset_repo(tmp_path, ["scripts/scan_for_engineering_smells.py"])
    sample = repo / "sample.py"
    sample.write_text(
        "\n".join(
            [
                "# FIX" + "ME check edge case",
                "to" + "ken = 'abcdef123456'",
                "ev" + "al('1 + 1')",
                "timeout_seconds = " + "12" + "34" + "5",
                "# FR-001 AC-001 TC-001 R-001 NFR-001 are trace IDs",
            ]
        ),
        encoding="utf-8",
    )
    result = run_script(repo, "scan_for_engineering_smells.py", str(sample))
    assert result.returncode == 0
    assert "hardcoded secret" in result.stdout
    assert "dynamic code execution" in result.stdout
    assert "possible magic number 12345" in result.stdout
    assert "possible magic number 001" not in result.stdout


def test_validate_clean_package_fails_on_generated_files(tmp_path):
    repo = copy_subset_repo(tmp_path, ["scripts/validate_clean_package.py"])
    (repo / ".DS_Store").write_text("local", encoding="utf-8")
    result = run_script(repo, "validate_clean_package.py")
    assert result.returncode == 1
    assert "clean package violation" in result.stdout


def test_validate_outer_archive_detects_macos_artifacts(tmp_path):
    repo = copy_subset_repo(tmp_path, ["scripts/validate_outer_archive.py", "scripts/archive_rules.py"])
    archive = tmp_path / "bad.zip"
    with zipfile.ZipFile(archive, "w") as zf:
        zf.writestr("__MACOSX/._file", "bad")
    result = run_script(repo, "validate_outer_archive.py", str(archive))
    assert result.returncode == 1
    assert "generated artifact in outer archive" in result.stdout


def test_validate_governor_config_passes_and_fails(tmp_path):
    repo = copy_subset_repo(
        tmp_path,
        [
            "governor.toml",
            "README.md",
            "VERSIONING.md",
            "scripts/governor_config.py",
            "scripts/package_release.py",
            "scripts/validate_governor_config.py",
        ],
    )
    assert run_script(repo, "validate_governor_config.py").returncode == 0
    config = repo / "governor.toml"
    config.write_text(config.read_text(encoding="utf-8").replace('version = "0.7.0"', 'version = "0.7"'), encoding="utf-8")
    result = run_script(repo, "validate_governor_config.py")
    assert result.returncode == 1
    assert "version must follow semver" in result.stdout
