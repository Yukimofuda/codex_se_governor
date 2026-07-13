#!/usr/bin/env python3
"""Score engineering evidence completeness for examples and tasks."""

from pathlib import Path
import argparse
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
REQ_RE = re.compile(r"\b(?:FR|NFR)-\d{3}\b")
AC_RE = re.compile(r"\bAC-\d{3}\b")
MAX_SCORE = 100


def package_dirs():
    directories = sorted(path for path in (ROOT / "examples").glob("example_*_task") if path.is_dir())
    tasks = ROOT / "tasks"
    if tasks.exists():
        directories.extend(sorted(path for path in tasks.iterdir() if path.is_dir() and not path.name.endswith("-smoke")))
    return directories


def read(path):
    return path.read_text(encoding="utf-8") if path.exists() else ""


def score_package(path):
    requirements = read(path / "REQUIREMENTS.md")
    matrix = read(path / "TEST_CASE_MATRIX.md")
    ai = read(path / "AI_USAGE_REVIEW.md").lower()
    security = read(path / "SECURITY_REVIEW.md").lower()
    process = read(path / "PROCESS_COMPLIANCE_REPORT.md").lower()
    deploy = read(path / "DEPLOYMENT_PLAN.md").lower()
    maintenance = read(path / "MAINTENANCE_TASK.md").lower()
    final = read(path / "FINAL_REPORT.md").lower()
    analysis = read(path / "ANALYSIS.md").lower()
    design = read(path / "DESIGN.md").lower()
    adr = read(path / "ADR.md").lower()
    risk = read(path / "RISK_REGISTER.md").lower()
    requirement_ids = sorted(set(REQ_RE.findall(requirements)))
    acceptance_ids = sorted(set(AC_RE.findall(requirements)))
    criteria = {
        "requirements_completeness": all(term in requirements.lower() for term in ["functional requirements", "non-functional requirements", "acceptance criteria"]),
        "acceptance_traceability": all(item in matrix for item in requirement_ids + acceptance_ids),
        "analysis_evidence": all(term in analysis for term in ["entity", "boundary", "control", "failure"]),
        "design_adr_evidence": all(term in design for term in ["module", "interface", "quality"]) and "decision" in adr,
        "test_evidence": all(term in matrix.lower() for term in ["test id", "requirement id", "coverage", "status"]),
        "risk_evidence": all(term in risk for term in ["residual risk", "trigger", "detection method", "review cadence"]),
        "security_evidence": all(term in security for term in ["threat", "trust boundaries", "deployment risk"]),
        "ai_review_evidence": all(term in ai for term in ["ai tool used", "human review yes/no", "final human decision"]),
        "process_compliance_evidence": all(term in process for term in ["selected process model", "release cadence", "retrospective evidence"]),
        "deployment_maintenance_evidence": all(term in deploy for term in ["rollback criteria", "monitoring"]) and all(term in maintenance for term in ["maintenance goal", "completion evidence"]),
        "final_report_completeness": all(term in final for term in ["requirements satisfied", "commands run", "rollback plan", "memory update suggestions"]),
    }
    score = round(sum(MAX_SCORE if value else 0 for value in criteria.values()) / len(criteria), 2)
    return {
        "path": str(path.relative_to(ROOT)),
        "score": score,
        "criteria": criteria,
    }


def build_payload():
    return [score_package(path) for path in package_dirs()]


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    args = parser.parse_args(argv)
    rendered = json.dumps(build_payload(), indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
        print(f"PASS wrote {args.output}")
    else:
        print(rendered, end="")
    return 0


if __name__ == "__main__":
    sys.exit(main())
