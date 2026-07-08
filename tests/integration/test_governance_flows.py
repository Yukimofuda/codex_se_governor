import json
import sys

from tests.helpers import copy_full_repo, run_script


def test_validate_smell_baseline_sync_detects_stale_entry(tmp_path):
    repo = copy_full_repo(tmp_path)
    baseline = repo / "docs" / "quality" / "SMELL_BASELINE.md"
    line = "| stale.py | fake warning | accepted | owner | rationale | 2026-07-05 | v0.8 |\n"
    baseline.write_text(baseline.read_text(encoding="utf-8") + line, encoding="utf-8")
    result = run_script(repo, "validate_smell_baseline_sync.py")
    assert result.returncode == 1
    assert "active baseline entry should be obsolete" in result.stdout


def test_semantic_coverage_score_and_validator(tmp_path):
    repo = copy_full_repo(tmp_path)
    result = run_script(repo, "semantic_coverage_score.py")
    assert result.returncode == 0
    payload = json.loads(result.stdout)
    assert "score" in payload
    semantic = repo / "docs" / "software-engineering" / "20_COURSE_SEMANTIC_COVERAGE.md"
    semantic.write_text(semantic.read_text(encoding="utf-8").replace("templates/PROJECT_CONTEXT_TEMPLATE.md", "templates/MISSING_TEMPLATE.md", 2), encoding="utf-8")
    result = run_script(repo, "validate_semantic_coverage_score.py")
    assert result.returncode == 1
    assert "artifact" in result.stdout or "semantic coverage score below" in result.stdout


def test_evidence_package_score_and_validator(tmp_path):
    repo = copy_full_repo(tmp_path)
    result = run_script(repo, "evidence_package_score.py")
    assert result.returncode == 0
    rows = json.loads(result.stdout)
    assert len(rows) >= 5
    review = repo / "examples" / "example_feature_task" / "AI_USAGE_REVIEW.md"
    review.write_text("# AI Usage Review\n\n## AI Tool Used\nCodex\n", encoding="utf-8")
    result = run_script(repo, "validate_evidence_package.py")
    assert result.returncode == 1
    assert "missing evidence criterion" in result.stdout or "evidence package below" in result.stdout


def test_generate_and_validate_governance_maturity(tmp_path):
    repo = copy_full_repo(tmp_path)
    assert run_script(repo, "generate_governance_maturity_report.py").returncode == 0
    assert run_script(repo, "validate_governance_maturity.py").returncode == 0
    report = repo / "docs" / "reports" / "GOVERNANCE_MATURITY_REPORT.md"
    report.write_text(report.read_text(encoding="utf-8").replace("| Requirements maturity | 5 | PASS | v0.7 |", "| Requirements maturity | 2 | WATCH | v0.7 |"), encoding="utf-8")
    result = run_script(repo, "validate_governance_maturity.py")
    assert result.returncode == 1
    assert "maturity area below threshold" in result.stdout


def test_validate_test_performance_passes_and_fails(tmp_path):
    repo = copy_full_repo(tmp_path)
    tests = repo / "tests"
    tests.mkdir()
    (tests / "test_smoke.py").write_text("def test_smoke():\n    assert True\n", encoding="utf-8")
    assert run_script(repo, "validate_test_performance.py").returncode == 0
    baseline = repo / "docs" / "quality" / "TEST_PERFORMANCE_BASELINE.md"
    baseline.write_text(baseline.read_text(encoding="utf-8").replace("Suite threshold seconds: 30", "Suite threshold seconds: 0"), encoding="utf-8")
    result = run_script(repo, "validate_test_performance.py")
    assert result.returncode == 1
    assert "test suite exceeded threshold" in result.stdout


