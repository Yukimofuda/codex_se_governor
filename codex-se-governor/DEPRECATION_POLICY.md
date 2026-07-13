# Deprecation Policy

## Deprecation Process
- Announce deprecated artifacts in `CHANGELOG.md`.
- Keep deprecated artifacts for one minor version unless they create security risk.
- Provide replacement templates, validators, and migration notes.

## Upgrade Path
- Copy replacement artifact.
- Update CI and pre-commit references.
- Run `python3 scripts/check_adoption.py .`.

## Baseline Update Process
- Deprecated smell baseline entries must be marked `fixed` or removed when the source warning disappears.

## Adoption Migration
- Downstream repositories should adopt one validator group at a time: structure, templates, course coverage, then quality metrics.
- For v0.7, adopt the orchestrator last after semantic coverage, outline lock, complexity baseline, AI evidence scoring, task artifact validation, traceability graph validation, config validation, and evidence package scoring are present.

## Known Limitations
- Deprecation status is documented, not enforced by a dedicated registry.
- v0.7 release archives are zip-validated but not cryptographically signed.

## Rollback Strategy
- Restore the prior artifact from version control if migration causes unacceptable workflow breakage.
