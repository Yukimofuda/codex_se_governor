from pathlib import Path
import os
import shutil
import subprocess
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def copy_path(src_root, dst_root, relative):
    src = src_root / relative
    dst = dst_root / relative
    if src.is_dir():
        shutil.copytree(src, dst)
    else:
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)


def copy_subset_repo(tmp_path, paths):
    repo = tmp_path / "repo"
    repo.mkdir()
    for relative in paths:
        copy_path(PROJECT_ROOT, repo, relative)
    return repo


def copy_full_repo(tmp_path):
    repo = tmp_path / "repo"
    shutil.copytree(
        PROJECT_ROOT,
        repo,
        ignore=shutil.ignore_patterns(
            ".git",
            ".pytest_cache",
            "__pycache__",
            "*.pyc",
            "dist",
            "tasks",
            "tests",
        ),
    )
    return repo


def run_script(repo, script, *args):
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    return subprocess.run(
        [sys.executable, str(repo / "scripts" / script), *args],
        cwd=repo,
        text=True,
        capture_output=True,
        check=False,
        env=env,
    )
