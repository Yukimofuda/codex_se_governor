#!/usr/bin/env python3
"""Validate required reusable template fields."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "templates"

REQUIRED = {
    "REQUIREMENTS_TEMPLATE.md": ["Stakeholders", "Problem Statement", "Functional Requirements", "Non-functional Requirements", "Constraints", "Assumptions", "Requirement Conflicts", "Acceptance Criteria", "Traceability ID"],
    "USER_STORY_TEMPLATE.md": ["Epic", "Story", "Role", "Goal", "Benefit", "Priority", "MoSCoW", "Story Points", "INVEST Checklist", "Acceptance Criteria", "Tasks"],
    "ACCEPTANCE_CRITERIA_TEMPLATE.md": ["Given", "When", "Then", "Normal Case", "Boundary Case", "Invalid Input", "Security Case", "Regression Case"],
    "ANALYSIS_MODEL_TEMPLATE.md": ["Domain Concepts", "Entities", "Boundary Objects", "Control Objects", "Relationships", "Multiplicity", "Data Flow", "Failure Modes"],
    "DESIGN_DOC_TEMPLATE.md": ["Design Goal", "Current Architecture", "Proposed Architecture", "Alternatives Considered", "Module Boundaries", "Interfaces", "Data Model", "SOLID Review", "Pattern Justification", "Quality Attribute Impact"],
    "ARCHITECTURE_DECISION_RECORD.md": ["Context", "Decision", "Alternatives", "Consequences", "Quality Attributes Affected", "Risk", "Rollback"],
    "TEST_PLAN_TEMPLATE.md": ["Scope", "Test Levels", "Test Strategy", "Tools", "Test Data", "Traceability", "Pass/Fail Criteria", "Regression Plan"],
    "TEST_CASE_MATRIX.md": ["Test ID", "Requirement ID", "Test Type", "Input", "Expected Output", "Reason", "Coverage", "Status"],
    "RISK_REGISTER.md": ["Risk ID", "Description", "Category", "Probability", "Impact", "Exposure", "Mitigation", "Contingency", "Residual risk", "Trigger", "Detection method", "Review cadence", "Owner", "Status"],
    "QUALITY_ATTRIBUTE_SCENARIOS.md": ["Attribute", "Stimulus", "Environment", "Response", "Response Measure", "Trade-off"],
    "SECURITY_REVIEW_TEMPLATE.md": ["Threat Model", "Trust Boundaries", "Input Validation", "Authentication", "Authorization", "Secrets", "Error Handling", "Logging", "Dependency Risk", "AI-generated Code Risk", "Deployment Risk"],
    "CODE_REVIEW_TEMPLATE.md": ["Requirement Trace", "Design Review", "Implementation Quality", "Test Adequacy", "Security Review", "Maintainability", "Documentation", "Risk", "Decision"],
    "RETROSPECTIVE_TEMPLATE.md": ["What Changed", "What Worked", "What Failed", "Root Cause", "Engineering Rule To Update", "Memory Update Suggestion", "Future Prevention"],
    "RELEASE_CHECKLIST.md": ["Build", "Test", "Security", "Documentation", "Migration", "Rollback", "Monitoring", "Known Risks"],
    "FINAL_ENGINEERING_REPORT.md": ["Requirements Satisfied", "Analysis Summary", "Design Decisions", "Files Changed", "Tests Added / Updated", "Commands Run", "Security Review", "Quality Review", "Documentation Updated", "Risks Remaining", "Rollback Plan", "Memory Update Suggestions"],
    "AI_USAGE_REVIEW_TEMPLATE.md": ["AI Tool Used", "Task Scope", "Generated Code Reviewed By Human", "Security-sensitive Areas", "Privacy-sensitive Areas", "IP/License Risk", "Bias/Fairness Risk", "Hallucination Risk", "Tests Added", "Final Human Decision"],
    "PROJECT_CONTEXT_TEMPLATE.md": ["System software", "Application software", "Desktop software", "Mobile application", "Web application", "Server software", "Cloud software", "Embedded software", "Gaming software", "VR/AR software", "IoT software", "Generic/off-the-shelf software", "Custom/bespoke software", "Data Handled", "Documentation Required", "User-facing Quality Attributes", "Developer-facing Quality Attributes"],
    "PROCESS_DECISION_TEMPLATE.md": ["Waterfall", "Agile", "Evolutionary model", "Rational Unified Process / RUP", "Spiral model", "V model", "Formal model", "Scrum", "Extreme Programming", "Lean", "DSDM", "Crystal Clear", "Process Selection Rationale", "Project risk", "Requirement stability", "Customer involvement", "Documentation level", "Release cadence"],
    "REQUIREMENTS_ELICITATION_LOG.md": ["Background reading", "Interview", "Observation", "Document analysis", "Questionnaire", "Stakeholder source", "Evidence", "Assumption", "Confidence", "Open question", "Requirement ID produced"],
    "GLOSSARY_TEMPLATE.md": ["Term", "Definition", "Source", "Related requirement", "Related module", "Ambiguity risk", "Owner"],
    "TEST_STRATEGY_TEMPLATE.md": ["Verification testing", "Defect testing", "Unit testing", "Integration testing", "System testing", "Acceptance testing", "Black-box testing", "White-box testing", "Equivalence partitioning", "Boundary testing", "Regression testing", "Statement coverage", "Branch coverage", "Condition coverage", "Path coverage", "Cyclomatic complexity", "TDD", "Mutation testing / mutation score", "Test oracle", "Pass/fail criteria"],
    "ARCHITECTURE_SCENARIO_TEMPLATE.md": ["Scenario ID", "Quality attribute", "Stimulus", "Environment", "Response", "Response measure", "Architecture view", "Test evidence", "Risk", "Trade-off"],
    "PROCESS_COMPLIANCE_REPORT.md": ["Selected process model", "Requirement stability", "Risk", "Agile iteration evidence", "Required documentation level", "Test timing", "Stakeholder feedback loop", "Release cadence", "Retrospective evidence"],
    "MUTATION_TESTING_PLAN.md": ["Mutation Scope", "Mutation Tool Or Manual Approach", "Mutation Score Target", "Equivalent Mutants", "Surviving Mutants", "Test Improvement Action", "Risk Accepted", "Owner", "Review Cadence"],
    "DEPLOYMENT_PLAN_TEMPLATE.md": ["Deployment Scope", "Preconditions", "Release Steps", "Monitoring", "Rollback Criteria", "Rollback Steps", "Known Risks", "Post-release Review"],
    "MAINTENANCE_TASK_TEMPLATE.md": ["Maintenance Goal", "System Area", "Maintenance Type", "Impact Analysis", "Test And Regression Plan", "Risk And Residual Risk", "Release Or Scheduling Window", "Completion Evidence"],
}


def main():
    failures = []
    for filename, fields in REQUIRED.items():
        path = TEMPLATES / filename
        if not path.exists():
            failures.append(f"missing template: {filename}")
            continue
        text = path.read_text(encoding="utf-8")
        lowered = text.lower()
        for field in fields:
            if field.lower() not in lowered:
                failures.append(f"{filename} missing field: {field}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
