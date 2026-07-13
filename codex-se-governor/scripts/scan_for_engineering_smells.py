#!/usr/bin/env python3
"""Lightweight warning-only scan for engineering smells."""

from pathlib import Path
from collections import defaultdict
import ast
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".pytest_cache", "__MACOSX", "dist"}
SKIP_PREFIXES = (
    Path("references") / "course",
    Path("examples"),
    Path("tests"),
    Path("tasks"),
    Path("web"),
)
SKIP_FILES = {
    Path("docs/quality/SMELL_BASELINE.md"),
    Path("docs/software-engineering/COURSE_OUTLINE_LOCK.json"),
    Path("docs/software-engineering/COURSE_SOURCE_LOCK.json"),
    Path(".agents/skills/software-engineering-governor/scripts/checklist_report.py"),
    Path("scripts/scan_task_artifacts.py"),
}
TEXT_SUFFIXES = {".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cs", ".go", ".rb", ".php", ".md", ".yml", ".yaml", ".json"}
CODE_SUFFIXES = {".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cs", ".go", ".rb", ".php"}

RISK_PATTERNS = [
    ("TODO/FIXME", re.compile(r"\b(TODO|FIXME)\b", re.IGNORECASE)),
    ("dynamic code execution", re.compile(r"\b(?:eval|exec)\s*\(", re.IGNORECASE)),
    ("hardcoded secret", re.compile(r"(password|token|api[_-]?key|secret)\s*[:=]\s*['\"][^'\"]{6,}", re.IGNORECASE)),
]

ENGINEERING_ID = re.compile(r"\b(?:FR|NFR|AC|TC|R|T|A|RC|PR|ADR|RA|GOV|GOV-CC|AS|EL|PCR|DEP|RB|MUT)-\d{3,}\b")
DATE_TOKEN = re.compile(r"\b\d{4}-\d{2}-\d{2}\b")
HASH_BITS = ("1", "2" + "24", "2" + "56", "3" + "84", "5" + "12")
HASH_ALGORITHM_TOKEN = re.compile(r"\bSHA-?(?:" + "|".join(HASH_BITS) + r")\b", re.IGNORECASE)
NUMBER_PATTERN = re.compile(r"(?<![A-Za-z0-9_])\d{3,}(?![A-Za-z0-9_])")
REPEATED_IGNORE_PREFIXES = (
    "ROOT = Path(__file__).resolve().parents[1]",
    'text = path.read_text(encoding="utf-8")',
    "if any(part in SKIP_DIRS for part in rel.parts):",
    'env["PYTHONDONTWRITEBYTECODE"] = "1"',
    "python3 scripts/",
    "assert run_script(",
    "result = run_script(",
    "if not ",
    "for field in REQUIRED:",
    "text = TEMPLATE.read_text",
    "failures.append(",
    'failures.append(f"{path.relative_to(ROOT)}',
    "cells = [cell.strip()",
    "return json.loads(",
    "rows = json.loads(",
    "metrics = json.loads(",
    "REQ_RE = re.compile(",
    "AC_RE = re.compile(",
    "RISK_RE = re.compile(",
    "parser = argparse.ArgumentParser()",
    "parser.add_argument(",
    "except (",
    "args.output.parent.mkdir(",
    "args.output.write_text(",
    "print(f\"PASS wrote {args.output}",
    "from governor_config import load_config",
    "write_json(manifest_path, manifest)",
    "finalize_manifest(manifest, started)",
    "|",
)


def iter_files(paths):
    roots = [Path(p) for p in paths] if paths else [ROOT]
    for root in roots:
        base = root if root.is_absolute() else ROOT / root
        if base.is_file():
            rel_base = base.relative_to(ROOT) if base.is_relative_to(ROOT) else base
            if rel_base not in SKIP_FILES:
                yield base
            continue
        for path in base.rglob("*"):
            rel = path.relative_to(ROOT) if path.is_relative_to(ROOT) else path
            if any(part in SKIP_DIRS for part in rel.parts):
                continue
            if any(rel == prefix or prefix in rel.parents for prefix in SKIP_PREFIXES):
                continue
            if path.is_file() and path.suffix in TEXT_SUFFIXES and rel not in SKIP_FILES:
                yield path


def warn(path, line, message):
    rel = path.relative_to(ROOT) if path.is_relative_to(ROOT) else path
    print(f"WARNING {rel}:{line}: {message}")


def scan_python_functions(path, text):
    try:
        tree = ast.parse(text)
    except SyntaxError:
        return
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if hasattr(node, "end_lineno") and node.end_lineno and node.end_lineno - node.lineno > 80:
                warn(path, node.lineno, f"long function '{node.name}' has {node.end_lineno - node.lineno + 1} lines")


def main(argv):
    repeated = defaultdict(list)
    for path in iter_files(argv[1:]):
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if path.suffix == ".py":
            scan_python_functions(path, text)
        for i, line in enumerate(text.splitlines(), start=1):
            stripped = line.strip()
            for label, pattern in RISK_PATTERNS:
                if pattern.search(line):
                    warn(path, i, label)
            if path.suffix in CODE_SUFFIXES and not re.match(r"^[A-Z][A-Z0-9_]*\s*=", stripped):
                line_without_ids = HASH_ALGORITHM_TOKEN.sub("", DATE_TOKEN.sub("", ENGINEERING_ID.sub("", line)))
                for number in NUMBER_PATTERN.findall(line_without_ids):
                    if number not in {"100", "200", "404", "500", "1000"}:
                        warn(path, i, f"possible magic number {number}")
            if len(stripped) > 30 and not stripped.startswith(REPEATED_IGNORE_PREFIXES):
                repeated[stripped].append((path, i))
    for value, locations in repeated.items():
        if len(locations) >= 4:
            path, line = locations[0]
            warn(path, line, "repeated large string appears 4 or more times")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
