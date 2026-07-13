#!/usr/bin/env python3
"""Score semantic course coverage density and enforcement strength."""

from pathlib import Path
import argparse
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / "docs" / "software-engineering" / "20_COURSE_SEMANTIC_COVERAGE.md"
ALLOWED_DEPTHS = {"automated-gate", "template-required", "PR-review-required", "human-review-required", "reference-only"}
GENERIC_PHRASES = {"lifecycle review", "general review", "chapter-specific governance", "generic coverage"}
MAX_SCORE = 100


def parse_rows():
    rows = []
    for line in DOC.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("|---") or "Course sections covered" in line:
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) == 9:
            rows.append(cells)
    return rows


def expand_count(spec):
    count = 0
    for item in [part.strip() for part in spec.split(",") if part.strip()]:
        if "-" in item:
            start, end = item.split("-", 1)
            count += max(1, start.count(".") + end.count(".") + 1)
        else:
            count += 1
    return count


def build_payload():
    rows = parse_rows()
    counts = [expand_count(row[0]) for row in rows]
    generic_count = 0
    artifact_missing_count = 0
    automated_gate_count = 0
    template_required_count = 0
    pr_review_required_count = 0
    human_review_required_count = 0
    reference_only_count = 0
    too_broad_count = sum(1 for count in counts if count > 25)
    for row in rows:
        _sections, _concept, _meaning, _rule, artifact, _enforcement, depth, _evidence, _limitation = row
        lowered = " ".join(row).lower()
        if any(phrase in lowered for phrase in GENERIC_PHRASES):
            generic_count += 1
        if depth == "automated-gate":
            automated_gate_count += 1
        elif depth == "template-required":
            template_required_count += 1
        elif depth == "PR-review-required":
            pr_review_required_count += 1
        elif depth == "human-review-required":
            human_review_required_count += 1
        elif depth == "reference-only":
            reference_only_count += 1
        if depth != "reference-only":
            for token in [part.strip() for part in re.split(r"[;,]", artifact) if part.strip().startswith(("docs/", "templates/", "scripts/", ".github/", ".agents/", "examples/"))]:
                if not (ROOT / token).exists():
                    artifact_missing_count += 1
    score = MAX_SCORE
    score -= too_broad_count * 2
    score -= generic_count * 5
    score -= artifact_missing_count * 10
    score -= max(0, 2 - reference_only_count)
    return {
        "cluster_count": len(rows),
        "average_sections_per_cluster": round(sum(counts) / len(counts), 2) if counts else 0,
        "automated_gate_count": automated_gate_count,
        "template_required_count": template_required_count,
        "pr_review_required_count": pr_review_required_count,
        "human_review_required_count": human_review_required_count,
        "reference_only_count": reference_only_count,
        "too_broad_cluster_count": too_broad_count,
        "generic_phrase_count": generic_count,
        "artifact_missing_count": artifact_missing_count,
        "score": max(0, score),
    }


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    args = parser.parse_args(argv)
    payload = build_payload()
    rendered = json.dumps(payload, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
        print(f"PASS wrote {args.output}")
    else:
        print(rendered, end="")
    return 0


if __name__ == "__main__":
    sys.exit(main())
