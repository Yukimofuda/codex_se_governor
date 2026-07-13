# Software Engineering Decision Rules

## Requirements

- If acceptance criteria are missing, create draft criteria before coding.
- If NFRs are vague, convert them to response measures or record them as review risks.
- If requirements conflict, do not hide the conflict in implementation.

## Design

- If the change crosses module boundaries, create or update a design note.
- If it changes architecture, create an ADR.
- If an abstraction does not isolate real variation or dependency risk, keep the design simpler.

## Testing

- If behavior changes, at least one requirement-linked test or documented test gap is required.
- If a bug is fixed, add a regression test unless technically impossible.
- If a branch contains security or failure handling, include a negative test or review note.

## Security

- If code touches auth, user input, sensitive data, dependencies, deployment, logging, or errors, complete a security review.
- If AI generated security-sensitive code, treat it as untrusted until reviewed and tested.

## Patterns

- Use Strategy for variable algorithms, Adapter for incompatible interfaces, Facade for complex subsystem simplification, Observer for notification, Proxy for controlled access, Factory for creation variation, and Singleton only with strong lifecycle justification.

