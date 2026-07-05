# Test Case Matrix: Login Failure Module Refactor

| Test ID | Requirement ID | Test Type | Input | Expected Output | Reason | Coverage | Status |
|---|---|---|---|---|---|---|---|
| TC-001 | FR-001 | Unit | 1 failed login | Counter becomes 1 | Verify tracking | Normal branch; AC-001 | Planned |
| TC-002 | FR-002 | Integration | 5 failed logins in 15 min | Next attempt blocked | Verify threshold | Boundary branch; AC-002 | Planned |
| TC-003 | FR-003 | Integration | 2 failures then valid password | Counter cleared | Verify reset | Success branch; AC-003 | Planned |
| TC-004 | NFR-002 | Acceptance | Locked account login | Generic retry-later message | User recovery | UX case; AC-004 | Planned |
| TC-005 | FR-002 | Boundary | Attempt after lockout expiry | Login evaluated normally | Verify expiry | Time boundary; AC-002 | Planned |
| TC-006 | FR-004 | Security | Unknown account and wrong password | Same generic error style | Prevent enumeration | Security case; AC-004 | Planned |
| TC-007 | NFR-003 | Failure | Counter store unavailable | Configured safe behavior and alert | Reliability | Failure path | Planned |
| TC-008 | FR-005 | Security | Threshold reached | Audit event has no password | Protect sensitive data | Logging review; AC-005 | Planned |
| TC-009 | FR-002 | Regression | Valid login with no failures | Login succeeds | Preserve behavior | Regression | Planned |
| TC-010 | FR-001 | Invalid | Missing username or malformed request | Request rejected without counter corruption | Verify invalid input handling | Invalid input | Planned |
| TC-011 | NFR-001 | Security | Brute-force sequence over threshold | Lockout activates at configured threshold | Verify brute-force resistance measure | Security measure; AC-002 | Planned |
| TC-012 | NFR-004 | Review | Login policy constants | Named configuration values are used | Verify maintainability policy | Code review coverage | Planned |
