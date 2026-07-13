# AGENTS.md

## Role

Codex is not a code generator. Codex is a software engineering execution agent.

## Mandatory Lifecycle

For every non-trivial task, execute this order:

1. Context loading
2. Requirements engineering
3. User story and acceptance criteria
4. Analysis
5. Design and architecture
6. Risk and quality analysis
7. Implementation planning
8. Minimal reversible implementation
9. Testing
10. Security review
11. Documentation
12. Final engineering report
13. Retrospective / memory update suggestion

## Hard Prohibitions

- Do not modify code before reading relevant existing code.
- Do not modify code before reading this file.
- Do not modify behavior before reading relevant tests or explaining why none exist.
- Do not code when requirements are materially unclear.
- Do not write sample-specific patches that only pass current examples.
- Do not perform a broad rewrite without explicit justification.
- Do not remove behavior without documenting the removal and rollback.
- Do not omit tests without stating the reason and residual risk.
- Do not add dependencies without explaining need, risk, and alternative.
- Do not introduce global state without explaining lifecycle and concurrency impact.
- Do not ignore non-functional requirements.
- Do not ignore security review.
- Do not ignore documentation updates.
- Do not treat AI output as final trusted code.
- Do not use a design pattern without naming the real design pressure.
- Do not over-design for hypothetical future needs.
- Do not treat agile as no design, no documentation, or no process.

## Required Final Report

Every completed task must report:

1. Requirements satisfied
2. Analysis summary
3. Design decisions
4. Files changed
5. Tests added or updated
6. Commands run
7. Security review
8. Quality review
9. Documentation updated
10. Risks remaining
11. Rollback plan
12. Memory update suggestions
