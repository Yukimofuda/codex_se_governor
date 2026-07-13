from pathlib import Path
import hashlib
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


def test_validate_course_source_lock_passes_and_detects_content_drift(tmp_path):
    repo = copy_subset_repo(tmp_path, ["scripts/validate_course_source_lock.py"])
    source = repo / "references" / "course" / "软件工程全整理.md"
    source.parent.mkdir(parents=True)
    content = "1 软件工程导论\n1.1 本章内容\n"
    source.write_text(content, encoding="utf-8")
    outline = [{"section": "1", "title": "软件工程导论"}, {"section": "1.1", "title": "本章内容"}]
    docs = repo / "docs" / "software-engineering"
    docs.mkdir(parents=True)
    (docs / "COURSE_OUTLINE_LOCK.json").write_text(json.dumps(outline, ensure_ascii=False), encoding="utf-8")
    encoded = content.encode("utf-8")
    lock = {
        "schema_version": 1,
        "source": "references/course/软件工程全整理.md",
        "sha256": hashlib.sha256(encoded).hexdigest(),
        "byte_count": len(encoded),
        "newline_count": encoded.count(b"\n"),
        "course_section_count": len(outline),
        "origin": {"filename": "软件工程全整理(3).pdf", "sha256": "test", "pages": 266},
    }
    (docs / "COURSE_SOURCE_LOCK.json").write_text(json.dumps(lock, ensure_ascii=False), encoding="utf-8")
    assert run_script(repo, "validate_course_source_lock.py").returncode == 0
    source.write_text(content + "正文被改动\n", encoding="utf-8")
    result = run_script(repo, "validate_course_source_lock.py")
    assert result.returncode == 1
    assert "course source sha256 changed" in result.stdout


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
                "# SHA-256 identifies the locked course source",
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
    assert "possible magic number 256" not in result.stdout


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


def test_validate_outer_archive_detects_missing_required_utf8_path(tmp_path):
    repo = copy_subset_repo(tmp_path, ["scripts/validate_outer_archive.py", "scripts/archive_rules.py"])
    archive = tmp_path / "missing-path.zip"
    with zipfile.ZipFile(archive, "w") as zf:
        zf.writestr("codex-se-governor/README.md", "ok")
    result = run_script(repo, "validate_outer_archive.py", str(archive))
    assert result.returncode == 1
    assert "required archive path missing" in result.stdout


def test_validate_outer_archive_rejects_mojibake_course_path(tmp_path):
    repo = copy_subset_repo(tmp_path, ["scripts/validate_outer_archive.py", "scripts/archive_rules.py"])
    archive = tmp_path / "mojibake.zip"
    with zipfile.ZipFile(archive, "w") as zf:
        zf.writestr("codex-se-governor/references/course/软件工程全整理.md", "ok")
        zf.writestr("codex-se-governor/references/course/Φ╜»Σ╗╢σ╖Ñτ¿ïσà¿µò┤τÉå.md", "bad")
    result = run_script(repo, "validate_outer_archive.py", str(archive))
    assert result.returncode == 1
    assert "mojibake course path" in result.stdout


def test_validate_course_provenance_attestation_and_pdf_hash(tmp_path):
    repo = copy_subset_repo(
        tmp_path,
        [
            "scripts/validate_course_provenance.py",
            "docs/software-engineering/COURSE_PROVENANCE.json",
            "references/course/软件工程全整理.md",
        ],
    )
    result = run_script(repo, "validate_course_provenance.py")
    assert result.returncode == 0
    assert "attested" in result.stdout
    fake_pdf = tmp_path / "course.pdf"
    fake_pdf.write_bytes(b"test-pdf")
    provenance = repo / "docs" / "software-engineering" / "COURSE_PROVENANCE.json"
    data = json.loads(provenance.read_text(encoding="utf-8"))
    data["original_pdf_sha256"] = hashlib.sha256(fake_pdf.read_bytes()).hexdigest()
    provenance.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    result = run_script(repo, "validate_course_provenance.py", "--pdf", str(fake_pdf))
    assert result.returncode == 0
    assert "independently rechecked" in result.stdout
    fake_pdf.write_bytes(b"wrong")
    result = run_script(repo, "validate_course_provenance.py", "--pdf", str(fake_pdf))
    assert result.returncode == 1
    assert "PDF SHA-256" in result.stdout


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
    config.write_text(config.read_text(encoding="utf-8").replace('version = "0.7.2"', 'version = "0.7"'), encoding="utf-8")
    result = run_script(repo, "validate_governor_config.py")
    assert result.returncode == 1
    assert "version must follow semver" in result.stdout
