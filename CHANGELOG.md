# Changelog

## Version History

## v0.7
- Added `governor.toml` so release archive naming, version tagging, and validation no longer rely on hardcoded `v0.5` paths.
- Added smell baseline sync, semantic coverage scoring, evidence package scoring, governance maturity validation, outer archive validation, and test performance validation.
- Updated full validation orchestration to clean before and after tests, validate config, validate scored evidence, and validate release archives with the configured v0.7 path.
- Expanded example task set to bug-fix, refactor, architecture-change, and security-review workflows.
- Updated metrics, CI, pre-commit, README, maintenance docs, and release packaging guidance for v0.7 evidence gating.

## v0.6
- Expanded semantic course coverage from broad chapter clusters to evidence-grade rule clusters.
- Added clean pytest wrapper, task artifact validation, traceability graph validation, AI review scoring, maturity reporting, mutation plan validation, and deployment/maintenance task templates.
- Strengthened complexity baseline audit fields and release packaging guidance.
- Updated full validation, metrics, tests, README, CI, and examples for v0.6 governance.

## v0.5
- Added semantic course coverage and course outline lock validation.
- Added side-effect-aware validation and full validation orchestrator.
- Added clean release packaging and archive validation.
- Added test traceability validation and complexity threshold governance.
- Added AI usage and process compliance evidence to task scaffolds and examples.
- Strengthened risk register and project management validation.

## v0.4
- Added course reference handling under `references/course/`.
- Added full numbered course section coverage validation.
- Added clean package validation and cleanup.
- Added project context, process decision, elicitation, glossary, test strategy, and architecture scenario governance.
- Added maintenance, AI review, architecture, project management, and testing validators.

## v0.3
- Added measurable governance validators, metrics, smell baseline, architecture docs, project-management docs, adoption checker, and expanded pytest coverage.

## v0.2
- Added lifecycle docs, templates, Codex Skill, PR checklist, CI, pre-commit, scripts, examples, and script-level tests.

## Upgrade Path
- Run the v0.7 full validation command from `README.md`.
- Move course sources to `references/course/`.
- Update copied repositories with new templates and validators.

## Rollback Strategy
- Revert v0.7 files and restore the previous CI validator list if a downstream repository cannot adopt the stricter gates immediately.
