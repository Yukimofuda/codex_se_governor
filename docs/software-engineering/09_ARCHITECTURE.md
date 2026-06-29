# Architecture

## Purpose

Make high-level structure, quality attributes, and trade-offs explicit before structural changes.

## Concepts from PDF

- Software architecture defines components and connectors.
- Architecture concerns include complexity, communication, deployment, scalability, reliability, and maintainability.
- 4+1 view model uses logical, development, process, physical, and scenario views.
- Common architectures include layered, web, client-server, MVC, distributed systems, cloud, load balancing, RESTful, and mobile architectures.
- Architecture choice is driven by context and quality attributes.

## Codex Rules

- Use ADRs for architecture-impacting changes.
- Identify components, connectors, trust boundaries, and deployment impact.
- State quality attributes affected by architecture choices.
- Use RESTful constraints deliberately for APIs.
- Explain trade-offs, not just preferred solution.

## Required Outputs

- ADR for architecture changes.
- Quality attribute scenario when architecture affects NFRs.
- Migration and rollback notes.

## Checklist

- [ ] Components and connectors are named.
- [ ] Relevant 4+1 views are considered.
- [ ] Architecture pattern is justified by context.
- [ ] Scalability, reliability, security, and maintainability trade-offs are explicit.
- [ ] Deployment and rollback are described.

## Anti-patterns

- Choosing architecture by trend.
- Treating MVC/layered/microservice labels as proof of design quality.
- Ignoring operational and deployment concerns.

## Enforcement

- ARCHITECTURE_DECISION_RECORD
- QUALITY_ATTRIBUTE_SCENARIOS
- architecture issue template
- PR checklist
