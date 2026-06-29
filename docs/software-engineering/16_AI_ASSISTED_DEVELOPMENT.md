# AI Assisted Development

## Purpose

Use AI to accelerate engineering while preserving review, testing, security, and human accountability.

## Concepts from PDF

- AI can assist requirements, design, code generation, refactoring, debugging, test generation, and documentation.
- Iterative AI workflow shortens feedback but increases hallucination and context risk.
- Guardrails include tests, review, security scanning, human supervision, and measurable improvements.
- Low-risk high-value adoption includes drafts, explanations, tests, scaffolding, and documentation.

## Codex Rules

- Use AI suggestions as drafts requiring verification.
- Prefer AI for low-risk repetitive work and review assistance.
- Require human or maintainer decision for core business rules, production incidents, and security-sensitive changes.
- Validate generated code with tests and security review.
- Track measurable improvement rather than output volume.

## Required Outputs

- AI risk note for AI-generated or AI-assisted significant changes.
- Tests and review evidence before accepting generated code.
- Memory update suggestion when a reusable lesson appears.

## Checklist

- [ ] AI output was reviewed against project context.
- [ ] Hallucination risk was checked by reading source/docs/tests.
- [ ] Edge cases were added or reviewed.
- [ ] Security-sensitive output was treated as untrusted.
- [ ] Human oversight remains clear.

## Anti-patterns

- Accepting AI code because it compiles.
- Letting AI decide requirements without stakeholder review.
- Generating large rewrites without traceability.

## Enforcement

- Skill workflow
- SECURITY_REVIEW_TEMPLATE
- FINAL_ENGINEERING_REPORT
- PR checklist
