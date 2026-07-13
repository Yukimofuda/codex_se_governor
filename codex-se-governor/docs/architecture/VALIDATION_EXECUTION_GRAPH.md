# Validation Execution Graph

## Purpose

Define the acyclic command and evidence flow for v0.7.2. Validators produce evidence once; metrics and reports consume persisted results without starting validation again.

## Modes

| Mode | Intended use | Test scope | Packaging | Configured total timeout |
|---|---|---|---|---:|
| fast | local development and pre-commit | unit | none | 60 seconds |
| standard | pull requests and default CLI | unit + integration | none | 180 seconds |
| release | release/tag CI | unit + integration + e2e | exact release + compatibility alias | 600 seconds |

Source packaging is a separate release-boundary command after release validation. This keeps the source archive hash out of the archive itself and avoids packaging recursion.

## Command DAG

```text
run_full_validation(mode)
  -> core validators once
  -> score generators once
       -> dist/semantic-coverage-score.json
       -> dist/evidence-package-score.json
       -> dist/complexity-report.json
       -> dist/ai-review-score.json
  -> isolated pytest suite once
       -> dist/test-timing-<suite>.json
  -> validate_test_performance reads timing only
  -> rolling dist/validation-results.json
  -> governance_metrics reads repository + manifest + score files
  -> maturity report reads metrics in-process
  -> release mode: package_release -> archive validators
  -> final cleanup and clean-package check

package_source
  -> dist/codex-se-governor-source-v0.7.2.zip
  -> dist/RELEASE_MANIFEST.json update
  -> validate_source_archive
```

## Result Ownership

| Artifact | Producer | Consumers |
|---|---|---|
| `dist/validation-results.json` | `run_full_validation.py` | metrics, maturity, reviewers |
| `dist/*-score.json` | score scripts | score validators, metrics, maturity |
| `dist/test-timing-*.json` | `run_tests_clean.py` or release orchestrator | `validate_test_performance.py` |
| `dist/RELEASE_MANIFEST.json` | package scripts | release/source validators, release reviewers |
| `COURSE_PROVENANCE.json` | maintainer review | provenance validator, release reviewers |

## Isolation And Timeout

- Every pytest child receives `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1` and `PYTHONDONTWRITEBYTECODE=1`.
- Every orchestrated subprocess starts in its own process group.
- Timeout sends TERM to the process group, then KILL if it does not exit.
- A timeout or failure is written to the validation manifest before the orchestrator returns.

## Prohibited Edges

- Metrics must not call validators, pytest, the orchestrator, or maturity generation.
- Maturity generation must not call validators or pytest.
- Performance validation must not start pytest.
- E2E tests must not invoke release validation from inside release validation.
- CI must not repeat release work already completed by the selected validation mode.
