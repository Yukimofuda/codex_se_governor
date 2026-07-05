# 4+1 View Of codex-se-governor

## Logical View

The system is a governance product made of rules, reusable artifacts, validators, and examples. Core logical modules:

- Rule layer: `AGENTS.md`, Skill, and Skill references.
- Knowledge layer: `docs/software-engineering/`.
- Template layer: `templates/`.
- Automation layer: `scripts/`, pre-commit, and GitHub Actions.
- Evidence layer: tests, metrics, smell baseline, PR checklist, and examples.

## Development View

The repository is organized by artifact responsibility:

- `docs/` contains human and Codex-readable engineering rules.
- `templates/` contains copyable lifecycle forms.
- `scripts/` contains standard-library validators and generators.
- `.agents/` contains Codex Skill packaging.
- `.github/` contains issue, PR, and CI integration.
- `tests/` verifies script behavior through subprocesses and temporary repo copies.

## Process View

Normal process:

1. Codex loads `AGENTS.md` and Skill references.
2. A task scaffold or issue/PR template captures requirements.
3. Validators check existence, structure, templates, traceability, Skill quality, smell baseline, and adoption readiness.
4. CI runs project tests when present.
5. Final report records evidence, risks, rollback, and memory suggestions.

## Physical / Deployment View

The governor is copied into target GitHub repositories. It has no server process. Runtime dependencies are Python standard library for validators and pytest for tests. GitHub Actions is the main remote execution environment; local execution uses pre-commit or direct Python commands.

## Scenarios

- Feature task: generate scaffold, fill requirements/design/test/security/risk, implement, run gates, open PR.
- PR review: reviewer checks PR template evidence plus CI outputs.
- Adoption: `check_adoption.py` validates that a target repo copied the core files.
- Maintenance: governance metrics and smell baseline reveal drift.
- Architecture scenario: `templates/ARCHITECTURE_SCENARIO_TEMPLATE.md` records quality attribute, stimulus, environment, response, response measure, architecture view, test evidence, risk, and trade-off. This is the +1 view evidence that connects architecture choices to measurable scenarios.

## Trade-offs

- Lightweight scripts are portable but less deep than language-specific analyzers.
- Markdown artifacts are easy to adopt but require validators to prevent drift.
- Subprocess tests match real CLI behavior but run slower than pure unit imports.
