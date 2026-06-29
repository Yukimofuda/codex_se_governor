# Secure Development

## Purpose

Make security a design and implementation requirement, especially when AI assists coding.

## Concepts from PDF

- Secure development protects data, money, reputation, and legal compliance.
- AI-generated code can introduce insecure patterns and automation risk.
- Security evaluation considers vulnerability rate, severity, secure coding compliance, false sense of security, and hidden web app AI risks.
- Secure-focused prompts, a five-step safe AI coding workflow, review checklists, and testing checklists reduce risk.

## Codex Rules

- Identify threat model and trust boundaries for security-relevant work.
- Validate inputs at boundaries.
- Review authentication, authorization, secrets, logging, error handling, dependencies, and deployment.
- Treat AI-generated security-sensitive code as untrusted until reviewed and tested.
- Prefer safe defaults and least privilege.

## Required Outputs

- Security review for auth, data, network, dependency, or deployment changes.
- Security tests where feasible.
- Residual security risk notes.

## Checklist

- [ ] Threat model is stated.
- [ ] Trust boundaries are identified.
- [ ] Input validation and output encoding are reviewed.
- [ ] Authn/authz are enforced server-side.
- [ ] Secrets are not embedded in source.
- [ ] Errors do not leak sensitive internals.
- [ ] Dependencies and deployment risks are reviewed.

## Anti-patterns

- Relying on AI confidence for security.
- Client-side-only authorization.
- Suppressing certificate or validation failures.
- Logging sensitive data.

## Enforcement

- SECURITY_REVIEW_TEMPLATE
- se_gate.py dangerous text scan
- security issue template
- PR checklist
