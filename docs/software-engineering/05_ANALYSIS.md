# Analysis

## Purpose

Understand the problem domain before designing the solution.

## Concepts from PDF

- Analysis focuses on the essence of the problem, not implementation details.
- Concept models identify classes/objects and relationships.
- Entity, boundary, and control classes organize responsibilities.
- EBC pattern separates domain data, user/system boundaries, and workflow control.
- Relationships include association, inheritance, and multiplicity.

## Codex Rules

- Name domain concepts and business rules before module design.
- Distinguish entity, boundary, and control responsibilities.
- Record relationships, multiplicities, and data flow for meaningful changes.
- Identify failure modes and external boundaries.

## Required Outputs

- Analysis model for significant work.
- Entity/boundary/control summary.
- Failure mode notes.

## Checklist

- [ ] Domain concepts listed.
- [ ] Entities have persistent or core business meaning.
- [ ] Boundary objects represent user/API/external interfaces.
- [ ] Control objects coordinate workflows.
- [ ] Associations and multiplicities are explicit.
- [ ] Failure modes are linked to tests or security review.

## Anti-patterns

- Jumping from requirement to framework code.
- Mixing UI, workflow, and domain state without justification.
- Ignoring multiplicity and relationship constraints.

## Enforcement

- ANALYSIS_MODEL_TEMPLATE
- DESIGN_DOC_TEMPLATE
- PR checklist
- human review
