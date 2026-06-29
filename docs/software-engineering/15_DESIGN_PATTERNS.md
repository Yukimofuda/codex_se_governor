# Design Patterns

## Purpose

Use design patterns only when a real recurring design pressure exists.

## Concepts from PDF

- A pattern has name, problem, solution, and consequences.
- Patterns support quality but can be misused.
- Patterns covered include Facade, Observer, Proxy, Singleton, Strategy, Factory, and Adapter.
- Least Knowledge Principle reduces unnecessary coupling.

## Codex Rules

- Name the problem before naming a pattern.
- State consequences and trade-offs of the selected pattern.
- Prefer simple design when no design pressure exists.
- Treat Singleton as high risk due to global state and testing/concurrency impact.
- Use Adapter for incompatible interfaces, Strategy for variable algorithms, Factory for object creation variation, Observer for change notification, Proxy for access control/lazy behavior, and Facade for simplifying complex subsystems.

## Required Outputs

- Pattern justification in design doc or PR.
- Alternative considered when adding a pattern.

## Checklist

- [ ] Pattern problem is real.
- [ ] Simpler alternative was considered.
- [ ] Consequences are documented.
- [ ] Coupling and testability impact are acceptable.
- [ ] Pattern does not hide behavior changes.

## Anti-patterns

- Pattern-first design.
- Singleton for convenience.
- Factory where direct construction is stable and clear.
- Observer without lifecycle/unsubscribe handling.

## Enforcement

- DESIGN_DOC_TEMPLATE
- CODE_REVIEW_TEMPLATE
- PR checklist
- human review
