#!/usr/bin/env python3
"""Generate a deterministic governance maturity report from metrics."""

from pathlib import Path
import json
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "docs" / "reports" / "GOVERNANCE_MATURITY_REPORT.md"


def load_metrics():
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "governance_metrics.py")],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
        env=env,
    )
    if result.returncode != 0:
        raise RuntimeError("governance_metrics.py failed")
    return json.loads(result.stdout)


def status(value):
    return "PASS" if value else "WATCH"


def score(value, watch=3, strong=4):
    if value >= strong:
        return 5
    if value >= watch:
        return 4
    if value > 0:
        return 3
    return 2


def render(metrics):
    semantic_ok = metrics.get("semantic_coverage_missing_count", 1) == 0 and metrics.get("semantic_cluster_count", 0) >= 40
    clean_ok = metrics.get("clean_package_violation_count", 1) == 0
    trace_ok = metrics.get("traceability_graph_status") == "pass"
    ai_ok = metrics.get("ai_review_average_score", 0) >= 8
    complexity_ok = metrics.get("complexity_threshold_violations", 1) == 0
    areas = [
        ("Requirements maturity", 5 if metrics.get("course_coverage_missing_count", 1) == 0 else 3),
        ("User story and acceptance maturity", 5 if metrics.get("test_traceability_status") == "pass" else 3),
        ("Analysis maturity", 4 if metrics.get("task_artifact_validation_status") == "pass" else 3),
        ("Design/architecture maturity", 5 if metrics.get("semantic_coverage_missing_count", 1) == 0 else 3),
        ("Implementation quality maturity", 5 if metrics.get("smell_baseline_sync_status") == "pass" else 3),
        ("Testing maturity", 5 if metrics.get("test_performance_status") == "pass" and metrics.get("complexity_threshold_violations", 1) == 0 else 3),
        ("Security maturity", 5 if metrics.get("ai_review_average_score", 0) >= 8 else 3),
        ("Ethics/AI maturity", 5 if metrics.get("ai_review_average_score", 0) >= 8 else 3),
        ("Risk/quality maturity", 4 if metrics.get("task_artifact_validation_status") == "pass" else 3),
        ("Project management maturity", 4 if metrics.get("maintenance_docs_count", 0) >= 5 else 3),
        ("Release/maintenance maturity", 5 if metrics.get("clean_package_violation_count", 1) == 0 else 3),
        ("Traceability maturity", 5 if trace_ok and semantic_ok else 3),
    ]
    rows = "\n".join(
        f"| {area} | {area_score} | {'PASS' if area_score >= 4 else 'WATCH'} | {'v0.7' if area_score >= 4 else 'v0.8'} |"
        for area, area_score in areas
    )
    return f"""# Governance Maturity Report

## Purpose

This report summarizes whether `codex-se-governor` is behaving like an evidence-grade software engineering governor rather than a static document bundle.

## Maturity Snapshot

| Area | Score | Status | Target version |
|---|---:|---|---|
{rows}

## Supporting Evidence

| Evidence Area | Evidence | Status |
|---|---|---|
| Course semantic coverage | {metrics.get('semantic_cluster_count', 0)} semantic clusters, {metrics.get('semantic_coverage_missing_count', 0)} missing sections | {status(semantic_ok)} |
| Clean package | {metrics.get('clean_package_violation_count', 0)} generated artifact violations | {status(clean_ok)} |
| Traceability graph | {metrics.get('traceability_graph_status', 'unknown')} | {status(trace_ok)} |
| AI review evidence | average score {metrics.get('ai_review_average_score', 0)} | {status(ai_ok)} |
| Complexity governance | {metrics.get('complexity_threshold_violations', 0)} threshold violations | {status(complexity_ok)} |
| Evidence packages | average score {metrics.get('evidence_package_average_score', 0)} | {status(metrics.get('evidence_package_average_score', 0) >= 85)} |
| Test performance | {metrics.get('test_performance_status', 'unknown')} | {metrics.get('test_performance_status', 'unknown').upper()} |
| Release archive validator | {metrics.get('release_archive_validator_status', 'unknown')} | {metrics.get('release_archive_validator_status', 'unknown').upper()} |

## Lifecycle Evidence

- Requirements, stories, analysis, design, tests, risk, security, AI review, process compliance, deployment, maintenance, final report, and retrospective evidence are required through templates and task validation.
- CI and pre-commit prefer the full ordered validation sequence.
- Course reference files are isolated from smell scanning but covered by outline, section, and semantic validators.

## Residual Risks

- Semantic coverage remains a curated mapping and still requires human review when course content changes.
- Complexity scoring is approximate and Python-specific.
- Mutation testing is represented as planning evidence; projects can attach real mutation tooling when available.

## Next Review

Review this report before each release, after course reference updates, and after adding new validator categories.
"""


def main():
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    metrics = load_metrics()
    REPORT.write_text(render(metrics), encoding="utf-8")
    print(f"PASS wrote {REPORT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
