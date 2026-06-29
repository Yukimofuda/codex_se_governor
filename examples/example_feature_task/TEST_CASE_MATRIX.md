# Test Case Matrix: Login Failure Rate Limit

| Test ID | Requirement ID | Test Type | Input | Expected Output | Reason | Coverage | Status |
|---|---|---|---|---|---|---|---|
| TC-001 | FR-001 | Unit | 1 failed login | Counter becomes 1 | Verify tracking | Normal branch | Planned |
| TC-002 | FR-002 | Integration | 5 failed logins in 15 min | Next attempt blocked | Verify threshold | Boundary branch | Planned |
| TC-003 | FR-003 | Integration | 2 failures then valid password | Counter cleared | Verify reset | Success branch | Planned |
| TC-004 | NFR-002 | Acceptance | Locked account login | Generic retry-later message | User recovery | UX case | Planned |
| TC-005 | FR-002 | Boundary | Attempt after lockout expiry | Login evaluated normally | Verify expiry | Time boundary | Planned |
| TC-006 | FR-004 | Security | Unknown account and wrong password | Same generic error style | Prevent enumeration | Security case | Planned |
| TC-007 | NFR-003 | Failure | Counter store unavailable | Configured safe behavior and alert | Reliability | Failure path | Planned |
| TC-008 | FR-005 | Security | Threshold reached | Audit event has no password | Protect sensitive data | Logging review | Planned |
| TC-009 | FR-002 | Regression | Valid login with no failures | Login succeeds | Preserve behavior | Regression | Planned |
