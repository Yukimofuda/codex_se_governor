from pathlib import Path
import shutil
import subprocess
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def copy_project(tmp_path):
    target = tmp_path / "repo"
    shutil.copytree(
        PROJECT_ROOT,
        target,
        ignore=shutil.ignore_patterns(
            ".git",
            ".pytest_cache",
            "__pycache__",
            "tests",
            "tasks",
        ),
    )
    return target


def run_script(repo, script, *args):
    return subprocess.run(
        [sys.executable, str(repo / "scripts" / script), *args],
        cwd=repo,
        text=True,
        capture_output=True,
        check=False,
    )


def test_se_gate_passes_on_complete_project(tmp_path):
    repo = copy_project(tmp_path)
    result = run_script(repo, "se_gate.py")
    assert result.returncode == 0
    assert "PASS" in result.stdout


def test_se_gate_fails_when_required_artifact_missing(tmp_path):
    repo = copy_project(tmp_path)
    (repo / "AGENTS.md").unlink()
    result = run_script(repo, "se_gate.py")
    assert result.returncode == 1
    assert "missing required artifact: AGENTS.md" in result.stdout


def test_se_gate_fails_on_dangerous_text(tmp_path):
    repo = copy_project(tmp_path)
    dangerous = "api" + "_key = " + '"abcdef123456"'
    (repo / "danger.txt").write_text(dangerous, encoding="utf-8")
    result = run_script(repo, "se_gate.py")
    assert result.returncode == 1
    assert "dangerous text" in result.stdout
    assert "danger.txt" in result.stdout


def test_validate_pr_checklist_passes(tmp_path):
    repo = copy_project(tmp_path)
    result = run_script(repo, "validate_pr_checklist.py")
    assert result.returncode == 0
    assert "PASS" in result.stdout


def test_validate_pr_checklist_fails_for_malformed_template(tmp_path):
    repo = copy_project(tmp_path)
    pr_template = repo / ".github" / "pull_request_template.md"
    pr_template.write_text("# Pull Request\n\n## Testing\n", encoding="utf-8")
    result = run_script(repo, "validate_pr_checklist.py")
    assert result.returncode == 1
    assert "missing PR checklist item: Requirement trace" in result.stdout
    assert "missing PR checklist item: Rollback" in result.stdout


def test_validate_traceability_passes(tmp_path):
    repo = copy_project(tmp_path)
    result = run_script(repo, "validate_traceability.py")
    assert result.returncode == 0
    assert "PASS" in result.stdout


def test_validate_traceability_fails_when_chapter_missing(tmp_path):
    repo = copy_project(tmp_path)
    matrix = repo / "docs" / "software-engineering" / "18_TRACEABILITY_MATRIX.md"
    text = matrix.read_text(encoding="utf-8")
    matrix.write_text(text.replace("17. Revision", "17. Review Summary"), encoding="utf-8")
    result = run_script(repo, "validate_traceability.py")
    assert result.returncode == 1
    assert "missing chapter: 17. Revision" in result.stdout


def test_generate_task_scaffold_creates_expected_files(tmp_path):
    repo = copy_project(tmp_path)
    result = run_script(repo, "generate_task_scaffold.py", "feature-login-rate-limit")
    assert result.returncode == 0
    task_dir = repo / "tasks" / "feature-login-rate-limit"
    expected = {
        "REQUIREMENTS.md",
        "USER_STORY.md",
        "ANALYSIS.md",
        "DESIGN.md",
        "ADR.md",
        "TEST_PLAN.md",
        "TEST_CASE_MATRIX.md",
        "RISK_REGISTER.md",
        "SECURITY_REVIEW.md",
        "FINAL_REPORT.md",
    }
    assert expected == {path.name for path in task_dir.iterdir()}
    assert "Created tasks/feature-login-rate-limit" in result.stdout


def test_generate_task_scaffold_rejects_bad_arguments(tmp_path):
    repo = copy_project(tmp_path)
    result = run_script(repo, "generate_task_scaffold.py")
    assert result.returncode == 2
    assert "Usage:" in result.stdout


def test_scan_for_engineering_smells_warns_without_id_false_positives(tmp_path):
    repo = copy_project(tmp_path)
    sample = repo / "sample.py"
    dynamic_call = "ev" + "al("
    sample.write_text(
        "\n".join(
            [
                "# FIX" + "ME check edge case",
                "to" + "ken = 'abcdef123456'",
                f"{dynamic_call}'1 + 1')",
                "timeout_seconds = " + "12" + "34" + "5",
                "# FR-001 AC-001 TC-001 R-001 NFR-001 are trace IDs",
            ]
        ),
        encoding="utf-8",
    )
    result = run_script(repo, "scan_for_engineering_smells.py", str(sample))
    assert result.returncode == 0
    todo_label = "TO" + "DO" + "/FIX" + "ME"
    assert todo_label in result.stdout
    assert "hardcoded secret" in result.stdout
    assert "dynamic code execution" in result.stdout
    expected_magic = "possible magic number " + "12" + "34" + "5"
    assert expected_magic in result.stdout
    false_positive = "possible magic number " + "00" + "1"
    assert false_positive not in result.stdout
