# Revision Master Checklist

## Purpose

Provide the final lifecycle review gate before a task, PR, or release is considered complete. This file turns the PDF revision chapter into a single operational checklist.

## Concepts from PDF

- Software engineering begins by understanding software type, quality goals, and risk.
- Process choice must match requirement stability, uncertainty, and quality expectations.
- Requirements, user stories, analysis, design, architecture, implementation, tests, project management, risk, ethics, security, SOLID, patterns, and AI guardrails must be reviewed together.
- Testing includes confirmation, defect discovery, levels, matrices, automation, and edge cases.
- Completion requires evidence, not just confidence.

## Codex Rules

- Run the full lifecycle checklist before final response or PR review.
- Do not treat one passed command as complete quality evidence.
- Link requirements to analysis, design, tests, security, risk, and rollback.
- Record remaining risks and memory update suggestions.

## Required Outputs

- Completed final engineering report.
- Test and command evidence.
- Security and quality review notes.
- Risks remaining and rollback plan.
- Retrospective or memory update suggestion when reusable learning exists.

## Checklist

### Software And Quality

- [ ] Software impact includes programs, data, docs, configuration, tests, and operations.
- [ ] User-facing and developer-facing quality attributes are reviewed.

### Process And Agile

- [ ] Work is sliced into small, reviewable, reversible increments.
- [ ] Necessary documentation is present.

### Requirements

- [ ] Stakeholders, functional requirements, NFRs, constraints, assumptions, and conflicts are explicit.
- [ ] NFRs are measurable or reviewable.

### User Stories And Acceptance

- [ ] Story has role, goal, benefit, priority, estimate, and acceptance criteria.
- [ ] Acceptance criteria include normal, boundary, invalid, security, and regression cases.

### Analysis

- [ ] Domain entities, boundary objects, control objects, relationships, multiplicity, data flow, and failure modes are identified.

### Design And Architecture

- [ ] Module boundaries, interfaces, data model, coupling, cohesion, and quality impacts are explained.
- [ ] ADR exists for architecture-impacting changes.

### Implementation

- [ ] Names are meaningful; policy values are named; duplication and nesting are controlled.
- [ ] No broad rewrite, hidden dependency, unexplained global state, or sample-specific patch.

### Testing

- [ ] Unit/integration/system/acceptance levels are selected appropriately.
- [ ] Test matrix links test IDs to requirement IDs.

### Project, Risk, And Quality

- [ ] Risk register records probability, impact, mitigation, contingency, owner, and status.
- [ ] Remaining risks are in the final report.

### Ethics, Security, And AI

- [ ] Privacy, bias, transparency, accountability, and IP risks are reviewed when relevant.
- [ ] Threat model, trust boundaries, authn/authz, secrets, dependency, error handling, logging, and deployment risks are reviewed.
- [ ] AI output is verified, tested, and reviewed.

### SOLID And Patterns

- [ ] SOLID review is tied to concrete responsibilities and dependencies.
- [ ] Any design pattern has problem, solution, consequences, and simpler alternative.

### Completion

- [ ] Commands run are recorded.
- [ ] Documentation updated or reason stated.
- [ ] Rollback plan is realistic.
- [ ] Memory update suggestions are provided when reusable learning exists.

## Anti-patterns

- Finishing because code compiles but lifecycle evidence is missing.
- Treating testing as only happy-path examples.
- Ignoring static-analysis warnings without triage.
- Adding architecture or patterns without quality-attribute pressure.
- Using AI-generated output without human review and tests.

## Enforcement

- AGENTS.md final report requirements.
- PR checklist.
- `validate_doc_structure.py`.
- `validate_templates.py`.
- `validate_smell_baseline.py`.
- Human review.

