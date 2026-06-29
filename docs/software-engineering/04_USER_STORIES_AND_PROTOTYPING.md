# User Stories And Prototyping

## Purpose

Turn needs into user-centered, estimable, testable work items.

## Concepts from PDF

- User story format: As a role, I want a goal, so that a benefit.
- Story card records priority, estimates, notes, and acceptance criteria.
- Epic/story/task hierarchy supports decomposition.
- Product backlog, MoSCoW, ROI, estimation, Fibonacci story points, and INVEST guide prioritization.
- Prototypes may be low, medium, or high fidelity to reduce requirement uncertainty.

## Codex Rules

- For user-facing changes, state role, goal, benefit, and acceptance criteria.
- Split epics into stories and tasks before implementation.
- Use MoSCoW or risk/value reasoning for priority.
- Use prototypes or UI descriptions when behavior is hard to explain textually.
- Apply INVEST before accepting a story for implementation.

## Required Outputs

- User story file or section.
- Given/When/Then acceptance criteria.
- Task breakdown for non-trivial work.

## Checklist

- [ ] Role, goal, and benefit are present.
- [ ] Acceptance criteria include normal, boundary, invalid, security, and regression cases.
- [ ] Priority and estimate are recorded.
- [ ] Story is independent, negotiable, valuable, estimable, small, and testable.
- [ ] Prototype fidelity matches risk.

## Anti-patterns

- Story says what to code but not why.
- Acceptance criteria duplicate implementation details.
- Estimation ignores uncertainty and dependencies.

## Enforcement

- USER_STORY_TEMPLATE
- ACCEPTANCE_CRITERIA_TEMPLATE
- issue templates
- PR checklist
