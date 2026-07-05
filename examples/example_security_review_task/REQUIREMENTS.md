# Requirements: Authentication Security Review

## Traceability ID

- Requirement set ID: LOGIN-RATE-LIMIT
- Task: Review the authentication flow for brute-force resistance, auditability, and AI-generated code risk.

## Stakeholders

| Stakeholder | Interest | Priority | Source |
|---|---|---|---|
| End user | Account protection without unnecessary lockout | High | Security requirement |
| Security team | Brute-force resistance and auditability | High | Threat review |
| Support team | Clear recovery path for locked users | Medium | Operations review |
| Product owner | Low-friction login experience | Medium | Product review |

## Problem Statement

The login system currently allows unlimited failed attempts, which increases brute-force and credential-stuffing risk.

## Functional Requirements

| ID | Requirement | Source | Acceptance Link | Status |
|---|---|---|---|---|
| FR-001 | Track failed login attempts per account identifier. | Security team | AC-001 | Approved |
| FR-002 | Temporarily block login after 5 failed attempts in 15 minutes. | Security team | AC-002 | Approved |
| FR-003 | Reset failed attempt count after successful login. | Product owner | AC-003 | Approved |
| FR-004 | Return a generic login error that does not reveal account existence. | Security team | AC-004 | Approved |
| FR-005 | Record security audit events for threshold reached and lockout expiry. | Security team | AC-005 | Approved |

## Non-functional Requirements

| ID | Attribute | Requirement | Measure | Verification |
|---|---|---|---|---|
| NFR-001 | Security | Resist basic online brute-force attempts. | Lockout activates at 5 failures per 15 minutes. | Unit/integration/security tests |
| NFR-002 | Usability | User receives recoverable error. | Message says to retry later or use recovery, without confirming account. | Acceptance test |
| NFR-003 | Reliability | Attempt tracking does not block unrelated accounts. | Attempts are scoped by account identifier and optional IP metadata. | Integration test |
| NFR-004 | Maintainability | Policy values are configurable named constants. | No unexplained numeric policy literals in login flow. | Code review |

## Constraints

- Must not expose whether username/email exists.
- Must not store raw passwords or sensitive tokens in logs.
- Must be reversible by disabling the rate-limit configuration.

## Assumptions

- Authentication service can store short-lived counters.
- Password verification remains unchanged.
- Account recovery flow already exists.

## Requirement Conflicts

| ID | Conflict | Resolution |
|---|---|---|
| RC-001 | Security wants strict lockout; product wants low friction. | Use temporary lockout and clear recovery guidance. |

## Acceptance Criteria

- AC-001: Given failed credentials, when login fails, then the failed-attempt counter increments for that account identifier.
- AC-002: Given 5 failed attempts within 15 minutes, when another login is attempted, then login is temporarily blocked.
- AC-003: Given previous failures below the threshold, when a valid login succeeds, then the counter resets.
- AC-004: Given any failed login, when an error is returned, then it uses a generic message.
- AC-005: Given threshold reached, when lockout is applied, then an audit event is recorded without sensitive data.
