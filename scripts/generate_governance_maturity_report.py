#!/usr/bin/env python3
"""Generate a capability report from cached, non-recursive governance evidence."""

from pathlib import Path
import sys

sys.dont_write_bytecode = True

from governance_metrics import collect_metrics

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "docs" / "reports" / "GOVERNANCE_MATURITY_REPORT.md"


def status_for_threshold(value, threshold):
    if value is None:
        return "unknown"
    return "pass" if value >= threshold else "fail"


def evaluate(signals):
    statuses = [status for _name, status in signals]
    if any(status in {"fail", "timeout"} for status in statuses):
        return "2", "FAIL"
    if any(status == "unknown" for status in statuses):
        return "unknown", "UNKNOWN"
    return "5", "PASS"


def row(label, signals):
    score, status = evaluate(signals)
    evidence = "; ".join(f"{name}={value}" for name, value in signals)
    return f"| {label} | {score} | {status} | {evidence} |"


def render(metrics):
    statuses = metrics.get("validator_statuses", {})
    get = lambda name: statuses.get(name, "unknown")
    capability_rows = [
        row("Requirements and traceability capability", [("templates", get("validate_templates")), ("test traceability", get("validate_test_traceability"))]),
        row("Analysis and design capability", [("task artifacts", get("validate_task_artifacts")), ("traceability graph", get("validate_traceability_graph"))]),
        row("Testing capability", [("pytest isolation", get("validate_pytest_environment")), ("unit tests", get("tests_unit")), ("integration tests", get("tests_integration"))]),
        row("Security and AI capability", [("AI template", get("validate_ai_review_template")), ("AI evidence", get("validate_ai_review_evidence"))]),
        row("Risk and project capability", [("project management", get("validate_project_management")), ("template contract", get("validate_templates"))]),
        row("Course traceability capability", [("source lock", get("validate_course_source_lock")), ("outline lock", get("validate_course_outline_lock")), ("semantic coverage", get("validate_course_semantic_coverage"))]),
        row("Release and maintenance capability", [("configuration", get("validate_governor_config")), ("clean package", get("validate_clean_package_final") if get("validate_clean_package_final") != "unknown" else get("validate_clean_package")), ("maintenance docs", get("validate_maintenance_docs"))]),
    ]
    adoption_rows = [
        row("Core adoption readiness", [("SE gate", get("se_gate")), ("Skill", get("validate_skill")), ("configuration", get("validate_governor_config"))]),
        row("Local development readiness", [("pytest isolation", get("validate_pytest_environment")), ("unit tests", get("tests_unit"))]),
    ]
    package_rows = [
        row("Active task evidence maturity", [("task artifacts", get("validate_task_artifacts")), ("evidence score", status_for_threshold(metrics.get("evidence_package_average_score"), 85))]),
        row("Release package maturity", [("release archive", get("validate_release_archive")), ("source archive", get("validate_source_archive"))]),
    ]
    unknown = sorted(name for name, value in statuses.items() if value == "unknown")
    required_signals = {
        "release archive validation": get("validate_release_archive"),
        "source archive validation": get("validate_source_archive"),
        "e2e tests": get("tests_e2e"),
    }
    unknown.extend(name for name, value in required_signals.items() if value == "unknown")
    if not statuses:
        unknown.append("validation manifest unavailable")
    unknown = sorted(set(unknown))
    unavailable = "\n".join(f"- {item}" for item in unknown) if unknown else "- None for the current validation mode."
    return f"""# Governor Capability Maturity Report

## Purpose

This report scores the governor's validation capabilities. It does not claim that an adopting project's real requirements, architecture, security, or delivery process are mature.

## Governor Capability Maturity

| Capability | Score | Status | Independent evidence signals |
|---|---:|---|---|
{chr(10).join(capability_rows)}

## Adoption Readiness

| Readiness area | Score | Status | Independent evidence signals |
|---|---:|---|---|
{chr(10).join(adoption_rows)}

## Active Task And Package Maturity

| Evidence area | Score | Status | Independent evidence signals |
|---|---:|---|---|
{chr(10).join(package_rows)}

## Unavailable Evidence

{unavailable}

## Evidence Provenance

- Validation mode: `{metrics.get('validation_mode', 'unknown')}`.
- Validation result source: `{metrics.get('validation_manifest_status', 'unknown')}`.
- Semantic score is cached evidence: `{metrics.get('semantic_coverage_score')}`.
- Evidence package average is cached evidence: `{metrics.get('evidence_package_average_score')}`.
- Missing evidence remains `unknown`; it is never promoted to a passing score.

## Residual Risks

- Capability evidence proves governor behavior, not correctness of an adopting product.
- Semantic mappings and course provenance still require accountable human review.
- Runtime security, fairness, and mutation effectiveness need project-specific tools and data.
"""


def main():
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(render(collect_metrics()), encoding="utf-8")
    print(f"PASS wrote {REPORT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
