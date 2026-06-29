# Software Engineering Governor Overview

## Purpose

This overview explains how the EBU6304 lifecycle becomes a Codex governance system. Codex must act as an engineering agent whose output is traceable, testable, reviewable, secure, maintainable, and reversible.

## Concepts from PDF

- Software engineering is systematic, disciplined, and measurable development and maintenance.
- Quality is the foundation; process, methods, and tools serve quality.
- Software includes programs, data, documentation, configuration, tests, and operational knowledge.
- Lifecycle activities include specification, development, validation, evolution, project management, quality management, risk management, and maintenance.
- Traceability connects requirements, design, implementation, tests, and review evidence.

## Codex Rules

- Start from context and requirements, not code generation.
- Preserve traceability from requirement IDs to design decisions, tests, and final report.
- Use templates when task scope is larger than a trivial edit.
- Prefer small, reversible changes with explicit rollback.
- Treat quality attributes as design inputs, not afterthoughts.

## Required Outputs

- Engineering plan for non-trivial tasks.
- Requirement or story material when missing.
- Design rationale or ADR for architecture-level changes.
- Test evidence and security review.
- Final engineering report.

## Checklist

- [ ] Requirement source identified.
- [ ] Acceptance criteria are testable.
- [ ] Analysis names domain entities, boundaries, controls, and failure modes.
- [ ] Design explains coupling, cohesion, interfaces, and quality attributes.
- [ ] Tests cover normal, boundary, invalid, security, and regression cases.
- [ ] Security and risk reviews are documented.
- [ ] Rollback path is realistic.

## Anti-patterns

- Treating a prompt as a complete specification.
- Coding before reading the current system.
- Equating CI pass with product quality.
- Adding process artifacts that no one can review.

## Enforcement

- AGENTS.md
- templates
- PR checklist
- CI and pre-commit scripts
- Codex Skill references
- human review
