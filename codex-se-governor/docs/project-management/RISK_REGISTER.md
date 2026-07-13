# Project Risk Register

| Risk ID | Description | Category | Probability | Impact | Exposure | Mitigation | Contingency | Residual risk | Trigger | Detection method | Review cadence | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PR-001 | Validators become too strict for adopted repos | Usability | Medium | Medium | Medium | Validate required minimum fields only | Relax validator rules with documented reason | Medium for downstream repos on older versions | Adoption issue reports increase | Issue review and adoption check output | Release | Governor maintainer | Open |
| PR-002 | Smell baseline becomes stale | Quality | Medium | Medium | Medium | CI baseline validator | Re-triage baseline during release | Low when baseline validator passes | New warning is untriaged | `validate_smell_baseline.py` | PR and release | Governor maintainer | Open |
| PR-003 | Traceability matrices grow hard to maintain | Maintainability | Medium | Low | Low | Split numeric and semantic coverage | Regenerate section coverage and update semantic clusters | Medium while course source changes | Coverage validator failure | Course coverage validators | Release | Governor maintainer | Open |
| PR-004 | Optional pytest install fails in CI | Tooling | Low | Medium | Low | Install only when tests exist | Document local install fallback | Low because runtime scripts avoid pytest dependency | CI pytest install failure | CI log review | PR | Maintainer | Open |
| PR-005 | Course outline extraction misses or over-detects sections | Traceability | Medium | Medium | Medium | Lock accepted outline and validate semantic coverage | Manually update extractor and outline lock | Medium when course source changes | Outline lock drift | `validate_course_outline_lock.py` | Course update | Governor maintainer | Open |
| PR-006 | Cleanup or packaging removes or omits real governance files | Safety | Low | High | Medium | Limit deletion and archive exclusion to generated artifact names | Restore from version control and narrow patterns | Low after archive validation | Missing required file in package | `se_gate.py` and `validate_release_archive.py` | Release | Governor maintainer | Open |

## Governance Fields

- Version: v0.5 risk register.
- Milestone: semantic coverage and release-package hardening.
- Deliverables: risk entries with residual risk, trigger, detection method, review cadence, owner, and status.
- Owner: governor maintainer.
- Monitoring method: run full validation and review metrics before release.
- Rollback: revert validators or packaging rules that create unsafe workflow impact.
- Future iteration: add optional machine-readable risk export if adoption scale justifies it.