def test_validate_complexity_thresholds_rejects_expired_exception(tmp_path):
    repo = copy_full_repo(tmp_path)
    baseline = repo / "docs" / "quality" / "COMPLEXITY_BASELINE.md"
    baseline.write_text(
        baseline.read_text(encoding="utf-8").replace(
            "scripts/validate_course_coverage.py | main | 14 | accepted | governor-maintainer | Validator checks numeric coverage plus semantic document structure for backwards compatibility. | Keep course coverage failure tests and split if more matrix types are added. | 2026-07-01 | v0.7 | GOV-CC-003 | stable |",
            "scripts/validate_course_coverage.py | main | 14 | temporary-exception | governor-maintainer | Validator checks numeric coverage plus semantic document structure for backwards compatibility. | test obligation and refactoring plan. | 2026-07-01 | v0.6 | GOV-CC-003 | worsening |",
        ),
        encoding="utf-8",
    )
    result = run_script(repo, "validate_complexity_thresholds.py")
    assert result.returncode == 1
    assert "expired temporary complexity exception" in result.stdout


def test_validate_task_artifacts_and_traceability_graph_cover_all_examples(tmp_path):
    repo = copy_full_repo(tmp_path)
    assert run_script(repo, "validate_task_artifacts.py").returncode == 0
    assert run_script(repo, "validate_traceability_graph.py").returncode == 0


def test_governance_metrics_include_v07_fields(tmp_path):
    repo = copy_full_repo(tmp_path)
    tests = repo / "tests"
    tests.mkdir()
    (tests / "test_smoke.py").write_text("def test_smoke():\n    assert True\n", encoding="utf-8")
    run_script(repo, "generate_governance_maturity_report.py")
    result = run_script(repo, "governance_metrics.py")
    assert result.returncode == 0
    metrics = json.loads(result.stdout)
    for key in [
        "smell_baseline_sync_status",
        "test_performance_status",
        "semantic_coverage_score",
        "semantic_too_broad_cluster_count",
        "outer_archive_validator_status",
        "example_task_count",
        "evidence_package_average_score",
        "governance_maturity_min_score",
        "complexity_temporary_exception_count",
        "complexity_expired_exception_count",
        "governor_config_status",
        "release_archive_version",
    ]:
        assert key in metrics


def test_validate_no_side_effects_detects_generated_artifacts(tmp_path):
    repo = copy_full_repo(tmp_path)
    result = run_script(
        repo,
        "validate_no_side_effects.py",
        "--",
        sys.executable,
        "-c",
        "from pathlib import Path; Path('__pycache__').mkdir(exist_ok=True)",
    )
    assert result.returncode == 1
    assert "side effect artifact created: __pycache__" in result.stdout


def test_governance_metrics_is_side_effect_free(tmp_path):
    repo = copy_full_repo(tmp_path)
    tests = repo / "tests"
    tests.mkdir()
    (tests / "test_smoke.py").write_text("def test_smoke():\n    assert True\n", encoding="utf-8")
    result = run_script(repo, "validate_no_side_effects.py", "--", sys.executable, "scripts/governance_metrics.py")
    assert result.returncode == 0


def test_governance_metrics_does_not_reference_recursive_test_commands(tmp_path):
    repo = copy_full_repo(tmp_path)
    metrics = repo / "scripts" / "governance_metrics.py"
    text = metrics.read_text(encoding="utf-8")
    assert 'status_script("validate_test_performance.py")' not in text
    assert 'run_script("validate_test_performance.py")' not in text
    assert 'run_script("run_tests_clean.py")' not in text
    assert 'run_script("generate_governance_maturity_report.py")' not in text


def test_generate_governance_maturity_report_completes_without_recursion(tmp_path):
    repo = copy_full_repo(tmp_path)
    result = run_script(repo, "generate_governance_maturity_report.py")
    assert result.returncode == 0
    assert "PASS wrote" in result.stdout


def test_validate_test_performance_uses_fast_mode(tmp_path):
    repo = copy_full_repo(tmp_path)
    text = (repo / "scripts" / "validate_test_performance.py").read_text(encoding="utf-8")
    assert "--fast" in text


def test_default_pytest_configuration_excludes_e2e(tmp_path):
    repo = copy_full_repo(tmp_path)
    config = repo / "pytest.ini"
    assert config.exists()
    assert 'not e2e' in config.read_text(encoding="utf-8")
