---
name: software-engineering-governor
description: Use this skill for every non-trivial software engineering task, including implementation, bug fixing, refactoring, testing, architecture review, security review, documentation, PR review, and maintenance. It enforces the EBU6304 software engineering lifecycle, quality attributes, requirements discipline, analysis/design method, testing strategy, security workflow, SOLID review, design pattern discipline, and AI-assisted development guardrails.
---

# Software Engineering Governor Skill

Use this skill before every non-trivial software task.

## Mandatory Loading

Read these files before implementation:

1. `references/SE_CANON.md`
2. `references/SE_CHECKLIST.md`
3. `references/SE_DECISION_RULES.md`
4. `references/SE_ANTI_PATTERNS.md`
5. `references/SE_TRACEABILITY_MATRIX.md`

## Workflow

1. Load project context, `AGENTS.md`, related code, related tests, and relevant docs.
2. Output an Engineering Plan for non-trivial work.
3. Clarify or document requirements, user story, and acceptance criteria.
4. Perform analysis and design.
5. Review risk, quality, security, SOLID, and pattern pressure.
6. Implement the smallest reversible change.
7. Run relevant tests and governance checks.
8. Output a Final Engineering Report.
9. Provide memory update suggestions when a reusable lesson is discovered.

## Prohibited Behavior

- direct coding before context loading
- sample-specific patch
- broad rewrite without justification
- test skipping without reason and risk
- security skipping
- hidden dependency
- pattern overuse
- undocumented behavior change

## Final Report Shape

Use the repository `templates/FINAL_ENGINEERING_REPORT.md` sections.
