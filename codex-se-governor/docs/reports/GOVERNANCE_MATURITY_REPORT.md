# Governor Capability Maturity Report

## Purpose

This report scores the governor's validation capabilities. It does not claim that an adopting project's real requirements, architecture, security, or delivery process are mature.

## Governor Capability Maturity

| Capability | Score | Status | Independent evidence signals |
|---|---:|---|---|
| Requirements and traceability capability | 5 | PASS | templates=pass; test traceability=pass |
| Analysis and design capability | 5 | PASS | task artifacts=pass; traceability graph=pass |
| Testing capability | 5 | PASS | pytest isolation=pass; unit tests=pass; integration tests=pass |
| Security and AI capability | 5 | PASS | AI template=pass; AI evidence=pass |
| Risk and project capability | 5 | PASS | project management=pass; template contract=pass |
| Course traceability capability | 5 | PASS | source lock=pass; outline lock=pass; semantic coverage=pass |
| Release and maintenance capability | 5 | PASS | configuration=pass; clean package=pass; maintenance docs=pass |

## Adoption Readiness

| Readiness area | Score | Status | Independent evidence signals |
|---|---:|---|---|
| Core adoption readiness | 5 | PASS | SE gate=pass; Skill=pass; configuration=pass |
| Local development readiness | 5 | PASS | pytest isolation=pass; unit tests=pass |

## Active Task And Package Maturity

| Evidence area | Score | Status | Independent evidence signals |
|---|---:|---|---|
| Active task evidence maturity | 5 | PASS | task artifacts=pass; evidence score=pass |
| Release package maturity | unknown | UNKNOWN | release archive=pass; source archive=unknown |

## Unavailable Evidence

- source archive validation

## Evidence Provenance

- Validation mode: `release`.
- Validation result source: `present`.
- Semantic score is cached evidence: `98`.
- Evidence package average is cached evidence: `100.0`.
- Missing evidence remains `unknown`; it is never promoted to a passing score.

## Residual Risks

- Capability evidence proves governor behavior, not correctness of an adopting product.
- Semantic mappings and course provenance still require accountable human review.
- Runtime security, fairness, and mutation effectiveness need project-specific tools and data.
