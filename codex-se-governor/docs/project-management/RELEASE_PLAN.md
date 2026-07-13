# Release Plan

## Release Checklist

- [ ] Governance validators pass.
- [ ] Pytest passes.
- [ ] Smell baseline is current.
- [ ] Governance metrics JSON is reviewed.
- [ ] README adoption instructions are current.
- [ ] New templates are reflected in validators.
- [ ] Rollback plan is documented.

## v0.3 Deliverables

- Expanded traceability matrix.
- New validators.
- Metrics script.
- Smell baseline.
- Architecture docs.
- Project management docs.
- AI usage review template.
- Updated tests and CI.

## v0.4 Deliverables

- Version: v0.4.
- Milestone: full course section alignment.
- Deliverables: clean package validation, course coverage, glossary, context/process/elicitation/test/architecture templates, maintenance docs, and expanded validators.
- Owner: governor maintainer.
- Monitoring method: full local validation, CI validation, and governance metrics review.
- Risk: course outline extraction may need adjustment when the course source changes.
- Future iteration: packaged release automation and adoption manifest.

## v0.5 Deliverables

- Version: v0.5.
- Milestone: semantic traceability and release archive hardening.
- Target date or cadence: release after `run_full_validation.py` is stable.
- Deliverables: semantic course coverage, outline lock, side-effect validation, full validation orchestrator, clean release zip, test traceability validator, complexity threshold governance, process compliance report.
- Owner: governor maintainer.
- Monitoring method: full validation, metrics, package validation, and pytest.
- Acceptance/release criteria: full validation passes, archive validates, metrics show zero missing semantic coverage and clean package violations.
- Risk link: PR-003, PR-005, PR-006.
- Future iteration: signed release artifacts if distribution needs increase.

## Rollback Criteria

- Validator false positives block normal workflow.
- CI requires non-approved runtime dependencies.
- Adoption checker misses critical files or over-reports.
- v0.5 semantic or release gates produce non-actionable failures.

## Rollback Procedure

Revert the v0.4 commit set and restore v0.3 commands. No data migration is required because all artifacts are file-based.
