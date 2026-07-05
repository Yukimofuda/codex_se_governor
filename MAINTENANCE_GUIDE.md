# Maintenance Guide

## Baseline Update Process
1. Run `python3 scripts/scan_for_engineering_smells.py`.
2. Review every warning.
3. Fix defects where practical.
4. Add only justified residual warnings to `docs/quality/SMELL_BASELINE.md`.
5. Run `python3 scripts/validate_smell_baseline.py`.
6. Run `python3 scripts/validate_smell_baseline_sync.py`.

## Course Reference Update Process
1. Replace `references/course/软件工程全整理.md`.
2. Run `python3 scripts/extract_course_outline.py`.
3. Update `docs/software-engineering/COURSE_OUTLINE_LOCK.json` intentionally.
4. Update `docs/software-engineering/19_COURSE_SECTION_COVERAGE.md`.
5. Update `docs/software-engineering/20_COURSE_SEMANTIC_COVERAGE.md`.
6. Ensure semantic coverage uses concrete rule clusters, existing artifact paths, enforcement methods, and coverage depth.
7. Run `python3 scripts/validate_course_outline_lock.py`.
8. Run `python3 scripts/validate_course_coverage.py`.
9. Run `python3 scripts/validate_course_semantic_coverage.py`.

## Release Package Process
1. Run `python3 scripts/run_full_validation.py`.
2. Run `python3 scripts/run_tests_clean.py`.
3. Run `python3 scripts/package_release.py`.
4. Run `python3 scripts/validate_release_archive.py dist/codex-se-governor-v0.7.zip`.
5. Run `python3 scripts/validate_outer_archive.py dist/codex-se-governor-v0.7.zip`.
6. Review `python3 scripts/governance_metrics.py`.
7. Follow `docs/release/RELEASE_PACKAGING_GUIDE.md`; do not use manual macOS archive tools.

## Complexity Baseline Process
1. Run `python3 scripts/complexity_report.py`.
2. Run `python3 scripts/validate_complexity_thresholds.py`.
3. Add exceptions only to `docs/quality/COMPLEXITY_BASELINE.md` with owner, rationale, refactoring/test obligation, review date, target version, issue/follow-up ID, and trend.
4. Complexity greater than 20 requires temporary-exception status, a target version, and an explicit refactoring plan.

## Upgrade Path
- Review `CHANGELOG.md`.
- Run validators locally.
- Enable CI only after local pass.

## Support Process
- Reproduce with the exact validation command.
- Identify whether failure is artifact missing, field missing, coverage missing, or warning untriaged.
- File an issue using the closest GitHub issue template.

## Known Limitations
- Validators inspect structure and traceability evidence; they do not prove semantic correctness.
- Semantic coverage is clustered by engineering concept; it does not replace detailed course reading.

## Rollback Strategy
- Revert the failing validator or template addition.
- Keep generated cleanup and package hygiene checks unless they are the direct cause.
