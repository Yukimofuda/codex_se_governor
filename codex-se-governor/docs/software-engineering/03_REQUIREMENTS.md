# Requirements

## Purpose

Prevent implementation drift by forcing requirements to be explicit, verifiable, and traceable.

## Concepts from PDF

- Stakeholders provide different and sometimes conflicting needs.
- Requirements include functional requirements, non-functional requirements, constraints, assumptions, and conflicts.
- Requirement errors become more expensive later.
- Fact-finding includes background reading, interviews, observation, document analysis, and questionnaires.
- Non-functional requirements must be measurable and verifiable.

## Codex Rules

- Identify stakeholders and requirement source before coding.
- Separate functional requirements, NFRs, constraints, and assumptions.
- Reject or clarify unverifiable requirements.
- Record conflicts and chosen resolution.
- Assign traceability IDs for significant work.

## Required Outputs

- Requirements file or section.
- Acceptance criteria linked to requirement IDs.
- Conflict and assumption notes.

## Checklist

- [ ] Stakeholders listed.
- [ ] Functional requirements use observable behavior.
- [ ] NFRs include measurable response measures.
- [ ] Constraints and assumptions are explicit.
- [ ] Conflicts are documented.
- [ ] Each requirement can be tested or reviewed.

## Anti-patterns

- Treating user request text as complete requirements.
- Hiding assumptions in code.
- Using "fast", "secure", or "easy" without measurable meaning.

## Enforcement

- REQUIREMENTS_TEMPLATE
- ACCEPTANCE_CRITERIA_TEMPLATE
- PR checklist
- human review
