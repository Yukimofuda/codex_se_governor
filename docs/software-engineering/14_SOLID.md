# SOLID

## Purpose

Use SOLID as a design review tool, not as ceremony.

## Concepts from PDF

- SRP: one reason to change.
- OCP: open for extension, closed for modification.
- LSP: subtypes must be substitutable.
- ISP: clients should not depend on unused methods.
- DIP: high-level policy should depend on abstractions, not low-level details.
- SOLID relates to cohesion, coupling, dependency inversion, and interface boundaries.

## Codex Rules

- Use SRP to find mixed responsibilities.
- Use OCP only when variation is real or imminent.
- Check LSP before inheritance.
- Split interfaces when clients are forced to depend on irrelevant behavior.
- Invert dependencies at stable boundaries, not everywhere.

## Required Outputs

- SOLID review in design or code review for structural changes.
- Refactoring rationale tied to a concrete violation.

## Checklist

- [ ] Classes/modules have one primary responsibility.
- [ ] Extension points match real variation.
- [ ] Subtypes preserve expected behavior.
- [ ] Interfaces are client-focused.
- [ ] High-level policy is not coupled to volatile details.

## Anti-patterns

- Creating abstractions for hypothetical future cases.
- Inheritance used only for code reuse.
- Fat interfaces.
- Dependency inversion that makes simple code harder to understand.

## Enforcement

- DESIGN_DOC_TEMPLATE
- CODE_REVIEW_TEMPLATE
- PR checklist
- human review
