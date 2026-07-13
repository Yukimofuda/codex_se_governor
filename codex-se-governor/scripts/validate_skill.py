#!/usr/bin/env python3
"""Validate the software-engineering-governor Skill contract."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / ".agents" / "skills" / "software-engineering-governor" / "SKILL.md"
REFERENCES = [
    "SE_CANON.md",
    "SE_CHECKLIST.md",
    "SE_DECISION_RULES.md",
    "SE_ANTI_PATTERNS.md",
    "SE_TRACEABILITY_MATRIX.md",
]
DESCRIPTION_TERMS = ["implementation", "refactoring", "testing", "architecture review", "security review", "PR review"]


def metadata_block(text):
    match = re.match(r"---\n(.*?)\n---", text, re.DOTALL)
    return match.group(1) if match else ""


def main():
    failures = []
    if not SKILL.exists():
        print("FAIL\n- missing Skill file")
        return 1
    text = SKILL.read_text(encoding="utf-8")
    metadata = metadata_block(text)
    if not metadata:
        failures.append("missing YAML metadata block")
    if "name: software-engineering-governor" not in metadata:
        failures.append("metadata name must be software-engineering-governor")
    lowered = metadata.lower()
    for term in DESCRIPTION_TERMS:
        if term.lower() not in lowered:
            failures.append(f"description missing trigger term: {term}")
    ref_dir = SKILL.parent / "references"
    for ref in REFERENCES:
        if not (ref_dir / ref).exists():
            failures.append(f"missing reference: {ref}")
    body = text.lower()
    for required in ["engineering plan", "final engineering report", "direct coding", "sample-specific patch"]:
        if required not in body:
            failures.append(f"SKILL.md missing required rule: {required}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())

