#!/usr/bin/env python3
"""Report approximate Python cyclomatic complexity using the standard AST."""

from pathlib import Path
import ast
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", ".pytest_cache", "__pycache__", ".venv", "venv", "env"}
DECISION_NODES = (ast.If, ast.For, ast.AsyncFor, ast.While, ast.ExceptHandler, ast.IfExp, ast.Match)


def iter_python_files():
    for path in sorted(ROOT.rglob("*.py")):
        rel = path.relative_to(ROOT)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        yield path


def complexity(node):
    score = 1
    for child in ast.walk(node):
        if isinstance(child, DECISION_NODES):
            score += 1
        elif isinstance(child, ast.BoolOp):
            score += max(1, len(child.values) - 1)
    return score


def main():
    rows = []
    for path in iter_python_files():
        try:
            tree = ast.parse(path.read_text(encoding="utf-8"))
        except SyntaxError as exc:
            rows.append({"file": str(path.relative_to(ROOT)), "error": str(exc)})
            continue
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                rows.append(
                    {
                        "file": str(path.relative_to(ROOT)),
                        "function": node.name,
                        "line": node.lineno,
                        "complexity": complexity(node),
                    }
                )
    print(json.dumps(rows, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
