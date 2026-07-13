# Quality Attribute Trade-offs

| Attribute | Governor Choice | Benefit | Trade-off | Evidence |
|---|---|---|---|---|
| Maintainability | Small standard-library scripts | Easy to read and port | Repeated simple validation code | Script tests |
| Portability | No runtime third-party dependencies | Works in most repos | Less advanced static analysis | CI and local commands |
| Auditability | Markdown traceability and templates | Human-readable evidence | Requires structure validators | v0.3 validators |
| Reliability | Deterministic PASS/FAIL validators | Stable CI behavior | Some checks are shallow | pytest subprocess tests |
| Security | Dangerous text scan and security templates | Catches obvious unsafe text | Not a full SAST tool | Smell baseline and review |
| Adoption usability | Copyable files and checker | Low setup burden | Version drift possible | `check_adoption.py` |

## Over-engineering Risks

- Avoid plugin frameworks until multiple repos prove a need.
- Avoid database or server state; the governor should remain file-based.
- Avoid deep language analyzers in core; keep those optional adapters.

## Quality Scenario Examples

- When a docs chapter loses `Checklist`, CI fails with the missing heading.
- When a template loses `Rollback`, CI fails with the missing field.
- When a new smell warning appears, baseline validation fails until triaged.
- When a target repo misses the PR template, adoption check fails.

