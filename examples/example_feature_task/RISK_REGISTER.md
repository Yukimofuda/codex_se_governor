# Risk Register: Login Failure Rate Limit

| Risk ID | Description | Category | Probability | Impact | Exposure | Mitigation | Contingency | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| R-001 | Attackers intentionally lock victim accounts | Security/Usability | Medium | Medium | Medium | Temporary lockout, audit, recovery path | Disable limiter or tune threshold | Security owner | Open |
| R-002 | Counter store outage changes login behavior | Reliability | Low | High | Medium | Monitor store, define fallback | Feature flag off | Platform owner | Open |
| R-003 | Error messages reveal account existence | Security | Low | High | Medium | Generic messages and tests | Revert messages and patch | Auth owner | Open |
| R-004 | Hard-coded policy values reduce maintainability | Maintainability | Medium | Low | Low | Named config constants | Refactor config | Maintainer | Open |
