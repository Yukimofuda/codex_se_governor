# Milestones

| Milestone | Deliverables | Completion Evidence | Risk Buffer |
|---|---|---|---|
| M1 v0.1 Foundation | AGENTS, docs, templates, Skill | Required files exist | Manual review |
| M2 v0.2 Script Testing | governance scripts, CI, pytest tests | `python3 -m pytest` passes | Script fixes |
| M3 v0.3 Auditability | validators, metrics, baseline, architecture/project docs | all validator commands pass | baseline triage |
| M4 v0.4 Packaging | adoption manifest, optional analyzers, release notes | adoption check plus release checklist | compatibility review |
| M5 v0.5 Release Hardening | semantic coverage, outline lock, full validation, clean zip | `run_full_validation.py` and archive validation pass | package compatibility review |

## Monitoring Method

- Run governance validators on every PR.
- Review metrics before release.
- Review smell baseline before merge.
- Review open risks during retrospective.

## Governance Fields

- Version: v0.4 milestones are tracked in this table and in `CHANGELOG.md`.
- Owner: governor maintainer.
- Risk: milestone scope can expand beyond lightweight governance.
- Rollback: defer a milestone validator if it blocks release without improving auditability.
- Future iteration: split long-running adoption work into v0.5 milestones.
- Target date or cadence: every minor release reviews this milestone table.
- Acceptance/release criteria: milestone evidence command passes before release.
- Risk link: see project risk register.
