# Process And Agile

## Purpose

Ensure Codex uses a deliberate process while preserving agile feedback and small releases.

## Concepts from PDF

- A software process organizes specification, development, validation, and evolution.
- Waterfall offers clear phases and documentation for stable or high-risk contexts.
- Agile uses iteration, frequent integration, small releases, customer collaboration, working software, and necessary documentation.
- Agile does not mean no design, no documentation, no process, or no quality control.

## Codex Rules

- Choose process weight based on risk, uncertainty, compliance, and change frequency.
- Keep changes small enough to review and roll back.
- Integrate and test frequently.
- Maintain only useful documentation, but do not omit decision-critical docs.

## Required Outputs

- Engineering plan for non-trivial tasks.
- Task scaffold for significant work.
- Final report with commands, risks, and rollback.

## Checklist

- [ ] Work is sliced into reviewable increments.
- [ ] Feedback point is identified.
- [ ] Necessary docs are updated.
- [ ] CI/pre-commit checks are considered.
- [ ] Agile is not used as an excuse to skip analysis.

## Anti-patterns

- Big-bang rewrite.
- "We are agile" as a reason to avoid acceptance criteria.
- Integration deferred until the end.

## Enforcement

- AGENTS.md lifecycle
- generate_task_scaffold.py
- PR checklist
- CI
- retrospective template
