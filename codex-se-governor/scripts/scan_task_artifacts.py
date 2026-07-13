#!/usr/bin/env python3
"""Template-aware safety scan for populated example and task evidence packages."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SECRET_RE = re.compile(r"(?:password|token|api[_-]?key|secret)\s*[:=]\s*['\"][^'\"]{6,}", re.IGNORECASE)
TODO_RE = re.compile(r"\b(?:TODO|FIXME)\b", re.IGNORECASE)
DYNAMIC_RE = re.compile(r"\b(?:eval|exec)\s*\(", re.IGNORECASE)
EXECUTABLE_LANGUAGES = {"python", "py", "javascript", "js", "typescript", "ts", "bash", "sh", "shell"}


def package_dirs():
    packages = sorted(path for path in (ROOT / "examples").glob("example_*_task") if path.is_dir())
    tasks = ROOT / "tasks"
    if tasks.exists():
        packages.extend(sorted(path for path in tasks.iterdir() if path.is_dir() and not path.name.endswith("-smoke")))
    return packages


def placeholder_line(line):
    stripped = line.strip()
    return bool(re.search(r"<[^>]+>|\{\{[^}]+\}\}|\[placeholder\]", stripped, re.IGNORECASE))


def scan_markdown(path):
    findings = []
    executable_fence = False
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        stripped = line.strip()
        if stripped.startswith("```"):
            language = stripped[3:].strip().lower()
            executable_fence = language in EXECUTABLE_LANGUAGES if language else False
            continue
        if placeholder_line(line):
            continue
        if SECRET_RE.search(line):
            findings.append(f"{path.relative_to(ROOT)}:{number}: accidental secret-like value")
        if TODO_RE.search(line):
            findings.append(f"{path.relative_to(ROOT)}:{number}: unresolved TODO/FIXME")
        if executable_fence and DYNAMIC_RE.search(line):
            findings.append(f"{path.relative_to(ROOT)}:{number}: dynamic code execution in executable snippet")
    return findings


def main():
    failures = []
    for package in package_dirs():
        review = package / "SECURITY_REVIEW.md"
        final = package / "FINAL_REPORT.md"
        if not review.exists():
            failures.append(f"{package.relative_to(ROOT)}: missing SECURITY_REVIEW.md")
        if not final.exists() or "security" not in final.read_text(encoding="utf-8").lower():
            failures.append(f"{package.relative_to(ROOT)}: FINAL_REPORT.md missing security review reference")
        for path in sorted(package.glob("*.md")):
            failures.extend(scan_markdown(path))
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
