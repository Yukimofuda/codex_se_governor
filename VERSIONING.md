# Versioning

## Version History
- `v0.1`: initial governance concept.
- `v0.2`: lifecycle governance system.
- `v0.3`: measurable validators and self-audit.
- `v0.4`: full course section alignment and clean package governance.
- `v0.5`: semantic coverage, side-effect-free validation, and release-package hardening.
- `v0.6`: evidence-grade semantic density, clean pytest wrapper, task traceability graph, AI scoring, maturity reporting, and release guidance.
- `v0.7`: config-driven release versioning, semantic coverage scoring, evidence package scoring, maturity gates, outer archive validation, and performance-aware test orchestration.
- `v0.7.1`: course-source content integrity lock, corrected complexity metrics, and reduced semantic-validator complexity.

## Version Policy
- Minor versions add new governance artifacts or validators.
- Patch versions fix validator defects without changing required artifacts.
- Breaking governance gates must be documented in `CHANGELOG.md`.

## Deprecation Process
- Mark a template, script, or rule as deprecated for one minor version before removal.
- Provide the replacement artifact and migration guidance.

## Adoption Migration
- Run `python3 scripts/check_adoption.py /path/to/repo`.
- Copy missing core artifacts.
- Run the full validation sequence before enabling CI as required.
- For v0.7 and later, prefer `python3 scripts/run_full_validation.py`, `python3 scripts/run_tests_clean.py`, and archive validation before packaging.
