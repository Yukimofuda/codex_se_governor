# Software And Quality

## Purpose

Use software quality as the base layer for all Codex work.

## Concepts from PDF

- Software = programs + data + documentation.
- Software types include system software, application software, web/mobile/cloud systems, generic products, and custom systems.
- User-facing quality attributes: functionality, usability, reliability, performance, security, compatibility, flexibility, interoperability, compliance, and scalability.
- Developer-facing quality attributes: maintainability, readability, modularity, testability, portability, evolvability, and understandability.

## Codex Rules

- Identify the software type and quality priorities before design.
- Document data and docs impact, not only code impact.
- Convert vague quality goals into measurable scenarios when possible.
- If a quality attribute is traded off, state the trade-off and owner.

## Required Outputs

- Quality attribute notes in design or final report.
- Updated README/API docs/config notes when behavior changes.
- Tests or review notes for relevant quality attributes.

## Checklist

- [ ] Programs, data, and documentation impact considered.
- [ ] Functional behavior is tied to acceptance criteria.
- [ ] Usability impact is described for user-facing changes.
- [ ] Reliability and failure behavior are tested or reviewed.
- [ ] Performance impact is considered for hot paths.
- [ ] Security and compliance impact are reviewed.
- [ ] Maintainability impact is explained.

## Anti-patterns

- Calling software complete when only source code changed.
- Optimizing one attribute while silently degrading another.
- Ignoring data migration or documentation.

## Enforcement

- AGENTS.md final report
- QUALITY_ATTRIBUTE_SCENARIOS template
- PR checklist
- human review
