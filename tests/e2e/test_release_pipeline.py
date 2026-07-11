import json
import os
import subprocess
import sys
import time
import zipfile
import pytest

from tests.helpers import copy_full_repo, run_script


pytestmark = pytest.mark.e2e


def prepare_smoke_tests(repo):
    tests = repo / "tests" / "unit"
    tests.mkdir(parents=True)
    (tests / "test_smoke.py").write_text("def test_smoke():\n    assert True\n", encoding="utf-8")


def test_run_tests_clean_and_clean_package(tmp_path):
    repo = copy_full_repo(tmp_path)
    prepare_smoke_tests(repo)
    result = run_script(repo, "run_tests_clean.py", "--unit")
    assert result.returncode == 0
    assert "PASS tests completed" in result.stdout
    assert run_script(repo, "validate_clean_package.py").returncode == 0


def test_fast_validation_finishes_within_target(tmp_path):
    repo = copy_full_repo(tmp_path)
    prepare_smoke_tests(repo)
    started = time.monotonic()
    result = run_script(repo, "run_full_validation.py", "--fast")
    assert result.returncode == 0
    assert time.monotonic() - started < 60
    manifest = json.loads((repo / "dist" / "validation-results.json").read_text(encoding="utf-8"))
    assert manifest["validation_mode"] == "fast"
    assert manifest["total_duration_seconds"] < 60


def test_package_release_and_source_use_exact_v072_paths(tmp_path):
    repo = copy_full_repo(tmp_path)
    prepare_smoke_tests(repo)
    assert run_script(repo, "package_release.py").returncode == 0
    assert run_script(repo, "package_source.py").returncode == 0
    release = repo / "dist" / "codex-se-governor-v0.7.2.zip"
    source = repo / "dist" / "codex-se-governor-source-v0.7.2.zip"
    alias = repo / "dist" / "codex-se-governor-v0.7.zip"
    assert release.exists() and source.exists() and alias.exists()
    assert run_script(repo, "validate_release_archive.py", str(release)).returncode == 0
    assert run_script(repo, "validate_outer_archive.py", str(release)).returncode == 0
    assert run_script(repo, "validate_source_archive.py", str(source)).returncode == 0
    with zipfile.ZipFile(source) as zf:
        assert all("__MACOSX/" not in name for name in zf.namelist())
        assert any(name.endswith("references/course/软件工程全整理.md") for name in zf.namelist())
        assert all("/dist/" not in name for name in zf.namelist())
    extract_dir = tmp_path / "extract"
    with zipfile.ZipFile(source) as zf:
        zf.extractall(extract_dir)
    assert (extract_dir / "codex-se-governor" / "references" / "course" / "软件工程全整理.md").exists()
    manifest = json.loads((repo / "dist" / "RELEASE_MANIFEST.json").read_text(encoding="utf-8"))
    assert all(item["sha256"] for item in manifest["artifacts"])


def test_archive_clis_do_not_write_bytecode_without_wrapper_env(tmp_path):
    repo = copy_full_repo(tmp_path)
    prepare_smoke_tests(repo)
    env = os.environ.copy()
    env.pop("PYTHONDONTWRITEBYTECODE", None)
    for script, args in (
        ("package_release.py", []),
        ("package_source.py", []),
        ("validate_release_archive.py", ["dist/codex-se-governor-v0.7.2.zip"]),
        ("validate_source_archive.py", ["dist/codex-se-governor-source-v0.7.2.zip"]),
    ):
        result = subprocess.run(
            [sys.executable, str(repo / "scripts" / script), *args],
            cwd=repo,
            text=True,
            capture_output=True,
            check=False,
            env=env,
        )
        assert result.returncode == 0, result.stdout + result.stderr
    assert not list(repo.rglob("__pycache__"))
    assert not list(repo.rglob("*.pyc"))


def test_source_packaging_rejects_stale_dist_archive(tmp_path):
    repo = copy_full_repo(tmp_path)
    assert run_script(repo, "package_release.py").returncode == 0
    stale = repo / "dist" / "codex-se-governor-v0.5.zip"
    stale.write_bytes(b"stale")
    result = run_script(repo, "package_source.py")
    assert result.returncode == 1
    assert "stale undeclared distribution" in result.stdout


def test_source_archive_validator_rejects_mojibake_path(tmp_path):
    repo = copy_full_repo(tmp_path)
    prepare_smoke_tests(repo)
    assert run_script(repo, "package_release.py").returncode == 0
    assert run_script(repo, "package_source.py").returncode == 0
    source = repo / "dist" / "codex-se-governor-source-v0.7.2.zip"
    with zipfile.ZipFile(source, "a") as handle:
        handle.writestr("codex-se-governor/references/course/Φ╜»Σ╗╢σ╖Ñτ¿ïσà¿µò┤τÉå.md", "bad")
    result = run_script(repo, "validate_source_archive.py", str(source))
    assert result.returncode == 1
    assert "mojibake course path" in result.stdout
