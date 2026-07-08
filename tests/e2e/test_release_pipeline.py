import json
import zipfile
import pytest

from tests.helpers import copy_full_repo, run_script


pytestmark = pytest.mark.e2e


def prepare_smoke_tests(repo):
    tests = repo / "tests"
    tests.mkdir()
    (tests / "test_smoke.py").write_text("def test_smoke():\n    assert True\n", encoding="utf-8")


def test_run_tests_clean_and_clean_package(tmp_path):
    repo = copy_full_repo(tmp_path)
    prepare_smoke_tests(repo)
    result = run_script(repo, "run_tests_clean.py", "tests/test_smoke.py")
    assert result.returncode == 0
    assert "PASS tests completed" in result.stdout
    assert run_script(repo, "validate_clean_package.py").returncode == 0


def test_run_full_validation_passes_on_clean_repo(tmp_path):
    repo = copy_full_repo(tmp_path)
    prepare_smoke_tests(repo)
    result = run_script(repo, "run_full_validation.py")
    assert result.returncode == 0
    assert "PASS full validation completed" in result.stdout


def test_package_release_uses_v07_config_archive_path(tmp_path):
    repo = copy_full_repo(tmp_path)
    result = run_script(repo, "package_release.py")
    assert result.returncode == 0
    archive = repo / "dist" / "codex-se-governor-v0.7.zip"
    assert archive.exists()
    assert run_script(repo, "validate_release_archive.py", str(archive)).returncode == 0
    assert run_script(repo, "validate_outer_archive.py", str(archive)).returncode == 0
    with zipfile.ZipFile(archive) as zf:
        assert all("__MACOSX/" not in name for name in zf.namelist())
        assert any(name.endswith("references/course/软件工程全整理.md") for name in zf.namelist())
    extract_dir = tmp_path / "extract"
    with zipfile.ZipFile(archive) as zf:
        zf.extractall(extract_dir)
    assert (extract_dir / "codex-se-governor" / "references" / "course" / "软件工程全整理.md").exists()
