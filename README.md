# codex-se-governor

`codex-se-governor` is a Software Engineering Lifecycle Governor for Codex. It is not a normal coding style guide, not a prompt collection, and not a course summary. It turns the EBU6304 Software Engineering lifecycle into reusable rules, templates, scripts, PR checks, CI gates, and a Codex Skill.

The goal is to force every non-trivial Codex software task through requirements, analysis, design, implementation, testing, security, documentation, review, maintenance, and retrospective thinking before code is treated as complete.

## Why Prompt Discipline Is Not Enough

Codex can generate plausible code quickly, but prompt intent alone does not guarantee requirement traceability, security review, test adequacy, architecture fit, or rollback thinking. This project externalizes those expectations into repository artifacts that can be loaded, reviewed, versioned, and checked.

## How the PDF Became a Governance System

The course chapters were mapped into enforceable artifacts:

- Software and quality become quality attributes, final report sections, and review criteria.
- Process and agile become lifecycle rules, task scaffolds, and iteration discipline.
- Requirements, stories, analysis, and design become templates and PR checklist items.
- Implementation, testing, secure development, SOLID, and patterns become review gates and smell checks.
- Project management, risk, ethics, AI, and revision become risk registers, security review, AI guardrails, and retrospective prompts.

See [docs/software-engineering/18_TRACEABILITY_MATRIX.md](docs/software-engineering/18_TRACEABILITY_MATRIX.md).

## Adopt in an Existing GitHub Repository

1. Copy `AGENTS.md`, `docs/`, `templates/`, `.agents/`, `scripts/`, `.github/`, and `.pre-commit-config.yaml` into the target repository.
2. Ask Codex to read `AGENTS.md` before any non-trivial task.
3. Use `python scripts/generate_task_scaffold.py "<task-name>"` for feature, bug, refactor, architecture, or security tasks.
4. Run `python scripts/se_gate.py` before opening a PR.
5. Keep the GitHub PR template and CI workflow enabled.

## AGENTS.md

`AGENTS.md` is the highest local rule file. It defines Codex as a software engineering execution agent, not a code generator. It requires context loading, requirements, stories, analysis, design, risk, implementation, testing, security, documentation, final reporting, and memory update suggestions.

## Codex Skill

The Skill lives at `.agents/skills/software-engineering-governor/SKILL.md`. For every non-trivial implementation, bug fix, refactor, test, security review, PR review, or maintenance task, load the Skill and its references before editing.

## Templates

Templates under `templates/` can be copied into real projects or generated into `tasks/<task-name>/`. They preserve traceability from requirements to tests, risk, security review, release, and final report.

## GitHub PR Template

The PR template requires evidence for requirement trace, user story, acceptance criteria, analysis, design, SOLID, implementation quality, testing, security, documentation, risk, rollback, commands run, and final review decision.

## CI Gate

`.github/workflows/se-quality-gate.yml` checks that governance files exist and validates the PR checklist and traceability matrix. It also runs npm or Python tests only when the target repository actually contains those project types.

## Pre-commit

The pre-commit config runs the standard-library Python gates:

```bash
python scripts/se_gate.py
python scripts/validate_pr_checklist.py
python scripts/validate_traceability.py
```

## Loading Standard Before Development

At the start of a non-trivial task, Codex must read:

1. `AGENTS.md`
2. `.agents/skills/software-engineering-governor/SKILL.md`
3. The referenced canon, checklist, decision rules, anti-patterns, and traceability matrix
4. The task scaffold files if present

## Limitations

The scripts are intentionally conservative and lightweight. They detect missing governance artifacts and obvious smells, but they do not prove correctness, security, fairness, architecture quality, or test sufficiency. Human review remains required.

## Future Improvements

- Add language-specific adapters for Java, Python, TypeScript, and web security checks.
- Add coverage importers for common CI systems.
- Add ADR consistency checks.
- Add dependency and license scanners when projects allow third-party tools.
- Add stronger task-to-test traceability validation.
