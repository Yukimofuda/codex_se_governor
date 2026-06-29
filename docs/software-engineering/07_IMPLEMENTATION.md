# Implementation

## Purpose

Ensure code realizes design with readable, maintainable, reviewable implementation practices.

## Concepts from PDF

- Implementation is more than programming.
- Code quality includes meaningful names, no magic numbers, duplicate removal, early return, and avoiding god classes.
- Code smells guide refactoring.
- Version control, automated tests, build workflow, code review, pair programming, CI, documentation, README, and API docs support quality.

## Codex Rules

- Read existing style before editing.
- Use meaningful names that reveal domain intent.
- Replace magic numbers with named constants when they encode policy.
- Remove meaningful duplication without broad rewrites.
- Prefer early returns to reduce nesting when readability improves.
- Keep commits/changes reviewable and reversible.

## Required Outputs

- Minimal implementation patch.
- Tests or documented test gap.
- Updated docs for changed behavior or API.

## Checklist

- [ ] Names reveal purpose.
- [ ] No unexplained magic policy values.
- [ ] Duplication is intentional or removed.
- [ ] Functions/classes have focused responsibility.
- [ ] Build/test command is documented.
- [ ] README/API docs updated when needed.

## Anti-patterns

- Large unrelated cleanup mixed with feature work.
- Passing tests by hard-coding sample data.
- Adding hidden dependency or global state.

## Enforcement

- scan_for_engineering_smells.py
- PR checklist
- CODE_REVIEW_TEMPLATE
- CI
