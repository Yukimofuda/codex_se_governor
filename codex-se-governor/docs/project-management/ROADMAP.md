# Roadmap

## v0.1 Foundation

- Initial lifecycle rules.
- Basic docs and templates.
- Initial Skill and PR checklist.

## v0.2 Script-tested Governor

- Standard-library governance scripts.
- GitHub workflow and pre-commit.
- Example feature task.
- Pytest script-level tests.

## v0.3 Measurable Governance

- Subtopic traceability.
- Docs/template/Skill/adoption validators.
- Governance metrics.
- Smell baseline.
- Architecture and project management docs.
- AI usage review evidence.

## Future v0.4

- Optional coverage adapter.
- Optional language-specific static analysis packs.
- Versioned adoption manifest.
- Release packaging and changelog automation.

## v0.4 Full Course Alignment

- Version: v0.4.
- Milestone: full numbered course section coverage and clean package validation.
- Deliverables: course reference area, course coverage validator, clean package scripts, glossary, new templates, testing validators, AI review validator, maintenance docs.
- Owner: governor maintainer.
- Monitoring method: run full validation sequence and review governance metrics.
- Risk: stricter validators may block adopted repositories until they copy v0.4 artifacts.
- Rollback: restore the v0.3 validator list while keeping cleanup guidance.
- Future iteration: adoption manifest and optional language-specific analyzers.

## v0.5 Semantic And Release Hardening

- Version: v0.5.
- Milestone: semantic coverage, side-effect-free validation, and release package hardening.
- Target date or cadence: next minor release after v0.4 validation is stable.
- Deliverables: semantic coverage, outline lock, full validation orchestrator, release archive validation, test traceability, complexity baseline, AI/process task evidence.
- Owner: governor maintainer.
- Risk link: PR-003, PR-005, PR-006 in `docs/project-management/RISK_REGISTER.md`.
- Monitoring method: `run_full_validation.py`, governance metrics, and release archive validation.
- Acceptance/release criteria: all v0.5 validators pass and clean package metrics remain zero.
- Rollback criteria: disable new v0.5 gates if they block adoption without actionable remediation.
- Future iteration: optional adoption manifest and language-specific analyzers.
