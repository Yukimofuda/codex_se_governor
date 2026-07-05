# Risk Register: Authentication Security Review

| Risk ID | Description | Category | Probability | Impact | Exposure | Mitigation | Contingency | Residual risk | Trigger | Detection method | Review cadence | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| R-001 | Attackers intentionally lock victim accounts | Security/Usability | Medium | Medium | Medium | Temporary lockout, audit, recovery path | Disable limiter or tune threshold | Low after support monitoring | Lockout complaints exceed baseline | Support ticket review | PR and post-release | Security owner | Open |
| R-002 | Counter store outage changes login behavior | Reliability | Low | High | Medium | Monitor store, define fallback | Feature flag off | Medium until target infrastructure is known | Counter store unavailable | Alert and failure-path test | PR and release | Platform owner | Open |
| R-003 | Error messages reveal account existence | Security | Low | High | Medium | Generic messages and tests | Revert messages and patch | Low after security tests | Error text differs by account existence | Security test and review | PR and release | Auth owner | Open |
| R-004 | Hard-coded policy values reduce maintainability | Maintainability | Medium | Low | Low | Named config constants | Refactor config | Low after code review | Magic policy literal appears | Code review and smell scan | PR | Maintainer | Open |
