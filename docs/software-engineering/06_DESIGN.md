# Design

## Purpose

Convert analysis into maintainable structure with clear boundaries and quality trade-offs.

## Concepts from PDF

- Design moves from analysis model to UML/design model.
- Encapsulation hides representation and protects invariants.
- Abstraction uses interfaces or abstract classes to separate contract from implementation.
- Coupling should be low; cohesion should be high.
- Modularity and refactoring improve maintainability.

## Codex Rules

- Define module boundaries before editing shared behavior.
- Prefer interfaces where multiple implementations or isolation points exist.
- Use abstract classes only when shared behavior and state are intentional.
- Explain coupling/cohesion changes.
- Refactor only with behavior-preserving tests or explicit risk notes.

## Required Outputs

- Design document for non-trivial structural change.
- ADR for architecture-impacting decisions.
- SOLID and pattern review when relevant.

## Checklist

- [ ] Boundary and responsibility of each module are clear.
- [ ] Data ownership is explicit.
- [ ] Interfaces are stable and minimal.
- [ ] Coupling does not increase without justification.
- [ ] Cohesion improves or is preserved.
- [ ] Refactoring has regression coverage.

## Anti-patterns

- God class or god service.
- Abstracting before variation exists.
- Hidden behavior changes during refactor.

## Enforcement

- DESIGN_DOC_TEMPLATE
- ARCHITECTURE_DECISION_RECORD
- CODE_REVIEW_TEMPLATE
- PR checklist
