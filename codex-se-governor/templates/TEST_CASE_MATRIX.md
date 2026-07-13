# Test Case Matrix

| Test ID | Requirement ID | Test Type | Input | Expected Output | Reason | Coverage | Status |
|---|---|---|---|---|---|---|---|
| TC-001 | FR-001 | Normal |  |  | Verifies main behavior | Statement/branch/acceptance | Planned |
| TC-002 | FR-001 | Boundary |  |  | Verifies boundary behavior | Boundary partition | Planned |
| TC-003 | FR-001 | Invalid |  |  | Verifies error handling | Negative path | Planned |
| TC-004 | NFR-001 | Security |  |  | Verifies abuse resistance | Security case | Planned |
| TC-005 | FR-001 | Regression |  |  | Protects existing behavior | Regression | Planned |

## Test Type Guidance

- Normal: expected successful behavior.
- Boundary: minimum, maximum, empty, full, time-window, or limit behavior.
- Invalid: malformed, missing, unauthorized, or impossible input.
- Security: abuse, trust boundary, injection, secret, auth, or privacy case.
- Regression: existing behavior that must not change.
- Failure: dependency outage, timeout, exception, or degraded mode.

## Coverage Guidance

Use statement, branch, condition, path, acceptance, mutation, or manual-review coverage labels. For complex branching, record cyclomatic complexity or explain why path coverage is not practical.

## Traceability Rule

Every test row should point to a requirement, acceptance criterion, risk, or defect ID.
