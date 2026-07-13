# Pull Request Engineering Checklist

## Requirement Trace

- [ ] Requirement IDs are listed.
- [ ] Stakeholder or issue source is linked.

## User Story

- [ ] Role, goal, and benefit are clear.

## Acceptance Criteria

- [ ] Normal case covered.
- [ ] Boundary case covered.
- [ ] Invalid input covered.
- [ ] Security case covered where relevant.
- [ ] Regression case covered.

## Analysis

- [ ] Domain concepts, entities, boundaries, controls, relationships, and failure modes are described.

## Design / Architecture

- [ ] Module boundaries and interfaces are explained.
- [ ] ADR included for architecture-impacting changes.

## SOLID

- [ ] SRP/OCP/LSP/ISP/DIP reviewed where structural design changed.

## Implementation Quality

- [ ] Names, duplication, complexity, dependencies, and error handling reviewed.

## Testing

- [ ] Tests added or updated.
- [ ] Test gaps and residual risk documented.

## Security

- [ ] Threat model, trust boundaries, input validation, authn/authz, secrets, logging, errors, dependencies, and deployment risks reviewed.

## AI Usage Review

- [ ] AI_USAGE_REVIEW_TEMPLATE.md completed when AI contributed code, tests, design, or review.
- [ ] AI tool used is named.
- [ ] AI-generated code yes/no is stated.
- [ ] Human review yes/no is stated.
- [ ] Security-sensitive areas are reviewed.
- [ ] Privacy-sensitive areas are reviewed.
- [ ] IP/license risk is reviewed.
- [ ] Bias/fairness risk is reviewed.
- [ ] Hallucination risk is reviewed.
- [ ] Tests added are listed.
- [ ] Final human decision is recorded.

## Documentation

- [ ] README/API/user/operations docs updated or not applicable.

## Risk

- [ ] Probability, impact, mitigation, contingency, owner, and status recorded for meaningful risks.

## Rollback

- [ ] Rollback plan is documented and realistic.

## Commands Run

```text

```

## Final Review Decision

- [ ] Approve
- [ ] Request changes
- [ ] Block
