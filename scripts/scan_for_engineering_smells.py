#!/usr/bin/env python3
"""Lightweight warning-only scan for engineering smells."""

from pathlib import Path
from collections import defaultdict
import ast
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".pytest_cache"}
TEXT_SUFFIXES = {".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cs", ".go", ".rb", ".php", ".md", ".yml", ".yaml", ".json"}

RISK_PATTERNS = [
    ("TODO/FIXME", re.compile(r"\b(TODO|FIXME)\b", re.IGNORECASE)),
    ("dynamic code execution", re.compile(r"\b(ev" + "al|ex" + "ec)\s*\(", re.IGNORECASE)),
    ("hardcoded secret", re.compile(r"(password|token|api[_-]?key|secret)\s*[:=]\s*['\"][^'\"]{6,}", re.IGNORECASE)),
]


def iter_files(paths):
    roots = [Path(p) for p in paths] if paths else [ROOT]
    for root in roots:
        base = root if root.is_absolute() else ROOT / root
        if base.is_file():
            yield base
            continue
        for path in base.rglob("*"):
            rel = path.relative_to(ROOT) if path.is_relative_to(ROOT) else path
            if any(part in SKIP_DIRS for part in rel.parts):
                continue
            if path.is_file() and path.suffix in TEXT_SUFFIXES:
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
            for label, pattern in RISK_PATTERNS:
                if pattern.search(line):
                    warn(path, i, label)
            for number in re.findall(r"(?<![A-Za-z0-9_])\d{3,}(?![A-Za-z0-9_])", line):
                if number not in {"200", "404", "500", "1000"}:
                    warn(path, i, f"possible magic number {number}")
            stripped = line.strip()
            if len(stripped) > 30:
                repeated[stripped].append((path, i))
    for value, locations in repeated.items():
        if len(locations) >= 4:
            path, line = locations[0]
            warn(path, line, "repeated large string appears 4 or more times")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
