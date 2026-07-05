#!/usr/bin/env python3
"""Validate semantic course coverage beyond section-number presence."""

from pathlib import Path
import json
import os
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / "docs" / "software-engineering" / "20_COURSE_SEMANTIC_COVERAGE.md"
ALLOWED_DEPTHS = {"automated-gate", "template-required", "PR-review-required", "human-review-required", "reference-only"}
GENERIC_PHRASES = ["covered by chapter-specific governance rules", "lifecycle review", "general review", "generic coverage"]
MIN_ROWS = 40
MAX_CLUSTER_SECTIONS = 25
STRONG_KEYWORDS = {
    "testing": ["test", "测试", "coverage", "mutation", "tdd"],
    "security": ["security", "安全", "auth", "secret"],
    "ai": ["ai", "人工智能"],
    "risk": ["risk", "风险"],
    "design": ["design", "设计", "solid", "pattern", "模式"],
    "process": ["process", "agile", "scrum", "过程", "敏捷"],
}
ENFORCEMENT_TERMS = ["script", "template", "pr checklist", "ci", "human review", "skill", "pre-commit", "baseline"]
NON_REFERENCE_KEYWORDS = ("test", "security", "risk", "ai", "architect", "requirement", "design", "process", "maintenance")


def load_outline():
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    result = subprocess.run([sys.executable, str(ROOT / "scripts" / "extract_course_outline.py")], cwd=ROOT, text=True, capture_output=True, check=False, env=env)
    if result.returncode != 0:
        return []
    return json.loads(result.stdout)


def expand_sections(spec, known):
    result = set()
    for part in [item.strip() for item in spec.split(",") if item.strip()]:
        if "-" in part:
            start, end = [item.strip() for item in part.split("-", 1)]
            matching = False
            for section in known:
                if section == start:
                    matching = True
                if matching:
                    result.add(section)
                if section == end:
                    matching = False
                    break
        elif part in known:
            result.add(part)
    return result


def parse_rows(text):
    rows = []
    for line in text.splitlines():
        if not line.startswith("| ") or line.startswith("|---") or "Course sections covered" in line:
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) == 9:
            rows.append(cells)
    return rows


def path_tokens(cell):
    tokens = []
    for token in re.split(r"[;,]", cell):
        token = token.strip()
        if token.startswith(("docs/", "templates/", "scripts/", ".github/", ".agents/", "examples/")):
            tokens.append(token)
    return tokens


def artifact_exists(token):
    path = ROOT / token
    return path.exists()


def text_keywords(text):
    words = set(re.findall(r"[A-Za-z][A-Za-z0-9_-]{2,}", text.lower()))
    words.update(re.findall(r"[\u4e00-\u9fff]{2,}", text))
    return {word for word in words if word not in {"the", "and", "with", "review", "template", "script"}}


def artifact_tokens(cell):
    return [token for token in path_tokens(cell) if token]


def validate_artifact_targets(index, artifact, depth, enforcement):
    failures = []
    tokens = artifact_tokens(artifact)
    if depth == "automated-gate":
        if not any(token.startswith("scripts/") for token in tokens):
            failures.append(f"row {index} automated-gate row must reference an existing script artifact")
    if depth == "template-required":
        if not any(token.startswith("templates/") for token in tokens):
            failures.append(f"row {index} template-required row must reference an existing template")
    if depth == "PR-review-required":
        if ".github/pull_request_template.md" not in artifact and "pr checklist" not in enforcement.lower():
            failures.append(f"row {index} PR-review-required row must reference .github/pull_request_template.md or PR checklist")
    if depth == "human-review-required" and "human review" in enforcement.lower() and "with" not in enforcement.lower():
        failures.append(f"row {index} human-review-required row must name the human review target")
    if depth != "reference-only":
        for token in tokens:
            if not artifact_exists(token):
                failures.append(f"row {index} artifact path does not exist: {token}")
    return failures


def validate_row(index, row, known, title_by_section):
    failures = []
    sections, concept, meaning, rule, artifact, enforcement, depth, evidence, limitation = row
    row_text = " ".join(row).lower()
    expanded = expand_sections(sections, known)
    if any(phrase in row_text for phrase in GENERIC_PHRASES):
        failures.append(f"row {index} uses generic coverage language")
    if not rule or len(rule) < 12:
        failures.append(f"row {index} has weak Codex rule")
    if not artifact or (artifact == "reference-only" and depth != "reference-only"):
        failures.append(f"row {index} lacks concrete artifact or reference-only justification")
    if depth not in ALLOWED_DEPTHS:
        failures.append(f"row {index} invalid coverage depth: {depth}")
    if not any(term in enforcement.lower() for term in ENFORCEMENT_TERMS):
        failures.append(f"row {index} has unenforceable enforcement method: {enforcement}")
    failures.extend(validate_artifact_targets(index, artifact, depth, enforcement))
    if not expanded:
        failures.append(f"row {index} maps no known course sections")
        return failures, expanded
    if len(expanded) > MAX_CLUSTER_SECTIONS and "justification:" not in limitation.lower():
        failures.append(f"row {index} covers {len(expanded)} sections without broad-cluster justification")
    title_text = " ".join(title_by_section.get(section, "") for section in expanded)
    title_terms = text_keywords(title_text)
    row_terms = text_keywords(" ".join([concept, meaning, rule]))
    aligned = bool(title_terms.intersection(row_terms))
    if not aligned:
        aligned = any(title in row_term or row_term in title for title in title_terms for row_term in row_terms if len(title) >= 2 and len(row_term) >= 2)
    if title_terms and row_terms and not aligned:
        failures.append(f"row {index} concept does not align with covered section titles")
    if any(keyword in row_text for keyword in NON_REFERENCE_KEYWORDS) and depth == "reference-only":
        failures.append(f"row {index} high-value engineering topic cannot be reference-only")
    combined = title_text.lower() + " " + row_text
    if any(any(term in combined for term in terms) for terms in STRONG_KEYWORDS.values()):
        if depth in {"human-review-required", "reference-only"} and "justification" not in limitation.lower() and "manual-only" not in limitation.lower():
            failures.append(f"row {index} weak depth for high-risk topic without justification")
    return failures, expanded


def main():
    failures = []
    outline = load_outline()
    known = [item["section"] for item in outline]
    title_by_section = {item["section"]: item["title"] for item in outline}
    if not DOC.exists():
        print("FAIL")
        print("- missing docs/software-engineering/20_COURSE_SEMANTIC_COVERAGE.md")
        return 1
    text = DOC.read_text(encoding="utf-8")
    rows = parse_rows(text)
    if len(rows) < MIN_ROWS:
        failures.append(f"semantic coverage has {len(rows)} rows, minimum is {MIN_ROWS}")
    covered = set()
    for index, row in enumerate(rows, start=1):
        row_failures, expanded = validate_row(index, row, known, title_by_section)
        failures.extend(row_failures)
        covered.update(expanded)
    missing = [section for section in known if section not in covered]
    for section in missing[:80]:
        failures.append(f"missing semantic coverage: {section} {title_by_section[section]}")
    if len(missing) > 80:
        failures.append(f"... {len(missing) - 80} more missing semantic sections")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
