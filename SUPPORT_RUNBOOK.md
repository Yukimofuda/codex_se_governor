# Support Runbook

## Triage
- Confirm the command that failed.
- Capture stdout and exit code.
- Identify the responsible artifact.

## Common Failures
| Failure | Likely cause | Recovery |
|---|---|---|
| Clean package validation fails | Generated local files are present | Run `python3 scripts/clean_artifacts.py` |
| Course coverage fails | New or changed course section is unmapped | Update `19_COURSE_SECTION_COVERAGE.md` |
| Semantic coverage fails | A course concept lacks concrete rule, artifact, depth, or evidence | Update `20_COURSE_SEMANTIC_COVERAGE.md` |
| Outline lock fails | Course source or extractor changed | Update lock intentionally after review |
| Release archive validation fails | Generated artifact entered zip | Run cleanup and rebuild with `package_release.py` |
| Outer archive validation fails | Finder or manual zip added `__MACOSX/` or caches | Repackage using `package_release.py`; validate the exact uploaded zip |
| Complexity threshold fails | Function exceeds threshold without baseline | Refactor or update complexity baseline with obligation |
| Template validation fails | Required field removed | Restore the field or update validator and template together |
| Smell baseline fails | New warning is untriaged | Fix warning or document triage |
| Task artifact validation fails | Generated task is missing lifecycle evidence | Regenerate scaffold or add missing task artifact |
| Traceability graph fails | Requirement, AC, risk, security, test, or final report link is missing | Add explicit IDs and downstream references |
| AI review evidence fails | AI review score is below threshold | Complete the missing AI review fields |
| Clean test wrapper fails | Pytest failed or left generated artifacts | Fix tests, rerun `run_tests_clean.py`, then validate clean package |

## Monitoring Method
- Run full local validation before release.
- Prefer `python3 scripts/run_full_validation.py`.
- Use `python3 scripts/run_tests_clean.py` for local pytest so cache artifacts are cleaned.
- Use `python3 scripts/validate_outer_archive.py /path/to/uploaded.zip` before distribution if another outer zip is created.
- Review governance metrics JSON for unexpected changes.

## Rollback Or Release Criteria
- Release only when all validators and pytest pass.
- Release archive must pass `validate_release_archive.py`.
- Roll back if a validator blocks normal adoption without clear remediation.

## Maintainer
- Owner: repository maintainer.
